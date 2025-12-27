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
    
    # Revenue and profit calculations
    revenue_stats = Sale.objects.aggregate(
        total_revenue=Sum('net_amount'),
        total_profit=Sum('total_profit'),
        total_cost=Sum('total_cost')
    )
    
    # Today's stats
    today = timezone.now().date()
    today_stats = Sale.objects.filter(created_at__date=today).aggregate(
        today_sales=Count('id'),
        today_revenue=Sum('net_amount'),
        today_profit=Sum('total_profit'),
        today_cost=Sum('total_cost')
    )
    
    # This week's stats
    week_start = today - timedelta(days=today.weekday())
    week_stats = Sale.objects.filter(created_at__date__gte=week_start).aggregate(
        week_sales=Count('id'),
        week_revenue=Sum('net_amount'),
        week_profit=Sum('total_profit'),
        week_cost=Sum('total_cost')
    )
    
    # This month's stats
    month_start = today.replace(day=1)
    month_stats = Sale.objects.filter(created_at__date__gte=month_start).aggregate(
        month_sales=Count('id'),
        month_revenue=Sum('net_amount'),
        month_profit=Sum('total_profit'),
        month_cost=Sum('total_cost')
    )
    
    # Inventory analytics - calculate using database fields
    inventory_stats = Product.objects.aggregate(
        inventory_value_cost=Sum(F('buy_price') * F('quantity')),
        inventory_value_sell=Sum(F('sell_price') * F('quantity')),
        potential_profit=Sum((F('sell_price') - F('buy_price')) * F('quantity')),
        avg_profit_margin=Avg((F('sell_price') - F('buy_price')) / F('buy_price') * 100)
    )
    
    # Inventory alerts
    low_stock_count = Product.objects.filter(
        quantity__lte=10,
        status='active'
    ).count()
    
    out_of_stock_count = Product.objects.filter(
        quantity=0,
        status='active'
    ).count()
    
    # Top selling products by profit (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    top_profit_products = SaleItem.objects.filter(
        sale__created_at__gte=thirty_days_ago
    ).values(
        'product__name', 'product__code'
    ).annotate(
        total_profit=Sum('profit'),
        total_sold=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_profit')[:5]
    
    # Sales trend with profit (last 7 days)
    recent_sales = []
    for i in range(7):
        date = today - timedelta(days=i)
        daily_stats = Sale.objects.filter(created_at__date=date).aggregate(
            daily_sales=Count('id'),
            daily_revenue=Sum('net_amount'),
            daily_profit=Sum('total_profit'),
            daily_cost=Sum('total_cost')
        )
        recent_sales.append({
            'date': date.strftime('%Y-%m-%d'),
            'sales': daily_stats['daily_sales'] or 0,
            'revenue': float(daily_stats['daily_revenue'] or 0),
            'profit': float(daily_stats['daily_profit'] or 0),
            'cost': float(daily_stats['daily_cost'] or 0)
        })
    
    # Category profit distribution
    category_profits = SaleItem.objects.filter(
        sale__created_at__gte=thirty_days_ago
    ).values(
        'product__category__name'
    ).annotate(
        total_profit=Sum('profit'),
        total_revenue=Sum('total_price'),
        product_count=Count('product', distinct=True)
    ).order_by('-total_profit')
    
    # Employee performance by profit
    employee_performance = Sale.objects.filter(
        created_by__isnull=False,
        created_at__date__gte=month_start
    ).values(
        'created_by__username', 'created_by__first_name', 'created_by__last_name'
    ).annotate(
        sales_count=Count('id'),
        total_revenue=Sum('net_amount'),
        employee_total_profit=Sum('total_profit'),
        avg_profit_per_sale=Avg('total_profit')
    ).order_by('-employee_total_profit')[:5]
    
    # Calculate profit margins
    total_profit_margin = 0
    if revenue_stats['total_cost'] and revenue_stats['total_cost'] > 0:
        total_profit_margin = (revenue_stats['total_profit'] / revenue_stats['total_cost']) * 100
    
    return Response({
        'overview': {
            'total_employees': total_employees,
            'total_suppliers': total_suppliers,
            'total_categories': total_categories,
            'total_products': total_products,
            'total_sales': total_sales,
        },
        'revenue': {
            'total_revenue': float(revenue_stats['total_revenue'] or 0),
            'today_revenue': float(today_stats['today_revenue'] or 0),
            'week_revenue': float(week_stats['week_revenue'] or 0),
            'month_revenue': float(month_stats['month_revenue'] or 0),
        },
        'profit': {
            'total_profit': float(revenue_stats['total_profit'] or 0),
            'today_profit': float(today_stats['today_profit'] or 0),
            'week_profit': float(week_stats['week_profit'] or 0),
            'month_profit': float(month_stats['month_profit'] or 0),
            'profit_margin': float(total_profit_margin),
        },
        'cost': {
            'total_cost': float(revenue_stats['total_cost'] or 0),
            'today_cost': float(today_stats['today_cost'] or 0),
            'week_cost': float(week_stats['week_cost'] or 0),
            'month_cost': float(month_stats['month_cost'] or 0),
        },
        'sales_stats': {
            'today_sales': today_stats['today_sales'] or 0,
            'week_sales': week_stats['week_sales'] or 0,
            'month_sales': month_stats['month_sales'] or 0,
        },
        'inventory': {
            'value_cost': float(inventory_stats['inventory_value_cost'] or 0),
            'value_sell': float(inventory_stats['inventory_value_sell'] or 0),
            'potential_profit': float(inventory_stats['potential_profit'] or 0),
            'avg_profit_margin': float(inventory_stats['avg_profit_margin'] or 0),
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        },
        'charts': {
            'recent_sales': list(reversed(recent_sales)),
            'top_profit_products': list(top_profit_products),
            'category_profits': list(category_profits),
            'employee_performance': list(employee_performance)
        }
    })

@api_view(['GET'])
def recent_activities(request):
    # Get recent sales
    recent_sales = Sale.objects.select_related('created_by').order_by('-created_at')[:15]
    
    # Get recent product additions
    recent_products = Product.objects.order_by('-created_at')[:10]
    
    activities = []
    
    # Add sales activities with profit info
    for sale in recent_sales:
        profit_info = f" | Profit: ₹{sale.total_profit:.2f}" if sale.total_profit else ""
        activities.append({
            'type': 'sale',
            'icon': 'shopping_cart',
            'title': f"Sale #{sale.invoice_number}",
            'description': f"Sale to {sale.customer_name} | Revenue: ₹{sale.net_amount:.2f}{profit_info}",
            'amount': float(sale.net_amount),
            'profit': float(sale.total_profit or 0),
            'created_at': sale.created_at,
            'created_by': sale.created_by.username if sale.created_by else 'System'
        })
    
    # Add product activities
    for product in recent_products:
        potential_profit = (product.sell_price - product.buy_price) * product.quantity if product.sell_price and product.buy_price else 0
        profit_potential = f" | Potential Profit: ₹{potential_profit:.2f}" if potential_profit else ""
        activities.append({
            'type': 'product',
            'icon': 'inventory',
            'title': f"Product Added",
            'description': f"{product.name} added to inventory{profit_potential}",
            'amount': float(product.sell_price if product.sell_price else product.price),
            'created_at': product.created_at,
            'created_by': 'System'
        })
    
    # Sort by creation time
    activities.sort(key=lambda x: x['created_at'], reverse=True)
    
    return Response(activities[:20])

@api_view(['GET'])
def inventory_summary(request):
    # Product statistics with profit analysis - calculate using database fields
    product_stats = Product.objects.aggregate(
        total_products=Count('id'),
        active_products=Count('id', filter=Q(status='active')),
        total_inventory_value_cost=Sum(F('buy_price') * F('quantity')),
        total_inventory_value_sell=Sum(F('sell_price') * F('quantity')),
        total_potential_profit=Sum((F('sell_price') - F('buy_price')) * F('quantity')),
        avg_profit_margin=Avg((F('sell_price') - F('buy_price')) / F('buy_price') * 100)
    )
    
    # Low stock products with profit info - use database fields
    low_stock_products = Product.objects.filter(
        quantity__lte=10,
        status='active'
    ).annotate(
        profit_per_unit=F('sell_price') - F('buy_price')
    ).values(
        'name', 'code', 'quantity', 'buy_price', 'sell_price', 'profit_per_unit'
    ).order_by('quantity')[:10]
    
    # Category-wise inventory with profit analysis - use database fields
    category_inventory = Product.objects.values(
        'category__name'
    ).annotate(
        total_products=Count('id'),
        total_quantity=Sum('quantity'),
        total_value_cost=Sum(F('buy_price') * F('quantity')),
        total_value_sell=Sum(F('sell_price') * F('quantity')),
        potential_profit=Sum((F('sell_price') - F('buy_price')) * F('quantity'))
    ).order_by('-potential_profit')
    
    return Response({
        'product_statistics': {
            'total_products': product_stats['total_products'],
            'active_products': product_stats['active_products'],
            'inventory_value_cost': float(product_stats['total_inventory_value_cost'] or 0),
            'inventory_value_sell': float(product_stats['total_inventory_value_sell'] or 0),
            'potential_profit': float(product_stats['total_potential_profit'] or 0),
            'avg_profit_margin': float(product_stats['avg_profit_margin'] or 0)
        },
        'low_stock_products': list(low_stock_products),
        'category_inventory': list(category_inventory)
    })

@api_view(['GET'])
def profit_analytics(request):
    """Detailed profit analytics endpoint"""
    
    # Date range filter
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # Daily profit data
    daily_profits = Sale.objects.filter(
        created_at__gte=start_date
    ).extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(
        daily_profit=Sum('total_profit'),
        daily_revenue=Sum('net_amount'),
        daily_cost=Sum('total_cost'),
        sales_count=Count('id')
    ).order_by('day')
    
    # Product profit analysis
    product_profits = SaleItem.objects.filter(
        sale__created_at__gte=start_date
    ).values(
        'product__name', 'product__code', 'product__category__name'
    ).annotate(
        total_profit=Sum('profit'),
        total_revenue=Sum('total_price'),
        total_cost=Sum('total_cost'),
        quantity_sold=Sum('quantity'),
        avg_profit_margin=Avg(F('profit') / F('total_cost') * 100)
    ).order_by('-total_profit')[:20]
    
    # Category profit analysis
    category_profits = SaleItem.objects.filter(
        sale__created_at__gte=start_date
    ).values(
        'product__category__name'
    ).annotate(
        total_profit=Sum('profit'),
        total_revenue=Sum('total_price'),
        total_cost=Sum('total_cost'),
        quantity_sold=Sum('quantity')
    ).order_by('-total_profit')
    
    # Employee performance by profit
    employee_profits = Sale.objects.filter(
        created_at__gte=start_date,
        created_by__isnull=False
    ).values(
        'created_by__username', 'created_by__first_name', 'created_by__last_name'
    ).annotate(
        employee_total_profit=Sum('total_profit'),
        total_revenue=Sum('net_amount'),
        total_sales=Count('id'),
        avg_profit_per_sale=Avg('total_profit')
    ).order_by('-employee_total_profit')
    
    return Response({
        'daily_profits': list(daily_profits),
        'product_profits': list(product_profits),
        'category_profits': list(category_profits),
        'employee_profits': list(employee_profits),
        'period_days': days
    })