from django.urls import path
from . import views

urlpatterns = [
    path('', views.SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('<int:id>/', views.SupplierDetailView.as_view(), name='supplier-detail'),
    path('stats/', views.supplier_stats, name='supplier-stats'),
]