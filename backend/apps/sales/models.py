from django.db import models
from django.contrib.auth import get_user_model
from apps.products.models import Product

User = get_user_model()

class Sale(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=100)
    customer_contact = models.CharField(max_length=15)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Total cost price
    total_profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Total profit
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer_name}"
    
    @property
    def profit_margin_percentage(self):
        """Calculate profit margin percentage for the sale"""
        if self.total_cost > 0:
            return (self.total_profit / self.total_cost) * 100
        return 0
    
    def calculate_totals(self):
        """Calculate total cost and profit from sale items"""
        total_cost = 0
        total_profit = 0
        
        for item in self.items.all():
            total_cost += item.total_cost
            total_profit += item.profit
        
        self.total_cost = total_cost
        self.total_profit = total_profit
        self.save()

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # Selling price
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Cost price
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # Total selling price
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Total cost price
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Profit for this item
    
    class Meta:
        unique_together = ['sale', 'product']
        
    def save(self, *args, **kwargs):
        # Calculate totals
        self.total_price = self.quantity * self.unit_price
        self.total_cost = self.quantity * self.unit_cost
        self.profit = self.total_price - self.total_cost
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    @property
    def profit_per_unit(self):
        """Profit per unit for this sale item"""
        return self.unit_price - self.unit_cost
    
    @property
    def profit_margin_percentage(self):
        """Profit margin percentage for this sale item"""
        if self.unit_cost > 0:
            return ((self.unit_price - self.unit_cost) / self.unit_cost) * 100
        return 0