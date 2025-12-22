from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from .models import Employee
from .serializers import EmployeeSerializer, EmployeeListSerializer

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'contact', 'eid']
    filterset_fields = ['user_type', 'gender', 'is_active']
    ordering_fields = ['name', 'created_at', 'salary', 'date_of_joining']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        queryset = Employee.objects.all()
        
        # Advanced filtering
        salary_min = self.request.query_params.get('salary_min')
        salary_max = self.request.query_params.get('salary_max')
        
        if salary_min:
            queryset = queryset.filter(salary__gte=salary_min)
        if salary_max:
            queryset = queryset.filter(salary__lte=salary_max)
            
        return queryset

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = 'id'

@api_view(['GET'])
def employee_stats(request):
    total_employees = Employee.objects.count()
    active_employees = Employee.objects.filter(is_active=True).count()
    admin_count = Employee.objects.filter(user_type='admin').count()
    
    # Salary statistics
    salary_stats = Employee.objects.aggregate(
        avg_salary=Sum('salary') / Count('salary') if Count('salary') > 0 else 0,
        total_salary_cost=Sum('salary'),
        min_salary=Employee.objects.order_by('salary').first().salary if Employee.objects.exists() else 0,
        max_salary=Employee.objects.order_by('-salary').first().salary if Employee.objects.exists() else 0
    )
    
    # Department distribution
    department_stats = Employee.objects.values('user_type').annotate(
        count=Count('id')
    ).order_by('user_type')
    
    return Response({
        'total_employees': total_employees,
        'active_employees': active_employees,
        'inactive_employees': total_employees - active_employees,
        'admin_count': admin_count,
        'employee_count': total_employees - admin_count,
        'salary_statistics': salary_stats,
        'department_distribution': list(department_stats)
    })

@api_view(['GET'])
def employee_search(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({'results': []})
    
    employees = Employee.objects.filter(
        Q(name__icontains=query) |
        Q(email__icontains=query) |
        Q(eid__icontains=query) |
        Q(contact__icontains=query)
    )[:10]  # Limit to 10 results
    
    serializer = EmployeeListSerializer(employees, many=True)
    return Response({'results': serializer.data})