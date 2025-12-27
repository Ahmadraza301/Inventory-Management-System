from rest_framework import serializers
from .models import Sale, SaleItem
from apps.products.serializers import ProductListSerializer

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    profit_per_unit = serializers.ReadOnlyField()
    profit_margin_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'quantity', 'unit_price', 'unit_cost',
            'total_price', 'total_cost', 'profit', 'profit_per_unit', 'profit_margin_percentage'
        ]
        read_only_fields = ['total_price', 'total_cost', 'profit']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    profit_margin_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['created_by', 'invoice_number', 'total_amount', 'discount_amount', 'net_amount', 'total_cost', 'total_profit']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Set default values for calculated fields
        validated_data['total_amount'] = 0
        validated_data['discount_amount'] = 0
        validated_data['net_amount'] = 0
        validated_data['total_cost'] = 0
        validated_data['total_profit'] = 0
        
        sale = Sale.objects.create(**validated_data)
        
        total_amount = 0
        total_cost = 0
        
        for item_data in items_data:
            product = item_data['product']
            
            # Set unit_cost from product's buy_price
            item_data['unit_cost'] = product.buy_price
            
            item = SaleItem.objects.create(sale=sale, **item_data)
            total_amount += item.total_price
            total_cost += item.total_cost
            
            # Update product quantity
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
        sale.total_cost = total_cost
        sale.total_profit = total_amount - total_cost
        
        # Apply discount
        discount_amount = (total_amount * sale.discount_percentage) / 100
        sale.discount_amount = discount_amount
        sale.net_amount = total_amount - discount_amount
        
        # Adjust profit for discount
        sale.total_profit = sale.net_amount - total_cost
        
        sale.save()
        return sale

class SaleListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    profit_margin_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'customer_name', 'customer_contact',
            'total_amount', 'discount_amount', 'net_amount', 'total_cost', 'total_profit',
            'profit_margin_percentage', 'items_count', 'created_by_name', 'created_at'
        ]