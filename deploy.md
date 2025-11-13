# CuraLink Deployment Guide

## Frontend (Vercel) - FREE
```bash
cd frontend
npm run build
npx vercel --prod
```

## Backend (Render) - FREE
1. Push to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set build command: `pip install -r backend/requirements.txt`
5. Set start command: `cd backend && python main.py`
6. Add environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY  
   - SUPABASE_SERVICE_KEY

## Environment Variables Needed:
- Backend: Supabase credentials
- Frontend: Backend API URL

## Post-Deployment:
1. Update frontend .env.production with backend URL
2. Test all features
3. Update README with live URLs