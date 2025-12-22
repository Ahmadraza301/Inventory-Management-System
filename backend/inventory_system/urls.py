from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from .admin import admin_site

def redirect_to_frontend(request):
    """Redirect to the React frontend application"""
    return redirect('http://localhost:3000')

urlpatterns = [
    path('', redirect_to_frontend, name='home'),
    path('admin/', admin_site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/employees/', include('apps.employees.urls')),
    path('api/suppliers/', include('apps.suppliers.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)