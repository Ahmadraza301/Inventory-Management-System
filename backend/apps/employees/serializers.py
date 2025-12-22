from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Employee
import random
import string

class EmployeeSerializer(serializers.ModelSerializer):
    eid = serializers.CharField(required=False, allow_blank=True)  # Make EID optional for auto-generation
    
    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
            'email': {'required': True},
            'contact': {'required': True},
            'gender': {'required': True},
            'date_of_birth': {'required': True},
            'date_of_joining': {'required': True},
            'salary': {'required': True},
            'address': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if self.instance:
            # For updates, exclude current instance
            if Employee.objects.filter(email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Employee with this email already exists.")
        else:
            # For creation
            if Employee.objects.filter(email=value).exists():
                raise serializers.ValidationError("Employee with this email already exists.")
        return value
    
    def validate_eid(self, value):
        """Validate EID uniqueness if provided"""
        if value:  # Only validate if EID is provided
            if self.instance:
                # For updates, exclude current instance
                if Employee.objects.filter(eid=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("Employee with this ID already exists.")
            else:
                # For creation
                if Employee.objects.filter(eid=value).exists():
                    raise serializers.ValidationError("Employee with this ID already exists.")
        return value
    
    def generate_employee_id(self):
        """Generate a unique employee ID"""
        while True:
            # Generate EID in format: EMP + 4 random digits
            eid = 'EMP' + ''.join(random.choices(string.digits, k=4))
            if not Employee.objects.filter(eid=eid).exists():
                return eid
    
    def create(self, validated_data):
        # Generate EID if not provided or empty
        if not validated_data.get('eid'):
            validated_data['eid'] = self.generate_employee_id()
        
        # Hash password before saving
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        
        return Employee.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        # Hash password if it's being updated
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class EmployeeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'eid', 'name', 'email', 'contact', 'user_type', 'is_active', 'salary', 'date_of_joining']