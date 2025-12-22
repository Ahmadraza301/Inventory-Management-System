from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'supplier', 'price', 'quantity', 'status', 'created_at']
    list_filter = ['status', 'category', 'supplier', 'created_at']
    search_fields = ['name', 'category__name', 'supplier__name']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['price', 'quantity', 'status']