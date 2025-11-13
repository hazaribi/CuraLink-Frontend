#!/usr/bin/env python3
"""
Check available Gemini models
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv('backend/.env')

api_key = os.getenv("GOOGLE_AI_API_KEY")
if not api_key:
    print("No API key found!")
    exit(1)

# List available models
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Available models:")
        for model in data.get('models', []):
            name = model.get('name', '')
            if 'generateContent' in model.get('supportedGenerationMethods', []):
                print(f"  - {name} (supports generateContent)")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")