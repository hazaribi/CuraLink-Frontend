'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SavedProfile {
  type: 'patient' | 'researcher' | 'admin';
  name: string;
  location?: string;
  condition?: string;
  specialty?: string;
  lastAccessed: string;
}

export default function Home() {
  const router = useRouter();
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [showSavedProfiles, setShowSavedProfiles] = useState(false);

  useEffect(() => {
    // Load saved profiles from localStorage
    const patientProfile = localStorage.getItem('patientProfile');
    const researcherProfile = localStorage.getItem('researcherProfile');
    
    const profiles: SavedProfile[] = [];
    
    if (patientProfile) {
      const data = JSON.parse(patientProfile);
      profiles.push({
        type: 'patient',
        name: data.name || 'Patient Profile',
        location: data.location,
        condition: data.condition,
        lastAccessed: data.lastAccessed || new Date().toISOString()
      });
    }
    
    if (researcherProfile) {
      const data = JSON.parse(researcherProfile);
      profiles.push({
        type: 'researcher',
        name: data.name || 'Researcher Profile',
        location: data.institution,
        specialty: data.specialties?.[0],
        lastAccessed: data.lastAccessed || new Date().toISOString()
      });
    }
    
    setSavedProfiles(profiles);
    setShowSavedProfiles(profiles.length > 0);
  }, []);

  const handleProfileAccess = (profile: SavedProfile) => {
    // Update last accessed time
    const storageKey = `${profile.type}Profile`;
    const existingData = localStorage.getItem(storageKey);
    if (existingData) {
      const data = JSON.parse(existingData);
      data.lastAccessed = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
    
    // Navigate to dashboard
    router.push(`/${profile.type}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/25 transform hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-4xl">C</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce"></div>
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">CuraLink</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-8"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Connect. Discover. Advance.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              AI-powered healthcare platform connecting patients and researchers for clinical trials, expert consultations, and medical research collaboration.
            </p>
          </div>

          {/* Saved Profiles Section */}
          {showSavedProfiles && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Welcome Back!</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {savedProfiles.map((profile, index) => (
                  <div
                    key={index}
                    onClick={() => handleProfileAccess(profile)}
                    className="cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">
                          {profile.type === 'patient' ? '🏥' : '🔬'}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800">{profile.name}</div>
                        <div className="text-sm text-gray-600">
                          {profile.condition && <div>Condition: {profile.condition}</div>}
                          {profile.specialty && <div>Specialty: {profile.specialty}</div>}
                          {profile.location && <div>📍 {profile.location}</div>}
                        </div>
                      </div>
                      <div className="text-indigo-600 text-xl">→</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Or create a new profile below</p>
              </div>
            </div>
          )}

          {/* Main Profile Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Patient Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div 
                onClick={() => router.push('/patient/onboarding')}
                className="relative cursor-pointer bg-white/80 backdrop-blur-xl border border-white/30 p-10 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <div className="relative text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-4xl">🏥</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-indigo-600 text-sm font-semibold mb-2">I am a</p>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Patient / Caregiver</h3>
                  </div>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🧪</span>
                      <span className="text-sm">Find Clinical Trials</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">👨⚕️</span>
                      <span className="text-sm">Connect with Experts</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">📚</span>
                      <span className="text-sm">Access Research</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      Get Started →
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Researcher Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div 
                onClick={() => router.push('/researcher/onboarding')}
                className="relative cursor-pointer bg-white/80 backdrop-blur-xl border border-white/30 p-10 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
                <div className="relative text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-4xl">🔬</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-purple-600 text-sm font-semibold mb-2">I am a</p>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Researcher</h3>
                  </div>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🤝</span>
                      <span className="text-sm">Find Collaborators</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">📊</span>
                      <span className="text-sm">Manage Trials</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">💬</span>
                      <span className="text-sm">Engage Community</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      Get Started →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-w-2xl mx-auto">
              <p className="text-gray-600 mb-4 font-medium">
                🚀 Empowering healthcare through AI-powered connections
              </p>
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span>✅ HIPAA Compliant</span>
                <span>✅ Global Network</span>
                <span>✅ Real-time Matching</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-xs text-gray-400 hover:text-indigo-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 hover:border-indigo-200"
                >
                  🛡️ Admin Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}