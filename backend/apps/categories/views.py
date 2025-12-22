from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category
from .serializers import CategorySerializer, CategoryListSerializer

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    filterset_fields = ['is_active']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategoryListSerializer
        return CategorySerializer

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'

@api_view(['GET'])
def category_stats(request):
    total_categories = Category.objects.count()
    active_categories = Category.objects.filter(is_active=True).count()
    
    return Response({
        'total_categories': total_categories,
        'active_categories': active_categories,
        'inactive_categories': total_categories - active_categories
    })