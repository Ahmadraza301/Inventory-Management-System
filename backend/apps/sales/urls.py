from django.urls import path
from . import views

urlpatterns = [
    path('', views.SaleListCreateView.as_view(), name='sale-list-create'),
    path('<int:id>/', views.SaleDetailView.as_view(), name='sale-detail'),
    path('stats/', views.sales_stats, name='sales-stats'),
    path('report/', views.sales_report, name='sales-report'),
]