#!/usr/bin/env python3
"""
Comprehensive System Test Script
Tests all major functionality of the Inventory Management System
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Test credentials
TEST_USER = {
    "username": "Ahmadraza301",
    "password": "Ahmadraza@#01"
}

class SystemTester:
    def __init__(self):
        self.token = None
        self.headers = {}
        self.test_results = []
        
    def log_test(self, test_name, success, message=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message
        })
    
    def authenticate(self):
        """Test authentication"""
        try:
            response = requests.post(
                f"{BASE_URL}/api/auth/login/",
                json=TEST_USER,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data['access']
                self.headers = {'Authorization': f'Bearer {self.token}'}
                self.log_test("Authentication", True, f"Token obtained: {self.token[:20]}...")
                return True
            else:
                self.log_test("Authentication", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Authentication", False, str(e))
            return False
    
    def test_frontend_access(self):
        """Test frontend accessibility"""
        try:
            response = requests.get(FRONTEND_URL, timeout=10)
            success = response.status_code == 200
            self.log_test("Frontend Access", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Frontend Access", False, str(e))
            return False
    
    def test_dashboard_api(self):
        """Test dashboard API with profit tracking"""
        try:
            response = requests.get(
                f"{BASE_URL}/api/dashboard/stats/",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                # Check required fields
                required_fields = ['overview', 'revenue', 'profit', 'inventory', 'charts']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    profit_data = data['profit']
                    inventory_data = data['inventory']
                    self.log_test("Dashboard API", True, 
                        f"Profit: ₹{profit_data['total_profit']}, "
                        f"Margin: {profit_data['profit_margin']:.1f}%, "
                        f"Inventory Value: ₹{inventory_data['value_sell']}")
                    return True
                else:
                    self.log_test("Dashboard API", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Dashboard API", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Dashboard API", False, str(e))
            return False
    
    def test_products_crud(self):
        """Test products CRUD with profit tracking"""
        try:
            # Get existing data first
            suppliers_response = requests.get(f"{BASE_URL}/api/suppliers/", headers=self.headers)
            categories_response = requests.get(f"{BASE_URL}/api/categories/", headers=self.headers)
            
            if suppliers_response.status_code != 200 or categories_response.status_code != 200:
                self.log_test("Products CRUD", False, "Failed to get suppliers/categories")
                return False
            
            suppliers = suppliers_response.json()['results']
            categories = categories_response.json()['results']
            
            if not suppliers or not categories:
                self.log_test("Products CRUD", False, "No suppliers or categories available")
                return False
            
            # Create test product
            test_product = {
                "name": f"Test Product {datetime.now().strftime('%H%M%S')}",
                "category": categories[0]['id'],
                "supplier": suppliers[0]['id'],
                "buy_price": 100.00,
                "sell_price": 150.00,
                "price": 150.00,  # For backward compatibility
                "quantity": 25,
                "description": "Automated test product"
            }
            
            # CREATE
            create_response = requests.post(
                f"{BASE_URL}/api/products/",
                json=test_product,
                headers=self.headers
            )
            
            if create_response.status_code != 201:
                self.log_test("Products CRUD", False, f"Create failed: {create_response.status_code}")
                return False
            
            created_product = create_response.json()
            product_id = created_product['id']
            
            # Verify profit calculations
            expected_profit = 50.0  # 150 - 100
            expected_margin = 50.0  # (50/100) * 100
            
            if (abs(created_product['profit_per_unit'] - expected_profit) < 0.01 and
                abs(created_product['profit_margin_percentage'] - expected_margin) < 0.01):
                
                # READ
                read_response = requests.get(
                    f"{BASE_URL}/api/products/{product_id}/",
                    headers=self.headers
                )
                
                if read_response.status_code == 200:
                    # UPDATE
                    update_data = {"sell_price": 175.00, "price": 175.00}
                    update_response = requests.patch(
                        f"{BASE_URL}/api/products/{product_id}/",
                        json=update_data,
                        headers=self.headers
                    )
                    
                    if update_response.status_code == 200:
                        updated_product = update_response.json()
                        new_profit = updated_product['profit_per_unit']
                        
                        # DELETE
                        delete_response = requests.delete(
                            f"{BASE_URL}/api/products/{product_id}/",
                            headers=self.headers
                        )
                        
                        if delete_response.status_code == 204:
                            self.log_test("Products CRUD", True, 
                                f"All operations successful. Profit: ₹{expected_profit} → ₹{new_profit}")
                            return True
                        else:
                            self.log_test("Products CRUD", False, "Delete failed")
                            return False
                    else:
                        self.log_test("Products CRUD", False, "Update failed")
                        return False
                else:
                    self.log_test("Products CRUD", False, "Read failed")
                    return False
            else:
                self.log_test("Products CRUD", False, 
                    f"Profit calculation error. Expected: ₹{expected_profit}, Got: ₹{created_product['profit_per_unit']}")
                return False
                
        except Exception as e:
            self.log_test("Products CRUD", False, str(e))
            return False
    
    def test_sales_creation(self):
        """Test sales creation with profit tracking"""
        try:
            # Get available products
            products_response = requests.get(f"{BASE_URL}/api/products/", headers=self.headers)
            if products_response.status_code != 200:
                self.log_test("Sales Creation", False, "Failed to get products")
                return False
            
            products = products_response.json()['results']
            if not products:
                self.log_test("Sales Creation", False, "No products available")
                return False
            
            # Use first available product
            product = products[0]
            
            # Create test sale
            test_sale = {
                "customer_name": "Test Customer",
                "customer_contact": "1234567890",
                "discount_percentage": 5.0,
                "items": [{
                    "product": product['id'],
                    "quantity": 2,
                    "unit_price": float(product['sell_price'])
                }]
            }
            
            create_response = requests.post(
                f"{BASE_URL}/api/sales/",
                json=test_sale,
                headers=self.headers
            )
            
            if create_response.status_code == 201:
                sale_data = create_response.json()
                
                # Verify profit calculations
                expected_cost = float(product['buy_price']) * 2
                expected_revenue = float(product['sell_price']) * 2
                expected_profit_before_discount = expected_revenue - expected_cost
                
                # Account for discount
                discount_amount = (expected_revenue * 5.0) / 100
                net_revenue = expected_revenue - discount_amount
                expected_profit_after_discount = net_revenue - expected_cost
                
                actual_profit = float(sale_data['total_profit'])
                
                if abs(actual_profit - expected_profit_after_discount) < 0.01:
                    self.log_test("Sales Creation", True, 
                        f"Invoice: {sale_data['invoice_number']}, "
                        f"Profit: ₹{actual_profit:.2f}, "
                        f"Margin: {sale_data['profit_margin_percentage']:.1f}%")
                    return True
                else:
                    self.log_test("Sales Creation", False, 
                        f"Profit calculation error. Expected: ₹{expected_profit_after_discount:.2f}, "
                        f"Got: ₹{actual_profit:.2f}")
                    return False
            else:
                self.log_test("Sales Creation", False, f"Status: {create_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Sales Creation", False, str(e))
            return False
    
    def test_reports_api(self):
        """Test reports API with profit data"""
        try:
            response = requests.get(
                f"{BASE_URL}/api/sales/report/?start_date=2025-12-01&end_date=2025-12-31",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                summary = data['summary']
                
                # Check if profit data is included
                required_fields = ['total_profit', 'profit_margin', 'total_cost']
                missing_fields = [field for field in required_fields if field not in summary]
                
                if not missing_fields:
                    self.log_test("Reports API", True, 
                        f"Sales: {summary['total_sales']}, "
                        f"Revenue: ₹{summary['total_revenue']:.2f}, "
                        f"Profit: ₹{summary['total_profit']:.2f}, "
                        f"Margin: {summary['profit_margin']:.1f}%")
                    return True
                else:
                    self.log_test("Reports API", False, f"Missing profit fields: {missing_fields}")
                    return False
            else:
                self.log_test("Reports API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Reports API", False, str(e))
            return False
    
    def test_all_endpoints(self):
        """Test all major API endpoints"""
        endpoints = [
            ("/api/employees/", "Employees API"),
            ("/api/suppliers/", "Suppliers API"),
            ("/api/categories/", "Categories API"),
            ("/api/products/", "Products API"),
            ("/api/sales/", "Sales API"),
            ("/api/dashboard/activities/", "Activities API"),
        ]
        
        all_success = True
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{BASE_URL}{endpoint}", headers=self.headers, timeout=10)
                success = response.status_code == 200
                if success:
                    data = response.json()
                    count = len(data.get('results', data)) if isinstance(data, dict) else len(data)
                    self.log_test(name, True, f"Status: 200, Records: {count}")
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
                    all_success = False
            except Exception as e:
                self.log_test(name, False, str(e))
                all_success = False
        
        return all_success
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive System Test")
        print("=" * 50)
        
        # Authentication is required for most tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with other tests.")
            return False
        
        # Run all tests
        tests = [
            self.test_frontend_access,
            self.test_dashboard_api,
            self.test_products_crud,
            self.test_sales_creation,
            self.test_reports_api,
            self.test_all_endpoints,
        ]
        
        for test in tests:
            test()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! System is ready for production.")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = SystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)