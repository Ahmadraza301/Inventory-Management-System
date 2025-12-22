from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

class InventoryAdminSite(AdminSite):
    site_title = _('IMS Admin Panel')
    site_header = _('Inventory Management System - Admin Panel')
    index_title = _('Welcome to IMS Admin Panel')
    
    def get_app_list(self, request, app_label=None):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_dict = self._build_app_dict(request, app_label)
        
        # Sort the apps alphabetically.
        app_list = sorted(app_dict.values(), key=lambda x: x['name'].lower())
        
        # Sort the models alphabetically within each app.
        for app in app_list:
            app['models'].sort(key=lambda x: x['name'])
            
        return app_list

# Create custom admin site
admin_site = InventoryAdminSite(name='inventory_admin')

# Override the default admin site
admin.site = admin_site
admin.sites.site = admin_site