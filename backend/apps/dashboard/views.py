from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from datetime import datetime, timedelta
from apps.employees.models import Employee
from apps.suppliers.models import Supplier
from apps.categories.models import Category
from apps.products.models import Product
from apps.sales.models import Sale, SaleItem

@api_view(['GET'])
def dashboard_stats(request):
    # Basic counts
    total_employees = Employee.objects.count()
    total_suppliers = Supplier.objects.count()
    total_categories = Category.objects.count()
    total_products = Product.objects.count()
    total_sales = Sale.objects.count()
    
    # Revenue calculations
    total_revenue = Sale.objects.aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    # Today's stats
    today = timezone.now().date()
    today_sales = Sale.objects.filter(created_at__date=today).count()
    today_revenue = Sale.objects.filter(
        created_at__date=today
    ).aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    # This week's stats
    week_start = today - timedelta(days=today.weekday())
    week_sales = Sale.objects.filter(created_at__date__gte=week_start).count()
    week_revenue = Sale.objects.filter(
        created_at__date__gte=week_start
    ).aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    # This month's stats
    month_start = today.replace(day=1)
    month_sales = Sale.objects.filter(created_at__date__gte=month_start).count()
    month_revenue = Sale.objects.filter(
        created_at__date__gte=month_start
    ).aggregate(
        total=Sum('net_amount')
    )['total'] or 0
    
    # Inventory alerts
    low_stock_count = Product.objects.filter(
        quantity__lte=10,
        status='active'
    ).count()
    
    out_of_stock_count = Product.objects.filter(
        quantity=0,
        status='active'
    ).count()
    
    # Top selling products (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    top_products = SaleItem.objects.filter(
        sale__created_at__gte=thirty_days_ago
    ).values(
        'product__name'
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum(F('quantity') * F('unit_price'))
    ).order_by('-total_sold')[:5]
    
    # Sales trend (last 7 days)
    recent_sales = []
    for i in range(7):
        date = today - timedelta(days=i)
        daily_stats = Sale.objects.filter(created_at__date=date).aggregate(
            daily_sales=Count('id'),
            daily_revenue=Sum('net_amount')
        )
        recent_sales.append({
            'created_at__date': date.strftime('%Y-%m-%d'),
            'daily_sales': daily_stats['daily_sales'] or 0,
            'daily_revenue': float(daily_stats['daily_revenue'] or 0)
        })
    
    # Category distribution
    category_stats = Product.objects.values(
        'category__name'
    ).annotate(
        product_count=Count('id'),
        total_value=Sum(F('price') * F('quantity'))
    ).order_by('-product_count')
    
    # Employee performance (sales by employee)
    employee_performance = Sale.objects.filter(
        created_by__isnull=False,
        created_at__date__gte=month_start
    ).values(
        'created_by__username'
    ).annotate(
        sales_count=Count('id'),
        total_revenue=Sum('net_amount')
    ).order_by('-total_revenue')[:5]
    
    return Response({
        'overview': {
            'total_employees': total_employees,
            'total_suppliers': total_suppliers,
            'total_categories': total_categories,
            'total_products': total_products,
            'total_sales': total_sales,
        },
        'revenue': {
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'week_revenue': float(week_revenue),
            'month_revenue': float(month_revenue),
        },
        'sales_stats': {
            'today_sales': today_sales,
            'week_sales': week_sales,
            'month_sales': month_sales,
        },
        'inventory_alerts': {
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        },
        'recent_sales_chart': list(reversed(recent_sales)),
        'top_products': list(top_products),
        'category_distribution': list(category_stats),
        'employee_performance': list(employee_performance)
    })

@api_view(['GET'])
def recent_activities(request):
    # Get recent sales
    recent_sales = Sale.objects.select_related('created_by').order_by('-created_at')[:15]
    
    # Get recent product additions
    recent_products = Product.objects.order_by('-created_at')[:10]
    
    activities = []
    
    # Add sales activities
    for sale in recent_sales:
        activities.append({
            'type': 'sale',
            'icon': 'shopping_cart',
            'title': f"Sale #{sale.invoice_number}",
            'description': f"Sale to {sale.customer_name}",
            'amount': float(sale.net_amount),
            'created_at': sale.created_at,
            'created_by': sale.created_by.username if sale.created_by else 'System'
        })
    
    # Add product activities
    for product in recent_products:
        activities.append({
            'type': 'product',
            'icon': 'inventory',
            'title': f"Product Added",
            'description': f"{product.name} added to inventory",
            'amount': float(product.price),
            'created_at': product.created_at,
            'created_by': 'System'
        })
    
    # Sort by creation time
    activities.sort(key=lambda x: x['created_at'], reverse=True)
    
    return Response(activities[:20])  # Return top 20 activities

@api_view(['GET'])
def inventory_summary(request):
    # Product statistics
    product_stats = Product.objects.aggregate(
        total_products=Count('id'),
        active_products=Count('id', filter=Q(status='active')),
        total_inventory_value=Sum(F('price') * F('quantity')),
        avg_product_price=Avg('price')
    )
    
    # Low stock products
    low_stock_products = Product.objects.filter(
        quantity__lte=10,
        status='active'
    ).values('name', 'quantity', 'price').order_by('quantity')[:10]
    
    # Category-wise inventory
    category_inventory = Product.objects.values(
        'category__name'
    ).annotate(
        total_products=Count('id'),
        total_quantity=Sum('quantity'),
        total_value=Sum(F('price') * F('quantity'))
    ).order_by('-total_value')
    
    return Response({
        'product_statistics': product_stats,
        'low_stock_products': list(low_stock_products),
        'category_inventory': list(category_inventory)
    })