# CuraLink - AI-Powered Healthcare Connection Platform

CuraLink is an MVP platform that connects patients and researchers by simplifying the discovery of clinical trials, medical publications, and health experts.

## 🚀 Features

### For Patients/Caregivers
- **Simple Onboarding**: Natural language input for medical conditions
- **Personalized Dashboard**: Tailored clinical trials, health experts, and publications
- **Health Experts Discovery**: Find specialists based on conditions and location
- **Clinical Trials Search**: Discover relevant trials with AI-generated summaries
- **Publications Access**: Browse latest research papers
- **Community Forums**: Ask questions and get expert responses
- **Favorites System**: Save interesting studies and experts

### For Researchers
- **Professional Profile Setup**: Comprehensive profile with specialties and research interests
- **Collaborator Network**: Find and connect with other researchers
- **Clinical Trials Management**: Add and manage research trials
- **Forum Engagement**: Create communities and answer patient questions
- **Publication Integration**: Auto-import from ORCID and ResearchGate
- **Meeting Availability**: Set availability for patient consultations

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: Supabase (PostgreSQL)
- **APIs**: PubMed, ClinicalTrials.gov, ORCID, ResearchGate

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Supabase account

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
python main.py
```

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Update your `.env` file with Supabase credentials

## 🎯 Application Flow

### Landing Page
- Clean, Duolingo-inspired design
- Two clear CTAs: "I am a Patient/Caregiver" and "I am a Researcher"

### Patient Flow
1. **Onboarding**: Enter medical condition and location
2. **Dashboard**: View personalized recommendations
3. **Explore**: Browse clinical trials, experts, publications, forums
4. **Save**: Add items to favorites

### Researcher Flow
1. **Onboarding**: Professional info, specialties, research interests
2. **Dashboard**: Manage trials, view collaborators, respond to forums
3. **Network**: Connect with other researchers
4. **Engage**: Answer patient questions in forums

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### API Integrations
- **PubMed**: For medical publications
- **ClinicalTrials.gov**: For trial data
- **ORCID**: For researcher credentials
- **ResearchGate**: For academic profiles

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Deploy using your preferred platform
```

## 📱 Key Features Implemented

✅ **Landing Page** - Clean, minimal design  
✅ **Patient Onboarding** - Condition and location input  
✅ **Researcher Onboarding** - Multi-step professional setup  
✅ **Patient Dashboard** - Personalized recommendations  
✅ **Researcher Dashboard** - Professional tools and management  
✅ **Database Schema** - Complete Supabase setup  
✅ **API Backend** - FastAPI with mock data  

## 🎨 Design Philosophy

- **Minimal & Clean**: Inspired by Duolingo's user-friendly approach
- **Intuitive Navigation**: Clear user flows for both user types
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Following best practices for inclusive design

## 🔮 Future Enhancements

- Real API integrations with PubMed, ClinicalTrials.gov
- AI-powered matching algorithms
- Video consultation features
- Advanced search and filtering
- Mobile app development
- Multi-language support

## 📄 License

This project is part of a hackathon submission for CuraLink MVP development.

## 🤝 Contributing

This is a hackathon project. For production use, please implement proper authentication, data validation, and security measures.

---

**Built with ❤️ for connecting patients and researchers worldwide**