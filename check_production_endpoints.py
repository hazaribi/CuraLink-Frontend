import requests
import json

# Check what endpoints are available on production
BASE_URL = "https://curalink-backend-42qr.onrender.com"

def check_endpoints():
    print("Checking CuraLink production endpoints...")
    
    # Test basic health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test root endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test if AI endpoints exist
    print("\n3. Testing AI endpoints availability...")
    
    ai_endpoints = [
        "/api/ai/test",
        "/api/ai/analyze-condition", 
        "/api/ai/research-suggestions",
        "/api/ai/trial-summary"
    ]
    
    for endpoint in ai_endpoints:
        try:
            if "analyze-condition" in endpoint or "research-suggestions" in endpoint or "trial-summary" in endpoint:
                # POST endpoints - test with minimal data
                response = requests.post(f"{BASE_URL}{endpoint}", json={"test": "data"})
            else:
                # GET endpoints
                response = requests.get(f"{BASE_URL}{endpoint}")
            
            print(f"{endpoint}: Status {response.status_code}")
            if response.status_code != 404:
                try:
                    print(f"  Response: {response.json()}")
                except:
                    print(f"  Response: {response.text[:100]}...")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")

if __name__ == "__main__":
    check_endpoints()