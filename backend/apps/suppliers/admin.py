from django.contrib import admin
from .models import Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['supplier_id', 'name', 'contact', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['supplier_id', 'name', 'contact']
    readonly_fields = ['created_at', 'updated_at']