# Generated migration for adding buy_price and sell_price fields

from django.db import migrations, models
from decimal import Decimal

def populate_buy_sell_prices(apps, schema_editor):
    """Populate buy_price and sell_price from existing price field"""
    Product = apps.get_model('products', 'Product')
    for product in Product.objects.all():
        # Set buy_price to 70% of current price (assuming 30% markup)
        product.buy_price = product.price * Decimal('0.7')
        # Set sell_price to current price
        product.sell_price = product.price
        product.save()

def reverse_populate_prices(apps, schema_editor):
    """Reverse migration - set price from sell_price"""
    Product = apps.get_model('products', 'Product')
    for product in Product.objects.all():
        product.price = product.sell_price
        product.save()

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_add_product_code'),
    ]

    operations = [
        # Add buy_price field with temporary default
        migrations.AddField(
            model_name='product',
            name='buy_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Buy Price (Cost)'),
            preserve_default=False,
        ),
        # Add sell_price field with temporary default
        migrations.AddField(
            model_name='product',
            name='sell_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Sell Price'),
            preserve_default=False,
        ),
        # Populate the new fields with data from existing price field
        migrations.RunPython(populate_buy_sell_prices, reverse_populate_prices),
        # Update price field verbose name
        migrations.AlterField(
            model_name='product',
            name='price',
            field=models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Current Price'),
        ),
    ]