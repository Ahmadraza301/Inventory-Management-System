from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('activities/', views.recent_activities, name='recent-activities'),
    path('inventory-summary/', views.inventory_summary, name='inventory-summary'),
    path('profit-analytics/', views.profit_analytics, name='profit-analytics'),
]