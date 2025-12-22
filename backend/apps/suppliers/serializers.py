from rest_framework import serializers
from .models import Supplier
import random
import string

class SupplierSerializer(serializers.ModelSerializer):
    supplier_id = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Supplier
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'contact': {'required': True},
        }
    
    def generate_supplier_id(self):
        """Generate a unique supplier ID"""
        while True:
            # Generate supplier ID in format: SUP + 4 random digits
            supplier_id = 'SUP' + ''.join(random.choices(string.digits, k=4))
            if not Supplier.objects.filter(supplier_id=supplier_id).exists():
                return supplier_id
    
    def validate_supplier_id(self, value):
        """Validate supplier ID uniqueness if provided"""
        if value:  # Only validate if supplier ID is provided
            if self.instance:
                # For updates, exclude current instance
                if Supplier.objects.filter(supplier_id=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("Supplier with this ID already exists.")
            else:
                # For creation
                if Supplier.objects.filter(supplier_id=value).exists():
                    raise serializers.ValidationError("Supplier with this ID already exists.")
        return value
    
    def create(self, validated_data):
        # Generate supplier ID if not provided or empty
        if not validated_data.get('supplier_id'):
            validated_data['supplier_id'] = self.generate_supplier_id()
        
        return Supplier.objects.create(**validated_data)

class SupplierListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'supplier_id', 'name', 'contact', 'is_active']