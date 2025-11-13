# CuraLink Deployment Guide

## 🚀 Quick Deployment (Recommended Stack)

### **Frontend: Vercel + Next.js**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to frontend
cd frontend

# 3. Build and deploy
npm run build
vercel --prod

# 4. Follow prompts:
# - Link to existing project? No
# - Project name: curalink-frontend
# - Directory: ./
# - Override settings? No
```

### **Backend: Railway + FastAPI**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Navigate to backend
cd backend

# 3. Login and deploy
railway login
railway init
railway up

# 4. Add environment variables in Railway dashboard:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_KEY
```

### **Database: Supabase**
```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Go to SQL Editor
# 4. Run the schema from supabase/schema.sql
# 5. Copy connection details to backend env vars
```

## 📁 Project Structure for Deployment

```
CuraLink/
├── frontend/                 # Next.js app
│   ├── app/                 # App router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and API
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
├── backend/                 # FastAPI app
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── external_search.py  # External API integrations
│   ├── orcid_service.py    # ORCID integration
│   └── admin_requests.py   # Admin functionality
├── supabase/               # Database
│   ├── schema.sql          # Database schema
│   └── con_tables.sql      # Additional tables
└── deployment/             # Deployment configs
    ├── vercel.json         # Vercel configuration
    ├── railway.json        # Railway configuration
    └── docker-compose.yml  # Local development
```

## 🔧 Environment Variables

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Backend (.env)**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
ORCID_CLIENT_ID=your_orcid_client_id
ORCID_CLIENT_SECRET=your_orcid_client_secret
```

## 🌐 Custom Domain Setup

### **Vercel Domain**
```bash
# Add custom domain in Vercel dashboard
# Example: curalink.yourdomain.com
# Vercel will provide DNS instructions
```

### **Railway Domain**
```bash
# Railway provides: your-app.railway.app
# For custom domain, upgrade to Pro plan
```

## 📊 Monitoring & Analytics

### **Vercel Analytics** (Free)
- Real-time performance metrics
- Core Web Vitals tracking
- User analytics

### **Supabase Dashboard** (Free)
- Database performance
- API usage statistics
- Real-time data monitoring

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] API keys not exposed in frontend
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced

## 🎯 Performance Optimization

### **Frontend Optimizations**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
  compress: true,
}

module.exports = nextConfig
```

### **Backend Optimizations**
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## 🚀 Deployment Commands

### **One-Click Deployment**
```bash
# Deploy everything
./deploy.sh

# Or step by step:
cd frontend && vercel --prod
cd ../backend && railway up
```

## 📈 Scaling Considerations

### **Free Tier Limits**
- **Vercel**: 100GB bandwidth/month
- **Railway**: $5 credit/month (~750 hours)
- **Supabase**: 500MB database, 2GB bandwidth

### **Upgrade Path**
- **Vercel Pro**: $20/month (unlimited bandwidth)
- **Railway Pro**: $5/month + usage
- **Supabase Pro**: $25/month (8GB database)

## 🔄 CI/CD Pipeline

### **GitHub Actions** (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy CuraLink
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Go Live Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database setup on Supabase
- [ ] Environment variables configured
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active
- [ ] All features tested in production
- [ ] Analytics configured
- [ ] Monitoring setup complete

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

**Estimated Deployment Time**: 30-45 minutes
**Total Cost**: FREE for development and moderate usage