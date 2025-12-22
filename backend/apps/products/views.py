from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer, ProductDetailSerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category__name', 'supplier__name']
    filterset_fields = ['status', 'category', 'supplier']
    ordering_fields = ['name', 'price', 'quantity', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductListSerializer
        return ProductSerializer

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductDetailSerializer
    lookup_field = 'id'

@api_view(['GET'])
def product_stats(request):
    total_products = Product.objects.count()
    active_products = Product.objects.filter(status='active').count()
    out_of_stock = Product.objects.filter(quantity=0).count()
    total_value = Product.objects.aggregate(
        total=Sum('price')
    )['total'] or 0
    
    return Response({
        'total_products': total_products,
        'active_products': active_products,
        'inactive_products': total_products - active_products,
        'out_of_stock': out_of_stock,
        'total_inventory_value': total_value
    })

@api_view(['GET'])
def low_stock_products(request):
    threshold = int(request.GET.get('threshold', 10))
    products = Product.objects.filter(
        quantity__lte=threshold,
        status='active'
    ).select_related('category', 'supplier')
    
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)