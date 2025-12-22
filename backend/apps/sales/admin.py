from django.contrib import admin
from .models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['total_price']

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer_name', 'total_amount', 'net_amount', 'created_by', 'created_at']
    list_filter = ['created_at', 'created_by']
    search_fields = ['invoice_number', 'customer_name', 'customer_contact']
    readonly_fields = ['created_at', 'updated_at', 'discount_amount', 'net_amount']
    inlines = [SaleItemInline]

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'product', 'quantity', 'unit_price', 'total_price']
    list_filter = ['sale__created_at']
    readonly_fields = ['total_price']