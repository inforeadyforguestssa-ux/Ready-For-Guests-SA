#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ReadyForGuestsAPITester:
    def __init__(self, base_url="https://guest-ready-connect.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_user = None
        self.client_user = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_health_check(self):
        """Test basic API health"""
        try:
            response = self.session.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            self.log_test("API Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        try:
            login_data = {
                "email": "info.readyforguestssa@gmail.com",
                "password": "BigBoss2026"
            }
            response = self.session.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                self.admin_user = response.json()
                success = self.admin_user.get("role") == "admin"
                self.log_test("Admin Login", success, f"Role: {self.admin_user.get('role')}")
                return success
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False

    def test_get_services(self):
        """Test services endpoint - should return 27 seeded services"""
        try:
            response = self.session.get(f"{self.api_url}/services", timeout=10)
            
            if response.status_code == 200:
                services = response.json()
                success = len(services) >= 20  # Should have around 27 services
                self.log_test("Get Services", success, f"Found {len(services)} services")
                return success
            else:
                self.log_test("Get Services", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Services", False, str(e))
            return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/admin/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_bookings", "pending_bookings", "completed_bookings", "total_clients", "total_teams"]
                success = all(field in stats for field in required_fields)
                self.log_test("Admin Stats", success, f"Stats: {stats}")
                return success
            else:
                self.log_test("Admin Stats", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Admin Stats", False, str(e))
            return False

    def test_get_teams(self):
        """Test teams endpoint - should return default team"""
        try:
            response = self.session.get(f"{self.api_url}/teams", timeout=10)
            
            if response.status_code == 200:
                teams = response.json()
                success = len(teams) >= 1  # Should have at least the default "Hibiscus Housekeepers" team
                self.log_test("Get Teams", success, f"Found {len(teams)} teams")
                return success
            else:
                self.log_test("Get Teams", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Teams", False, str(e))
            return False

    def test_get_gallery(self):
        """Test gallery endpoint - should return seeded images"""
        try:
            response = self.session.get(f"{self.api_url}/gallery", timeout=10)
            
            if response.status_code == 200:
                gallery = response.json()
                success = len(gallery) >= 4  # Should have 4 seeded images
                self.log_test("Get Gallery", success, f"Found {len(gallery)} images")
                return success
            else:
                self.log_test("Get Gallery", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Gallery", False, str(e))
            return False

    def test_client_registration(self):
        """Test client registration"""
        try:
            # Use timestamp to ensure unique email
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            client_data = {
                "email": f"testclient_{timestamp}@example.com",
                "password": "TestPass123!",
                "name": "Test Client",
                "phone": "0721234567",
                "role": "client"
            }
            
            response = self.session.post(f"{self.api_url}/auth/register", json=client_data, timeout=10)
            
            if response.status_code == 200:
                self.client_user = response.json()
                success = self.client_user.get("role") == "client"
                self.log_test("Client Registration", success, f"Role: {self.client_user.get('role')}")
                return success
            else:
                self.log_test("Client Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Client Registration", False, str(e))
            return False

    def test_create_booking(self):
        """Test booking creation as client"""
        if not self.client_user:
            self.log_test("Create Booking", False, "No client user available")
            return False
            
        try:
            # First get a service to book
            services_response = self.session.get(f"{self.api_url}/services", timeout=10)
            if services_response.status_code != 200:
                self.log_test("Create Booking", False, "Could not fetch services")
                return False
                
            services = services_response.json()
            if not services:
                self.log_test("Create Booking", False, "No services available")
                return False
                
            # Create booking with first service
            booking_data = {
                "service_id": services[0]["id"],
                "property_address": "123 Test Street",
                "property_area": "Margate",
                "scheduled_date": "2024-12-25",
                "scheduled_time": "10:00",
                "bedrooms": 2,
                "notes": "Test booking",
                "special_requests": "Please be gentle with the furniture"
            }
            
            response = self.session.post(f"{self.api_url}/bookings", json=booking_data, timeout=10)
            
            if response.status_code == 200:
                booking = response.json()
                success = booking.get("status") == "pending"
                self.log_test("Create Booking", success, f"Booking ID: {booking.get('id')}, Status: {booking.get('status')}")
                return success
            else:
                self.log_test("Create Booking", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Booking", False, str(e))
            return False

    def test_get_notifications(self):
        """Test notifications endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/notifications", timeout=10)
            
            if response.status_code == 200:
                notifications = response.json()
                success = isinstance(notifications, list)
                self.log_test("Get Notifications", success, f"Found {len(notifications)} notifications")
                return success
            else:
                self.log_test("Get Notifications", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Notifications", False, str(e))
            return False

    def test_auth_me(self):
        """Test current user endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/auth/me", timeout=10)
            
            if response.status_code == 200:
                user = response.json()
                success = "email" in user and "role" in user
                self.log_test("Auth Me", success, f"User: {user.get('email')}, Role: {user.get('role')}")
                return success
            else:
                self.log_test("Auth Me", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth Me", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Ready for Guests Connect Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
            
        # Authentication tests
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
            
        # Core functionality tests
        self.test_get_services()
        self.test_admin_stats()
        self.test_get_teams()
        self.test_get_gallery()
        self.test_auth_me()
        self.test_get_notifications()
        
        # Client workflow tests
        if self.test_client_registration():
            self.test_create_booking()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = ReadyForGuestsAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/tmp/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())