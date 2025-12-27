from django.db import models
from apps.categories.models import Category
from apps.suppliers.models import Supplier

class Product(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    code = models.CharField(max_length=50, unique=True, verbose_name="Product Code")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Buy Price (Cost)")
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Sell Price")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Current Price")  # For backward compatibility
    quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def is_in_stock(self):
        return self.quantity > 0
    
    @property
    def profit_per_unit(self):
        """Calculate profit per unit"""
        return self.sell_price - self.buy_price
    
    @property
    def profit_margin_percentage(self):
        """Calculate profit margin percentage"""
        if self.buy_price > 0:
            return ((self.sell_price - self.buy_price) / self.buy_price) * 100
        return 0
    
    @property
    def total_inventory_value_cost(self):
        """Total inventory value at cost price"""
        return self.buy_price * self.quantity
    
    @property
    def total_inventory_value_sell(self):
        """Total inventory value at selling price"""
        return self.sell_price * self.quantity
    
    @property
    def potential_profit(self):
        """Potential profit if all inventory is sold"""
        return (self.sell_price - self.buy_price) * self.quantity
    
    def save(self, *args, **kwargs):
        # Keep price field in sync with sell_price for backward compatibility
        if self.sell_price:
            self.price = self.sell_price
        super().save(*args, **kwargs)