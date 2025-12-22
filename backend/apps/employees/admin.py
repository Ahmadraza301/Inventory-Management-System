from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['eid', 'name', 'email', 'contact', 'user_type', 'is_active']
    list_filter = ['user_type', 'gender', 'is_active', 'created_at']
    search_fields = ['eid', 'name', 'email', 'contact']
    readonly_fields = ['created_at', 'updated_at']