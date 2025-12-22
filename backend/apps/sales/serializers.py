from rest_framework import serializers
from .models import Sale, SaleItem
from apps.products.serializers import ProductListSerializer

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['total_price']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['created_by', 'invoice_number', 'total_amount', 'discount_amount', 'net_amount']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Set default values for calculated fields
        validated_data['total_amount'] = 0
        validated_data['discount_amount'] = 0
        validated_data['net_amount'] = 0
        
        sale = Sale.objects.create(**validated_data)
        
        total_amount = 0
        for item_data in items_data:
            item = SaleItem.objects.create(sale=sale, **item_data)
            total_amount += item.total_price
            
            # Update product quantity
            product = item.product
            if product.quantity >= item.quantity:
                product.quantity -= item.quantity
                if product.quantity <= 0:
                    product.status = 'inactive'
                product.save()
            else:
                # Delete the sale if stock validation fails
                sale.delete()
                raise serializers.ValidationError(f"Insufficient stock for {product.name}. Available: {product.quantity}, Requested: {item.quantity}")
        
        # Calculate totals
        sale.total_amount = total_amount
        sale.discount_amount = (total_amount * sale.discount_percentage) / 100
        sale.net_amount = total_amount - sale.discount_amount
        sale.save()
        
        return sale

class SaleListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'invoice_number', 'customer_name', 'customer_contact', 
                 'total_amount', 'net_amount', 'items_count', 'created_by_name', 'created_at']