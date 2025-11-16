# Backend AI Integration Fixes

## Files Modified:

### 1. backend/.env
```
# Fix the API key (remove space before =)
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### 2. backend/ai_service.py
**Key Changes:**
- Updated Gemini model from `gemini-pro` to `gemini-2.0-flash`
- Fixed API key loading with reload mechanism
- Added proper fallback response methods
- Improved error handling

**Critical Line Change:**
```python
# Line ~95: Update the API URL
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
```

### 3. backend/main.py
**Key Change:**
```python
# Move load_dotenv() before importing ai_service
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from supabase import create_client, Client
from external_search import ExternalExpertSearch
from admin_requests import AdminRequestHandler
from orcid_service import ORCIDService
from ai_service import ai_service
```

## Deployment Steps:

1. Copy the updated files to your backend repository
2. Commit and push to GitHub
3. Render will auto-deploy the changes
4. Verify the AI endpoints work at: https://curalink-backend-42qr.onrender.com/api/ai/test

## Environment Variables on Render:
Make sure these are set in your Render dashboard:
- `GOOGLE_AI_API_KEY=your_actual_api_key_here`
- All other existing environment variables

## Test After Deployment:
```bash
curl -X POST "https://curalink-backend-42qr.onrender.com/api/ai/analyze-condition" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hi, what is diabetes?", "analysis_type": "condition"}'
```