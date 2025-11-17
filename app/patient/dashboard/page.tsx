'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../lib/api';
import ClinicalTrialsTab from './components/ClinicalTrialsTab';
import HealthExpertsTab from './components/HealthExpertsTab';
import PublicationsTab from './components/PublicationsTab';
import ForumsTab from './components/ForumsTab';
import FavoritesTab from './components/FavoritesTab';
import AIAssistant from '../../../components/AIAssistant';

interface PatientProfile {
  name: string;
  condition: string;
  location: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('patientActiveTab') || 'overview';
    }
    return 'overview';
  });
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for navigation events from child components
    const handleNavigation = (event: any) => {
      if (event.detail) {
        setActiveTab(event.detail);
        localStorage.setItem('patientActiveTab', event.detail);
      }
    };
    
    window.addEventListener('navigateToTab', handleNavigation);
    
    const loadProfile = async () => {
      const savedProfile = localStorage.getItem('patientProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        // Update last accessed time
        const updatedProfile = {
          ...profileData,
          lastAccessed: new Date().toISOString()
        };
        localStorage.setItem('patientProfile', JSON.stringify(updatedProfile));
        setProfile(profileData);
        
        // Update last accessed time in Supabase
        try {
          await apiService.createPatientProfile({
            condition: profileData.condition || '',
            location: profileData.location || '',
            additional_conditions: profileData.additionalConditions || []
          });
        } catch (error) {
          // Silently handle Supabase connection issues
        }
        
        // Only load recommendations when overview tab is active
        if (activeTab === 'overview') {
          loadPersonalizedRecommendations(profileData);
        }
      } else {
        router.push('/patient/onboarding');
      }
    };
    
    loadProfile();
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigation);
    };
  }, [router, activeTab]);

  const loadPersonalizedRecommendations = async (profileData: PatientProfile) => {
    if (recommendations) return; // Don't reload if already loaded
    
    setLoading(true);
    try {
      // Load data for top recommendations with proper search terms
      const [trialsResponse, expertsResponse, publicationsResponse] = await Promise.all([
        apiService.getClinicalTrials(profileData.condition, profileData.location).catch(() => ({ trials: [] })),
        apiService.getHealthExperts(profileData.condition, profileData.location).catch(() => ({ experts: [] })),
        apiService.getPublications(profileData.condition, '').catch(() => ({ publications: [] }))
      ]);
      
      // Remove duplicates and calculate scores
      const uniqueTrials = removeDuplicates(trialsResponse.trials || [], 'title');
      const uniqueExperts = removeDuplicates(expertsResponse.experts || [], 'name');
      const uniquePublications = removeDuplicates(publicationsResponse.publications || [], 'title');
      
      const scoredTrials = uniqueTrials.map((trial: any) => ({
        ...trial,
        score: calculateTrialScore(trial, profileData)
      })).sort((a: any, b: any) => b.score - a.score);
      
      const scoredExperts = uniqueExperts.map((expert: any) => ({
        ...expert,
        score: calculateExpertScore(expert, profileData)
      })).sort((a: any, b: any) => b.score - a.score);
      
      const scoredPublications = uniquePublications.map((pub: any) => ({
        ...pub,
        score: calculatePublicationScore(pub, profileData)
      })).sort((a: any, b: any) => b.score - a.score);
      
      setRecommendations({
        trials: scoredTrials.slice(0, 3),
        experts: scoredExperts.slice(0, 3),
        publications: scoredPublications.slice(0, 3)
      });
    } catch (error) {
      // Silently handle API failures and show empty state
      setRecommendations({
        trials: [],
        experts: [],
        publications: []
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = (items: any[], key: string) => {
    const seen = new Set();
    return items.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  };

  const calculateTrialScore = (trial: any, profile: PatientProfile) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    if (trial.title.toLowerCase().includes(condition)) score += 40;
    if (trial.status === 'Recruiting') score += 30;
    if (trial.phase === 'Phase III') score += 20;
    if (trial.location.toLowerCase().includes(profile.location.toLowerCase())) score += 10;
    return score;
  };

  const calculateExpertScore = (expert: any, profile: PatientProfile) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const location = profile.location.toLowerCase();
    
    // Specialty match (40% weight)
    if (expert.specialty.toLowerCase().includes(condition)) score += 40;
    else if (condition.includes('parkinson') && expert.specialty.toLowerCase().includes('movement disorders')) score += 35;
    else if (condition.includes('cancer') && expert.specialty.toLowerCase().includes('oncology')) score += 35;
    
    // Research interests match (30% weight)
    const matchingInterests = (expert.research_interests || []).filter((interest: string) => 
      interest.toLowerCase().includes(condition) || 
      (condition.includes('parkinson') && interest.toLowerCase().includes('deep brain stimulation'))
    ).length;
    score += Math.min(matchingInterests * 15, 30);
    
    // Location proximity (20% weight)
    if (expert.location.toLowerCase().includes(location.split(',')[0])) score += 20;
    else if (expert.location.toLowerCase().includes(location.split(',')[1]?.trim() || '')) score += 15;
    
    // Availability (10% weight)
    if (expert.available_for_meetings) score += 10;
    
    return Math.min(score, 100);
  };

  const calculatePublicationScore = (pub: any, profile: PatientProfile) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const title = pub.title.toLowerCase();
    const abstract = pub.abstract?.toLowerCase() || '';
    
    // Title relevance (40% weight)
    if (title.includes(condition)) score += 40;
    else if (condition.includes('parkinson') && title.includes('deep brain stimulation')) score += 35;
    else if (title.includes(condition.split(' ')[0])) score += 25;
    
    // Abstract relevance (25% weight)
    if (abstract.includes(condition)) score += 25;
    else if (abstract.includes(condition.split(' ')[0])) score += 15;
    
    // Journal impact (20% weight)
    const journal = pub.journal.toLowerCase();
    if (journal.includes('nature') || journal.includes('nejm') || journal.includes('lancet')) score += 20;
    else if (journal.includes('journal')) score += 10;
    
    // Recency (15% weight)
    const year = parseInt(pub.date);
    const currentYear = new Date().getFullYear();
    const yearsOld = currentYear - year;
    if (yearsOld <= 1) score += 15;
    else if (yearsOld <= 3) score += 10;
    else if (yearsOld <= 5) score += 5;
    
    return Math.min(score, 100);
  };

  if (!profile) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-indigo-500/5">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-elevated transform hover:scale-105 transition-transform duration-200">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">CuraLink</h1>
                  <p className="text-xs text-gray-600 font-medium">Healthcare Innovation Platform</p>
                </div>
              </button>
              <div className="ml-6 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm border border-indigo-200/50 rounded-full">
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Patient Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-bold text-gray-800">{profile.name}</p>
              </div>
              <button 
                onClick={() => router.push('/patient/onboarding')}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold shadow-elevated hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">Edit Profile</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Profile Summary */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-500/10 p-4 sm:p-8 mb-4 sm:mb-8 border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5"></div>
          <div className="relative">
            {/* Header with Avatar and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{profile.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Your Health Profile</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Profile Active & Personalized</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 rounded-full">
                <span className="text-sm font-semibold text-green-700">✓ Active</span>
              </div>
            </div>
            
            {/* Interactive Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Patient Info Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                  <h3 className="text-sm font-semibold text-gray-700">Patient Information</h3>
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">ID</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Name</span>
                    <span className="text-xs font-semibold text-gray-700">{profile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Status</span>
                    <span className="text-xs font-semibold text-green-700">🟢 Active Patient</span>
                  </div>
                </div>
              </div>
              
              {/* Condition Card */}
              <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  <h3 className="text-sm font-semibold text-gray-700">Health Focus</h3>
                  <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Primary</span>
                </div>
                <div className="text-center py-2">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-200/50 text-purple-700 rounded-lg font-medium backdrop-blur-sm hover:bg-purple-500/20 transition-colors cursor-pointer">
                    <span className="mr-2">🎯</span>
                    <span className="text-sm">{profile.condition.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</span>
                  </div>
                </div>
              </div>
              
              {/* Location & Preferences Card */}
              <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
                  <h3 className="text-sm font-semibold text-gray-700">Location & Access</h3>
                  <span className="ml-auto text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Local</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Location</span>
                    <span className="text-xs font-semibold text-gray-700">📍 {profile.location}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Search Radius</span>
                    <span className="text-xs font-semibold text-gray-700">🌐 Global + Local Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600 font-medium">Dashboard</span>
            <span className="text-gray-400">›</span>
            <span className="text-indigo-600 font-semibold capitalize">
              {activeTab === 'overview' ? 'Overview' : 
               activeTab === 'trials' ? 'Clinical Trials' :
               activeTab === 'experts' ? 'Health Experts' :
               activeTab === 'publications' ? 'Publications' :
               activeTab === 'forums' ? 'Forums' :
               activeTab === 'favorites' ? 'Favorites' : activeTab}
            </span>
          </nav>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg shadow-indigo-500/10 border border-white/20">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'trials', label: 'Clinical Trials', icon: '🧪' },
                { id: 'experts', label: 'Health Experts', icon: '👨‍⚕️' },
                { id: 'publications', label: 'Publications', icon: '📚' },
                { id: 'forums', label: 'Forums', icon: '💬' },
                { id: 'favorites', label: 'Favorites', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    localStorage.setItem('patientActiveTab', tab.id);
                  }}
                  className={`relative px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap focus-ring ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-800 hover:text-indigo-700 hover:bg-indigo-100 border border-transparent hover:border-indigo-200'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live data from ClinicalTrials.gov, PubMed & ORCID</span>
              </div>
              <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Top Clinical Trials */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">🏆 Top Clinical Trials</h3>
                <span className="text-xs bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 text-green-700 px-3 py-1 rounded-full font-semibold">Ranked</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  (recommendations?.trials || []).map((trial: any, index: number) => (
                    <div key={trial.id} className="border-l-4 border-indigo-500 pl-4 relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          {trial.score}% match
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-700">{trial.title}</h4>
                      <p className="text-xs text-gray-700">{trial.phase} • {trial.status}</p>
                      <p className="text-xs text-gray-500">📍 {trial.location}</p>
                    </div>
                  )) || <p className="text-sm text-gray-500">No trials found for your condition</p>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('trials')}
                className="mt-4 text-indigo-600 text-sm hover:underline font-medium"
              >
                View all trials →
              </button>
            </div>

            {/* Top Health Experts */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">🥼 Top Researchers</h3>
                <span className="text-xs bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 text-blue-700 px-3 py-1 rounded-full font-semibold">Ranked</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  (recommendations?.experts || []).map((expert: any, index: number) => (
                    <div key={expert.id} className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {expert.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <span className={`absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          'bg-orange-400 text-orange-900'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-700">{expert.name}</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {expert.score}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">{expert.specialty}</p>
                        <p className="text-xs text-gray-500">📍 {expert.location}</p>
                      </div>
                    </div>
                  )) || <p className="text-sm text-gray-500">No experts found for your condition</p>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('experts')}
                className="mt-4 text-indigo-600 text-sm hover:underline font-medium"
              >
                View all researchers →
              </button>
            </div>

            {/* Top Publications */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">📚 Top Research Papers</h3>
                <span className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 text-purple-700 px-3 py-1 rounded-full font-semibold">Ranked</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  (recommendations?.publications || []).map((pub: any, index: number) => (
                    <div key={pub.id} className="border-l-4 border-purple-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                          {pub.score}% relevance
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-700 line-clamp-2">{pub.title}</h4>
                      <p className="text-xs text-gray-700">{pub.journal} • {pub.date}</p>
                      {pub.pmid && (
                        <a 
                          href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          Read paper →
                        </a>
                      )}
                    </div>
                  )) || <p className="text-sm text-gray-500">No publications found for your condition</p>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('publications')}
                className="mt-4 text-indigo-600 text-sm hover:underline font-medium"
              >
                View all research →
              </button>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'trials' && (
          <ClinicalTrialsTab profile={profile} />
        )}

        {activeTab === 'experts' && (
          <HealthExpertsTab profile={profile} />
        )}

        {activeTab === 'publications' && (
          <PublicationsTab profile={profile} />
        )}

        {activeTab === 'forums' && (
          <ForumsTab profile={profile} />
        )}

        {activeTab === 'favorites' && (
          <FavoritesTab profile={profile} />
        )}
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant userType="patient" userProfile={profile} />
    </div>
  );
}