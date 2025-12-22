# Generated manually to add product code field

from django.db import migrations, models
import random
import string

def generate_unique_product_code():
    """Generate a unique product code"""
    while True:
        code = 'PRD' + ''.join(random.choices(string.digits, k=4))
        return code

def add_product_codes(apps, schema_editor):
    """Add unique product codes to existing products"""
    Product = apps.get_model('products', 'Product')
    
    # Get all existing products
    products = Product.objects.all()
    used_codes = set()
    
    for product in products:
        # Generate a unique product code
        while True:
            new_code = generate_unique_product_code()
            if new_code not in used_codes:
                used_codes.add(new_code)
                break
        
        # Update the product with new code
        product.code = new_code
        product.save()

def remove_product_codes(apps, schema_editor):
    """Reverse migration - remove product codes"""
    # Nothing to do for reverse migration
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        # Step 1: Add the new code field (nullable first)
        migrations.AddField(
            model_name='product',
            name='code',
            field=models.CharField(max_length=50, null=True, verbose_name='Product Code'),
        ),
        
        # Step 2: Populate code with unique values
        migrations.RunPython(
            add_product_codes,
            remove_product_codes,
        ),
        
        # Step 3: Make code non-nullable and unique
        migrations.AlterField(
            model_name='product',
            name='code',
            field=models.CharField(max_length=50, unique=True, verbose_name='Product Code'),
        ),
    ]