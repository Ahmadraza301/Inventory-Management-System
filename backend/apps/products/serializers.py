from rest_framework import serializers
from .models import Product
from apps.categories.serializers import CategoryListSerializer
from apps.suppliers.serializers import SupplierListSerializer
import random
import string

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'category': {'required': True},
            'supplier': {'required': True},
            'price': {'required': True},
        }
    
    def generate_product_code(self):
        """Generate a unique product code"""
        while True:
            # Generate product code in format: PRD + 4 random digits
            code = 'PRD' + ''.join(random.choices(string.digits, k=4))
            if not Product.objects.filter(code=code).exists():
                return code
    
    def validate_code(self, value):
        """Validate product code uniqueness if provided"""
        if value:  # Only validate if code is provided
            if self.instance:
                # For updates, exclude current instance
                if Product.objects.filter(code=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("Product with this code already exists.")
            else:
                # For creation
                if Product.objects.filter(code=value).exists():
                    raise serializers.ValidationError("Product with this code already exists.")
        return value
    
    def create(self, validated_data):
        # Generate product code if not provided or empty
        if not validated_data.get('code'):
            validated_data['code'] = self.generate_product_code()
        
        return Product.objects.create(**validated_data)

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'category_name', 'supplier_name', 'price', 'quantity', 'status', 'is_in_stock']

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    supplier = SupplierListSerializer(read_only=True)
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'