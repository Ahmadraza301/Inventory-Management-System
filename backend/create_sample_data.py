#!/usr/bin/env python3
"""
Create sample data for the Inventory Management System
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_system.settings')
django.setup()

from apps.employees.models import Employee
from apps.suppliers.models import Supplier
from apps.categories.models import Category
from apps.products.models import Product
from apps.sales.models import Sale, SaleItem
from apps.authentication.models import User

def create_sample_data():
    print("Creating sample data...")
    
    # Create categories
    categories = [
        {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
        {'name': 'Clothing', 'description': 'Apparel and fashion items'},
        {'name': 'Books', 'description': 'Books and educational materials'},
        {'name': 'Home & Garden', 'description': 'Home improvement and garden supplies'},
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Created category: {category.name}")
    
    # Create suppliers
    suppliers = [
        {'invoice': 'SUP001', 'name': 'Tech Supplies Inc', 'contact': '+1-555-0101', 'description': 'Electronics and tech equipment supplier'},
        {'invoice': 'SUP002', 'name': 'Fashion World', 'contact': '+1-555-0102', 'description': 'Clothing and fashion items supplier'},
        {'invoice': 'SUP003', 'name': 'Book Distributors', 'contact': '+1-555-0103', 'description': 'Books and educational materials supplier'},
        {'invoice': 'SUP004', 'name': 'Home Depot', 'contact': '+1-555-0104', 'description': 'Home improvement and garden supplies'},
    ]
    
    for sup_data in suppliers:
        supplier, created = Supplier.objects.get_or_create(
            invoice=sup_data['invoice'],
            defaults={
                'name': sup_data['name'],
                'contact': sup_data['contact'],
                'description': sup_data['description']
            }
        )
        if created:
            print(f"Created supplier: {supplier.name}")
    
    # Create employees
    from datetime import date
    employees = [
        {'eid': 'EMP001', 'name': 'John Doe', 'email': 'john@company.com', 'contact': '+1-555-1001', 'gender': 'male', 'user_type': 'admin'},
        {'eid': 'EMP002', 'name': 'Jane Smith', 'email': 'jane@company.com', 'contact': '+1-555-1002', 'gender': 'female', 'user_type': 'employee'},
        {'eid': 'EMP003', 'name': 'Mike Johnson', 'email': 'mike@company.com', 'contact': '+1-555-1003', 'gender': 'male', 'user_type': 'employee'},
    ]
    
    for emp_data in employees:
        employee, created = Employee.objects.get_or_create(
            eid=emp_data['eid'],
            defaults={
                'name': emp_data['name'],
                'email': emp_data['email'],
                'contact': emp_data['contact'],
                'gender': emp_data['gender'],
                'user_type': emp_data['user_type'],
                'date_of_birth': date(1990, 1, 1),
                'date_of_joining': date(2023, 1, 1),
                'password': 'pbkdf2_sha256$600000$dummy$hash',  # Dummy hash
                'salary': 50000.00,
                'address': f"456 Employee Street, City, State 12345"
            }
        )
        if created:
            print(f"Created employee: {employee.name}")
    
    # Create products
    products_data = [
        {'name': 'Laptop', 'category': 'Electronics', 'supplier_invoice': 'SUP001', 'price': 999.99, 'quantity': 50},
        {'name': 'Smartphone', 'category': 'Electronics', 'supplier_invoice': 'SUP001', 'price': 699.99, 'quantity': 100},
        {'name': 'T-Shirt', 'category': 'Clothing', 'supplier_invoice': 'SUP002', 'price': 19.99, 'quantity': 200},
        {'name': 'Jeans', 'category': 'Clothing', 'supplier_invoice': 'SUP002', 'price': 49.99, 'quantity': 150},
        {'name': 'Python Programming Book', 'category': 'Books', 'supplier_invoice': 'SUP003', 'price': 39.99, 'quantity': 75},
        {'name': 'Garden Tools Set', 'category': 'Home & Garden', 'supplier_invoice': 'SUP004', 'price': 89.99, 'quantity': 30},
    ]
    
    for prod_data in products_data:
        try:
            category = Category.objects.get(name=prod_data['category'])
            supplier = Supplier.objects.get(invoice=prod_data['supplier_invoice'])
            
            product, created = Product.objects.get_or_create(
                name=prod_data['name'],
                defaults={
                    'category': category,
                    'supplier': supplier,
                    'price': prod_data['price'],
                    'quantity': prod_data['quantity'],
                    'description': f"High quality {prod_data['name'].lower()}",
                    'status': 'active'
                }
            )
            if created:
                print(f"Created product: {product.name}")
        except (Category.DoesNotExist, Supplier.DoesNotExist) as e:
            print(f"Skipping product {prod_data['name']}: {e}")
    
    # Create some sample sales
    admin_user = User.objects.get(username='Ahmadraza301')
    
    # Sample sale 1
    sale1, created = Sale.objects.get_or_create(
        invoice_number='INV001',
        defaults={
            'customer_name': 'Alice Johnson',
            'customer_contact': '+1-555-2001',
            'created_by': admin_user,
            'total_amount': 1049.98,
            'discount_amount': 50.00,
            'net_amount': 999.98
        }
    )
    
    if created:
        # Add items to sale 1
        laptop = Product.objects.get(name='Laptop')
        SaleItem.objects.create(
            sale=sale1,
            product=laptop,
            quantity=1,
            unit_price=999.99,
            total_price=999.99
        )
        
        tshirt = Product.objects.get(name='T-Shirt')
        SaleItem.objects.create(
            sale=sale1,
            product=tshirt,
            quantity=2,
            unit_price=19.99,
            total_price=39.98
        )
        
        print(f"Created sale: {sale1.invoice_number}")
    
    # Sample sale 2
    sale2, created = Sale.objects.get_or_create(
        invoice_number='INV002',
        defaults={
            'customer_name': 'Bob Wilson',
            'customer_contact': '+1-555-2002',
            'created_by': admin_user,
            'total_amount': 749.98,
            'discount_amount': 25.00,
            'net_amount': 724.98
        }
    )
    
    if created:
        # Add items to sale 2
        smartphone = Product.objects.get(name='Smartphone')
        SaleItem.objects.create(
            sale=sale2,
            product=smartphone,
            quantity=1,
            unit_price=699.99,
            total_price=699.99
        )
        
        jeans = Product.objects.get(name='Jeans')
        SaleItem.objects.create(
            sale=sale2,
            product=jeans,
            quantity=1,
            unit_price=49.99,
            total_price=49.99
        )
        
        print(f"Created sale: {sale2.invoice_number}")
    
    print("✅ Sample data created successfully!")

if __name__ == '__main__':
    create_sample_data()