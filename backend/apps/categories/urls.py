from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('<int:id>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('stats/', views.category_stats, name='category-stats'),
]