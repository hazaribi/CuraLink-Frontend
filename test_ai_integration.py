#!/usr/bin/env python3
"""
Test script to verify Gemini AI integration is working
"""

import os
import sys
sys.path.append('backend')

from dotenv import load_dotenv
from ai_service import ai_service

def test_ai_integration():
    """Test the AI service integration"""
    print("Testing CuraLink AI Integration...")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv('backend/.env')
    
    # Check API key
    api_key = os.getenv("GOOGLE_AI_API_KEY")
    print(f"API Key present: {bool(api_key)}")
    if api_key:
        print(f"API Key length: {len(api_key)}")
        print(f"API Key preview: {api_key[:10]}...")
    else:
        print("No API key found!")
        return False
    
    print("\nTesting Patient Condition Analysis...")
    
    # Test 1: Simple question
    test_cases = [
        "Hi, what is diabetes?",
        "brain cancer",
        "How does chemotherapy work?",
        "heart disease treatment"
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: '{test_case}'")
        try:
            result = ai_service.analyze_condition(test_case)
            print(f"Success: {result['primaryCondition'][:100]}...")
        except Exception as e:
            print(f"Failed: {e}")
    
    print("\nTesting Research Suggestions...")
    
    # Test researcher profile
    researcher_profile = {
        "specialties": ["Oncology", "Immunotherapy"],
        "research_interests": ["Cancer Research", "Clinical Trials"],
        "question": "What are the latest advances in immunotherapy?"
    }
    
    try:
        suggestions = ai_service.suggest_research_collaborations(researcher_profile)
        print(f"Research suggestions: {suggestions}")
    except Exception as e:
        print(f"Research suggestions failed: {e}")
    
    print("\n" + "=" * 50)
    print("AI Integration test completed!")

if __name__ == "__main__":
    test_ai_integration()