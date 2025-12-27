from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleListSerializer

class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.select_related('created_by').prefetch_related('items').all()
    serializer_class = SaleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'customer_name', 'customer_contact']
    filterset_fields = ['created_by']
    ordering_fields = ['created_at', 'total_amount', 'net_amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SaleListSerializer
        return SaleSerializer
    
    def perform_create(self, serializer):
        # Generate invoice number
        today = timezone.now()
        invoice_number = f"INV{today.strftime('%Y%m%d%H%M%S')}"
        serializer.save(
            created_by=self.request.user,
            invoice_number=invoice_number
        )

class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sale.objects.select_related('created_by').prefetch_related('items__product').all()
    serializer_class = SaleSerializer
    lookup_field = 'id'

@api_view(['GET'])
def sales_stats(request):
    total_sales = Sale.objects.count()
    today_sales = Sale.objects.filter(created_at__date=timezone.now().date()).count()
    
    # Revenue calculations
    total_revenue = Sale.objects.aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    today_revenue = Sale.objects.filter(
        created_at__date=timezone.now().date()
    ).aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    # This month's sales
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_sales = Sale.objects.filter(created_at__gte=month_start).count()
    month_revenue = Sale.objects.filter(
        created_at__gte=month_start
    ).aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    return Response({
        'total_sales': total_sales,
        'today_sales': today_sales,
        'month_sales': month_sales,
        'total_revenue': total_revenue,
        'today_revenue': today_revenue,
        'month_revenue': month_revenue
    })

@api_view(['GET'])
def sales_report(request):
    # Get date range from query params
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    queryset = Sale.objects.select_related('created_by').prefetch_related(
        'items__product__category', 'items__product__supplier'
    ).all()
    
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        queryset = queryset.filter(created_at__date__gte=start_date)
    
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        queryset = queryset.filter(created_at__date__lte=end_date)
    
    # Daily aggregated data
    daily_data = queryset.values('created_at__date').annotate(
        daily_sales=Count('id'),
        daily_revenue=Sum('net_amount'),
        daily_discount=Sum('discount_amount'),
        daily_total_before_discount=Sum('total_amount')
    ).order_by('created_at__date')
    
    # Detailed sales data
    detailed_sales = []
    for sale in queryset.order_by('-created_at'):
        sale_data = {
            'id': sale.id,
            'invoice_number': sale.invoice_number,
            'customer_name': sale.customer_name,
            'customer_contact': sale.customer_contact,
            'created_by': sale.created_by.get_full_name() if sale.created_by else 'Unknown',
            'created_at': sale.created_at.isoformat(),
            'total_amount': float(sale.total_amount),
            'discount_percentage': float(sale.discount_percentage),
            'discount_amount': float(sale.discount_amount),
            'net_amount': float(sale.net_amount),
            'total_cost': float(sale.total_cost),
            'total_profit': float(sale.total_profit),
            'profit_margin': float(sale.profit_margin_percentage),
            'items': []
        }
        
        for item in sale.items.all():
            item_data = {
                'product_name': item.product.name,
                'product_code': item.product.code,
                'category': item.product.category.name if item.product.category else 'N/A',
                'supplier': item.product.supplier.name if item.product.supplier else 'N/A',
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'unit_cost': float(item.unit_cost),
                'total_price': float(item.total_price),
                'total_cost': float(item.total_cost),
                'profit': float(item.profit),
                'profit_margin': float(item.profit_margin_percentage)
            }
            sale_data['items'].append(item_data)
        
        detailed_sales.append(sale_data)
    
    # Summary statistics
    total_sales = queryset.count()
    total_revenue = queryset.aggregate(Sum('net_amount'))['net_amount__sum'] or 0
    total_discount = queryset.aggregate(Sum('discount_amount'))['discount_amount__sum'] or 0
    total_before_discount = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_profit = queryset.aggregate(Sum('total_profit'))['total_profit__sum'] or 0
    total_cost = queryset.aggregate(Sum('total_cost'))['total_cost__sum'] or 0
    
    # Product performance with profit
    from django.db.models import F
    product_performance = SaleItem.objects.filter(
        sale__in=queryset
    ).values(
        'product__name', 'product__code', 'product__category__name'
    ).annotate(
        total_quantity_sold=Sum('quantity'),
        total_revenue=Sum('total_price'),
        total_profit=Sum('profit'),
        total_cost=Sum('total_cost'),
        sales_count=Count('sale', distinct=True)
    ).order_by('-total_revenue')[:10]
    
    # Category performance with profit
    category_performance = SaleItem.objects.filter(
        sale__in=queryset
    ).values(
        'product__category__name'
    ).annotate(
        total_quantity_sold=Sum('quantity'),
        total_revenue=Sum('total_price'),
        total_profit=Sum('profit'),
        total_cost=Sum('total_cost'),
        sales_count=Count('sale', distinct=True)
    ).order_by('-total_revenue')
    
    # Employee performance with profit
    employee_performance = queryset.values(
        'created_by__first_name', 'created_by__last_name', 'created_by__username'
    ).annotate(
        total_sales=Count('id'),
        total_revenue=Sum('net_amount'),
        total_profit=Sum('total_profit'),
        total_cost=Sum('total_cost')
    ).order_by('-total_revenue')
    
    return Response({
        'daily_data': list(daily_data),
        'detailed_sales': detailed_sales,
        'summary': {
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'total_discount': float(total_discount),
            'total_before_discount': float(total_before_discount),
            'total_profit': float(total_profit),
            'total_cost': float(total_cost),
            'profit_margin': float((total_profit / total_cost) * 100) if total_cost > 0 else 0,
            'average_sale_value': float(total_revenue / total_sales) if total_sales > 0 else 0,
            'average_discount_percentage': float((total_discount / total_before_discount) * 100) if total_before_discount > 0 else 0
        },
        'product_performance': list(product_performance),
        'category_performance': list(category_performance),
        'employee_performance': list(employee_performance)
    })