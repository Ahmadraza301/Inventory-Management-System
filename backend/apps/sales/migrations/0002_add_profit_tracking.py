# Generated migration for adding profit tracking to sales

from django.db import migrations, models

def populate_profit_data(apps, schema_editor):
    """Populate profit data for existing sales"""
    Sale = apps.get_model('sales', 'Sale')
    SaleItem = apps.get_model('sales', 'SaleItem')
    Product = apps.get_model('products', 'Product')
    
    for sale in Sale.objects.all():
        total_cost = 0
        total_profit = 0
        
        for item in sale.items.all():
            try:
                product = Product.objects.get(id=item.product_id)
                # Use buy_price if available, otherwise estimate as 70% of sell price
                if hasattr(product, 'buy_price') and product.buy_price:
                    item.unit_cost = product.buy_price
                else:
                    item.unit_cost = item.unit_price * 0.7  # Estimate cost as 70% of selling price
                
                item.total_cost = item.quantity * item.unit_cost
                item.profit = item.total_price - item.total_cost
                item.save()
                
                total_cost += item.total_cost
                total_profit += item.profit
            except Product.DoesNotExist:
                # If product doesn't exist, estimate cost
                item.unit_cost = item.unit_price * 0.7
                item.total_cost = item.quantity * item.unit_cost
                item.profit = item.total_price - item.total_cost
                item.save()
                
                total_cost += item.total_cost
                total_profit += item.profit
        
        sale.total_cost = total_cost
        sale.total_profit = total_profit
        sale.save()

def reverse_populate_profit_data(apps, schema_editor):
    """Reverse migration - clear profit data"""
    Sale = apps.get_model('sales', 'Sale')
    SaleItem = apps.get_model('sales', 'SaleItem')
    
    Sale.objects.update(total_cost=0, total_profit=0)
    SaleItem.objects.update(unit_cost=0, total_cost=0, profit=0)

class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
        ('products', '0003_add_buy_sell_price'),
    ]

    operations = [
        # Add profit fields to Sale model
        migrations.AddField(
            model_name='sale',
            name='total_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='sale',
            name='total_profit',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        # Add profit fields to SaleItem model
        migrations.AddField(
            model_name='saleitem',
            name='unit_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='saleitem',
            name='total_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='saleitem',
            name='profit',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        # Populate profit data for existing records
        migrations.RunPython(populate_profit_data, reverse_populate_profit_data),
    ]