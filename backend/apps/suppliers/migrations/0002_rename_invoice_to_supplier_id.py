# Generated manually to handle invoice -> supplier_id migration

from django.db import migrations, models
import random
import string

def generate_unique_supplier_id():
    """Generate a unique supplier ID"""
    while True:
        supplier_id = 'SUP' + ''.join(random.choices(string.digits, k=4))
        return supplier_id

def migrate_invoice_to_supplier_id(apps, schema_editor):
    """Migrate existing invoice data to supplier_id with proper unique values"""
    Supplier = apps.get_model('suppliers', 'Supplier')
    
    # Get all existing suppliers
    suppliers = Supplier.objects.all()
    used_ids = set()
    
    for supplier in suppliers:
        # Generate a unique supplier ID
        while True:
            new_id = generate_unique_supplier_id()
            if new_id not in used_ids:
                used_ids.add(new_id)
                break
        
        # Update the supplier with new ID
        supplier.supplier_id = new_id
        supplier.save()

def reverse_migrate_supplier_id_to_invoice(apps, schema_editor):
    """Reverse migration - copy supplier_id back to invoice"""
    Supplier = apps.get_model('suppliers', 'Supplier')
    
    for supplier in Supplier.objects.all():
        supplier.invoice = supplier.supplier_id
        supplier.save()

class Migration(migrations.Migration):

    dependencies = [
        ('suppliers', '0001_initial'),
    ]

    operations = [
        # Step 1: Add the new supplier_id field (nullable first)
        migrations.AddField(
            model_name='supplier',
            name='supplier_id',
            field=models.CharField(max_length=50, null=True, verbose_name='Supplier ID'),
        ),
        
        # Step 2: Populate supplier_id with unique values
        migrations.RunPython(
            migrate_invoice_to_supplier_id,
            reverse_migrate_supplier_id_to_invoice,
        ),
        
        # Step 3: Make supplier_id non-nullable and unique
        migrations.AlterField(
            model_name='supplier',
            name='supplier_id',
            field=models.CharField(max_length=50, unique=True, verbose_name='Supplier ID'),
        ),
        
        # Step 4: Remove the old invoice field
        migrations.RemoveField(
            model_name='supplier',
            name='invoice',
        ),
    ]