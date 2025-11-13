import requests
import json

# Test the AI API endpoints on production
BASE_URL = "https://curalink-backend-42qr.onrender.com"

def test_ai_endpoints():
    print("Testing CuraLink AI API endpoints...")
    
    # Test 1: AI Test endpoint
    print("\n1. Testing AI service status...")
    try:
        response = requests.get(f"{BASE_URL}/api/ai/test")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Condition Analysis
    print("\n2. Testing condition analysis...")
    try:
        data = {
            "text": "I have been diagnosed with brain cancer and looking for treatment options",
            "analysis_type": "condition"
        }
        response = requests.post(f"{BASE_URL}/api/ai/analyze-condition", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Question answering
    print("\n3. Testing AI question answering...")
    try:
        data = {
            "text": "What are the latest treatments for brain cancer?",
            "analysis_type": "condition"
        }
        response = requests.post(f"{BASE_URL}/api/ai/analyze-condition", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Research suggestions
    print("\n4. Testing research suggestions...")
    try:
        data = {
            "specialties": ["Oncology", "Neurology"],
            "research_interests": ["Brain Cancer", "Immunotherapy"],
            "question": "What are the best collaboration opportunities in brain cancer research?"
        }
        response = requests.post(f"{BASE_URL}/api/ai/research-suggestions", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 5: Trial summary
    print("\n5. Testing trial summary generation...")
    try:
        trial_data = {
            "title": "Immunotherapy Trial for Glioblastoma",
            "description": "A phase II clinical trial testing new immunotherapy approaches for patients with recurrent glioblastoma multiforme"
        }
        response = requests.post(f"{BASE_URL}/api/ai/trial-summary", json=trial_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_endpoints()