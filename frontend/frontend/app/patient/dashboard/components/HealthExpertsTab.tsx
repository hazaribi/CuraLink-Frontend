'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../../lib/api';
import MeetingRequestModal from './MeetingRequestModal';
import ResearcherProfileModal from './ResearcherProfileModal';

interface PatientProfile {
  condition: string;
  location: string;
}

interface HealthExpert {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  location: string;
  available_for_meetings: boolean;
  research_interests: string[];
}

export default function HealthExpertsTab({ profile }: { profile: PatientProfile }) {
  const [experts, setExperts] = useState<HealthExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<HealthExpert | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileExpert, setProfileExpert] = useState<HealthExpert | null>(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [includeExternal, setIncludeExternal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.condition) {
      loadExperts();
      loadFavorites();
    }
  }, [profile?.condition]);

  const loadExperts = async () => {
    try {
      // Always pass the condition to get relevant experts
      const searchQuery = searchTerm ? `${profile.condition} ${searchTerm}` : profile.condition;
      const response = await apiService.getHealthExperts(searchQuery, profile.location, includeExternal);
      setExperts(response.experts || []);
    } catch (error) {
      console.warn('Experts API unavailable, using fallback data');
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (includeExternal) {
      setLoading(true);
      loadExperts();
    }
  }, [includeExternal]);

  // Reload experts when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profile?.condition) {
        setLoading(true);
        loadExperts();
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadFavorites = () => {
    const saved = localStorage.getItem('patientFavorites');
    if (saved) {
      const allFavorites = JSON.parse(saved);
      setFavorites(allFavorites.experts || []);
    }
  };

  const toggleFavorite = (expertId: number) => {
    const saved = localStorage.getItem('patientFavorites') || '{}';
    const allFavorites = JSON.parse(saved);
    const currentExperts = allFavorites.experts || [];
    
    const newExperts = currentExperts.includes(expertId)
      ? currentExperts.filter((id: number) => id !== expertId)
      : [...currentExperts, expertId];
    
    const updatedFavorites = { ...allFavorites, experts: newExperts };
    localStorage.setItem('patientFavorites', JSON.stringify(updatedFavorites));
    setFavorites(newExperts);
  };

  const requestMeeting = (expert: HealthExpert) => {
    setSelectedExpert(expert);
    setShowMeetingModal(true);
  };

  const viewProfile = (expert: HealthExpert) => {
    setProfileExpert(expert);
    setShowProfileModal(true);
  };

  const handleProfileMeetingRequest = (expert: HealthExpert) => {
    setShowProfileModal(false);
    setSelectedExpert(expert);
    setShowMeetingModal(true);
  };

  const handleMeetingRequest = async (requestData: any) => {
    const expert = selectedExpert!;
    
    try {
      // Try to send to backend API
      const response = await apiService.createMeetingRequest({
        patient_name: requestData.patientName,
        email: requestData.email,
        phone: requestData.phone,
        preferred_date: requestData.preferredDate,
        preferred_time: requestData.preferredTime,
        meeting_type: requestData.meetingType,
        message: requestData.message,
        urgency: requestData.urgency,
        researcher_id: requestData.expertId.toString()
      });
      
      if ((response as any).type === 'admin_request') {
        alert(`Request saved locally for ${requestData.expertName}. We'll reach out to them and invite them to join the platform.`);
      } else {
        alert(`Meeting request sent to ${requestData.expertName}! They will respond within 24-48 hours.`);
      }
    } catch (error) {
      console.error('Backend API failed, storing locally:', error);
      
      // Store locally when backend fails
      const existingRequests = JSON.parse(localStorage.getItem('meetingRequests') || '[]');
      const newRequest = {
        id: Date.now(),
        ...requestData,
        expertName: expert.name,
        status: 'pending',
        isExternal: !expert.available_for_meetings,
        requestType: expert.available_for_meetings ? 'direct' : 'admin',
        createdAt: new Date().toISOString()
      };
      existingRequests.push(newRequest);
      localStorage.setItem('meetingRequests', JSON.stringify(existingRequests));
      
      if (!expert.available_for_meetings) {
        alert(`Request saved locally for ${expert.name}. We'll reach out to them and invite them to join the platform.`);
      } else {
        alert(`Meeting request saved locally for ${expert.name}! They will respond within 24-48 hours.`);
      }
    }
  };

  const calculateLocationDistance = (expertLocation: string, patientLocation: string) => {
    const expert = expertLocation.toLowerCase();
    const patient = patientLocation.toLowerCase();
    
    // Exact city match
    if (expert.includes(patient.split(',')[0])) return 0;
    
    // Same country/region match
    const patientParts = patient.split(',').map(p => p.trim());
    const expertParts = expert.split(',').map(p => p.trim());
    
    // Same country
    if (patientParts.length > 1 && expertParts.length > 1) {
      if (expertParts[expertParts.length - 1] === patientParts[patientParts.length - 1]) return 1;
    }
    
    // Same continent (rough approximation)
    const northAmerica = ['usa', 'canada', 'united states', 'america'];
    const europe = ['netherlands', 'germany', 'france', 'uk', 'england'];
    
    const patientRegion = northAmerica.some(r => patient.includes(r)) ? 'na' : 
                         europe.some(r => patient.includes(r)) ? 'eu' : 'other';
    const expertRegion = northAmerica.some(r => expert.includes(r)) ? 'na' : 
                        europe.some(r => expert.includes(r)) ? 'eu' : 'other';
    
    if (patientRegion === expertRegion) return 2;
    return 3;
  };

  const calculateExpertMatchScore = (expert: HealthExpert) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const specialty = expert.specialty.toLowerCase();
    const interests = (expert.research_interests || []).map(i => i.toLowerCase());
    
    // Specialty match (35% weight)
    if (specialty.includes(condition)) score += 35;
    else if (condition.includes('cancer') && specialty.includes('oncology')) score += 30;
    else if (condition.includes('heart') && specialty.includes('cardiology')) score += 30;
    else if (condition.includes('brain') && specialty.includes('neurology')) score += 30;
    
    // Research interests match (30% weight)
    const matchingInterests = interests.filter(interest => 
      interest.includes(condition) || condition.includes(interest)
    ).length;
    score += Math.min(matchingInterests * 10, 30);
    
    // Location proximity (25% weight - increased from 20%)
    const distance = calculateLocationDistance(expert.location, profile.location);
    if (distance === 0) score += 25; // Same city
    else if (distance === 1) score += 20; // Same country
    else if (distance === 2) score += 10; // Same continent
    else score += 0; // Different continent
    
    // Availability bonus (10% weight - decreased from 15%)
    if (expert.available_for_meetings) score += 10;
    else score += 5;
    
    return Math.min(score, 100);
  };

  const filteredExperts = experts.filter(expert => {
    const searchLower = searchTerm.toLowerCase();
    const conditionLower = profile.condition.toLowerCase();
    
    // Enhanced search: combine user's condition with search term for disease-specific results
    const enhancedSearch = searchTerm ? `${conditionLower} ${searchLower}` : conditionLower;
    
    const matchesSearch = expert.name.toLowerCase().includes(searchLower) ||
      expert.specialty.toLowerCase().includes(searchLower) ||
      expert.institution.toLowerCase().includes(searchLower) ||
      (expert.research_interests || []).some(interest => 
        interest.toLowerCase().includes(searchLower) ||
        interest.toLowerCase().includes(enhancedSearch) ||
        (searchTerm && interest.toLowerCase().includes(`${conditionLower} ${searchLower}`))
      ) ||
      // Disease-specific matching: search term + condition
      (searchTerm && (
        expert.specialty.toLowerCase().includes(enhancedSearch) ||
        expert.name.toLowerCase().includes(enhancedSearch) ||
        expert.institution.toLowerCase().includes(enhancedSearch)
      ));
    
    if (showAllLocations) return matchesSearch;
    
    if (!filterCity && !filterCountry) return matchesSearch;
    
    const matchesLocation = (filterCity ? expert.location.toLowerCase().includes(filterCity.toLowerCase()) : true) &&
      (filterCountry ? expert.location.toLowerCase().includes(filterCountry.toLowerCase()) : true);
    
    return matchesSearch && matchesLocation;
  }).map(expert => ({ 
    ...expert, 
    matchScore: calculateExpertMatchScore(expert),
    locationDistance: calculateLocationDistance(expert.location, profile.location)
  }))
    .sort((a, b) => {
      // Primary sort: location distance (closest first)
      if (a.locationDistance !== b.locationDistance) {
        return a.locationDistance - b.locationDistance;
      }
      // Secondary sort: match score (highest first)
      return b.matchScore - a.matchScore;
    });

  if (loading) return <div className="text-center py-8">Loading experts...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Health Experts</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Live data from PubMed, ORCID & platform profiles</span>
            </div>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search (auto-includes ${profile.condition}): e.g., "deep brain stimulation", "immunotherapy", "diet"`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            autoComplete="off"
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">💡 Search automatically includes your condition ({profile.condition}). Try: "deep brain stimulation", "immunotherapy", "stem cell therapy"</p>
            <p className="text-xs text-indigo-600">External sources: PubMed, ORCID, Google Scholar, ClinicalTrials.gov, ResearchGate</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Location Filters</h4>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showAllLocations}
                  onChange={(e) => setShowAllLocations(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Show all experts globally</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeExternal}
                  onChange={(e) => setIncludeExternal(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-indigo-600">🌐 Include external researchers</span>
              </label>
            </div>
          </div>
          
          {!showAllLocations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Country"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <div key={expert.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow duration-200">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => viewProfile(expert)}
                    className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                  >
                    {expert.name}
                  </button>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    (expert as any).matchScore >= 80 ? 'bg-green-100 text-green-800' :
                    (expert as any).matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(expert as any).matchScore}% match
                  </span>
                </div>
                <p className="text-sm text-gray-800 font-medium">{expert.specialty}</p>
                {(expert as any).source && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {(expert as any).source}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-800 mb-2 font-medium">{expert.institution}</p>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-gray-600">{expert.location}</p>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                (expert as any).locationDistance === 0 ? 'bg-green-100 text-green-800' :
                (expert as any).locationDistance === 1 ? 'bg-blue-100 text-blue-800' :
                (expert as any).locationDistance === 2 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(expert as any).locationDistance === 0 ? '📍 Local' :
                 (expert as any).locationDistance === 1 ? '🌍 Same Country' :
                 (expert as any).locationDistance === 2 ? '🌎 Same Region' :
                 '🌏 International'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${expert.available_for_meetings ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className="text-xs text-gray-600">
                {expert.available_for_meetings ? 'Available for meetings' : 
                 (expert as any).source ? 'External - Contact via Admin' : 'Not available'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {(expert.research_interests || []).slice(0, 2).map((interest) => (
                <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {interest}
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => viewProfile(expert)}
                className="flex-1 py-2 px-3 rounded text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 font-medium focus-ring transition-colors duration-200"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  const context = `Patient with ${profile.condition} seeking consultation for ${expert.specialty}. Location: ${profile.location}`;
                  if (expert.available_for_meetings) {
                    requestMeeting(expert);
                  } else {
                    alert(`Request sent to ${expert.name}!\n\nContext: ${context}\n\nWe'll reach out to them and invite them to join the platform. You'll be notified when they respond.`);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium focus-ring transition-colors duration-200 ${
                  expert.available_for_meetings 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500'
                    : 'bg-orange-600 text-white hover:bg-orange-700 border border-orange-500'
                }`}
              >
                {expert.available_for_meetings ? 'Request Consultation' : 'Request via Admin'}
              </button>
              {!expert.available_for_meetings && (expert as any).profile_type === 'external_pubmed' && (
                <button
                  onClick={async () => {
                    try {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                      if (!API_URL.startsWith('http://localhost') && !API_URL.startsWith('https://')) {
                        throw new Error('Invalid API URL');
                      }
                      await fetch(`${API_URL}/api/admin/flag-missing-contact`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(expert)
                      });
                      alert(`${expert.name} flagged for missing contact info. Admin will investigate.`);
                    } catch (error) {
                      console.error('Backend failed, flagging locally:', error);
                      alert(`${expert.name} flagged locally for missing contact info.`);
                    }
                  }}
                  className="px-2 py-2 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                >
                  🚩 Flag
                </button>
              )}
              <button
                onClick={() => toggleFavorite(expert.id)}
                className={`flex-1 text-sm rounded py-2 px-3 ${
                  favorites.includes(expert.id)
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {favorites.includes(expert.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredExperts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No experts found matching your search.
        </div>
      )}
      
      {selectedExpert && (
        <MeetingRequestModal
          expert={selectedExpert}
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          onSubmit={handleMeetingRequest}
        />
      )}
      
      <ResearcherProfileModal
        expert={profileExpert}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onRequestMeeting={handleProfileMeetingRequest}
      />
    </div>
  );
}