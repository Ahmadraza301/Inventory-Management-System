from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:id>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('stats/', views.product_stats, name='product-stats'),
    path('low-stock/', views.low_stock_products, name='low-stock-products'),
]