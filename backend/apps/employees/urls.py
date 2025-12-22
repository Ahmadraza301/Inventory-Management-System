from django.urls import path
from . import views

urlpatterns = [
    path('', views.EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('<int:id>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    path('stats/', views.employee_stats, name='employee-stats'),
    path('search/', views.employee_search, name='employee-search'),
]