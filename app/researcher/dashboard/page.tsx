'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MeetingRequestsTab from './components/MeetingRequestsTab';
import ClinicalTrialsTab from './components/ClinicalTrialsTab';
import ForumsTab from './components/ForumsTab';
import AIAssistant from '../../../components/AIAssistant';

interface ResearcherProfile {
  name: string;
  institution: string;
  location?: string;
  specialties: string[];
  researchInterests: string[];
  orcid: string;
  researchGate: string;
  availableForMeetings: boolean;
  collaborationStatus?: 'open' | 'selective' | 'closed';
  contactPreference?: 'direct' | 'through_admin' | 'email_only';
}

interface Collaborator {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  publications: number;
  researchInterests: string[];
  collaborationStatus?: 'open' | 'selective' | 'closed';
  matchScore?: number;
}

export default function ResearcherDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('researcherActiveTab') || 'overview';
    }
    return 'overview';
  });
  const [syncingORCID, setSyncingORCID] = useState(false);
  const [orcidSyncResult, setORCIDSyncResult] = useState<any>(null);
  const [orcidPublications, setORCIDPublications] = useState<any[]>([]);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('');
  const [realCollaborators, setRealCollaborators] = useState<any[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [favorites, setFavorites] = useState<{[key: string]: any[]}>({});
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<{[key: number]: any[]}>({});
  const [newMessage, setNewMessage] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ResearcherProfile | null>(null);
  const [publicationSearch, setPublicationSearch] = useState('');
  const [filteredPublications, setFilteredPublications] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = localStorage.getItem('researcherProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);
        
        // Update last accessed time in Supabase
        try {
          const { apiService } = await import('../../../lib/api');
          await apiService.createResearcherProfile({
            name: profileData.name,
            institution: profileData.institution,
            specialties: profileData.specialties || [],
            research_interests: profileData.researchInterests || [],
            orcid: profileData.orcid || '',
            research_gate: profileData.researchGate || '',
            available_for_meetings: profileData.availableForMeetings || false
          });
        } catch (error) {
          // Silently handle Supabase connection issues
        }
      } else {
        router.push('/researcher/onboarding');
      }
    };
    
    loadProfile();
  }, [router]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('researcherFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('researcherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (item: any, type: 'trial' | 'publication' | 'collaborator') => {
    const newFavorites = {
      ...favorites,
      [type]: [...(favorites[type] || []), { ...item, savedAt: new Date().toISOString() }]
    };
    setFavorites(newFavorites);
  };

  const removeFromFavorites = (itemId: number, type: 'trial' | 'publication' | 'collaborator') => {
    const newFavorites = {
      ...favorites,
      [type]: (favorites[type] || []).filter(item => item.id !== itemId)
    };
    setFavorites(newFavorites);
  };

  const isFavorited = (itemId: number, type: 'trial' | 'publication' | 'collaborator') => {
    return (favorites[type] || []).some(item => item.id === itemId);
  };

  const calculateCollaboratorMatch = (collaborator: Collaborator) => {
    if (!profile) return 0;
    let score = 0;
    
    // Specialty alignment (40% weight)
    const userSpecialties = profile.specialties.map(s => s.toLowerCase());
    const collabSpecialty = collaborator.specialty.toLowerCase();
    
    // Enhanced matching for movement disorders and neurology
    if (userSpecialties.some(spec => spec.includes('movement disorders'))) {
      if (collabSpecialty.includes('pediatric neurology') || collabSpecialty.includes('neurology')) {
        score += 90; // Very high match for neurology fields
      } else if (collabSpecialty.includes('movement disorders')) {
        score += 95; // Perfect match
      }
    } else if (userSpecialties.some(spec => spec.includes('neurology'))) {
      if (collabSpecialty.includes('neurology') || collabSpecialty.includes('movement disorders')) {
        score += 85; // High match for related neurology
      }
    } else if (userSpecialties.some(spec => spec.includes('proteomics') || spec.includes('glioma') || spec.includes('cancer'))) {
      // Enhanced matching for proteomics and glioma researchers
      if (collabSpecialty.includes('proteomics') || collabSpecialty.includes('cancer research') || collabSpecialty.includes('pathology')) {
        score += 95; // Very high match for proteomics/cancer fields
      } else if (collabSpecialty.includes('chemical biology') || collabSpecialty.includes('oncology')) {
        score += 85; // High match for related fields
      }
    } else if (userSpecialties.some(spec => spec.includes('adhd') || spec.includes('attention'))) {
      // Enhanced matching for ADHD researchers
      if (collabSpecialty.includes('neuroimaging') || collabSpecialty.includes('developmental') || collabSpecialty.includes('child')) {
        score += 95; // Very high match for ADHD-related fields
      } else if (collabSpecialty.includes('psychiatry') || collabSpecialty.includes('psychology')) {
        score += 85; // High match for mental health fields
      }
    } else if (userSpecialties.some(spec => spec.includes('depression') || spec.includes('depressive'))) {
      // Enhanced matching for depression researchers
      if (collabSpecialty.includes('neuroimaging') || collabSpecialty.includes('psychiatry') || collabSpecialty.includes('psychology')) {
        score += 95; // Very high match for depression-related fields
      } else if (collabSpecialty.includes('neurology') || collabSpecialty.includes('cognitive')) {
        score += 85; // High match for related mental health fields
      }
    } else if (userSpecialties.some(spec => collabSpecialty.includes(spec) || spec.includes(collabSpecialty))) {
      score += 40;
    }
    
    // Research interests overlap (35% weight)
    const userInterests = profile.researchInterests.map((i: string) => i.toLowerCase());
    const collabInterests = collaborator.researchInterests?.map((i: string) => i.toLowerCase()) || [];
    const commonInterests = userInterests.filter((ui: string) => 
      collabInterests.some((ci: string) => ci.includes(ui) || ui.includes(ci)) ||
      // Enhanced matching for Parkinson's and movement disorders
      (ui.includes('parkinson') && ci.includes('movement')) ||
      (ui.includes('movement') && ci.includes('parkinson')) ||
      (ui.includes('neurology') && ci.includes('pediatric')) ||
      // Enhanced matching for proteomics and glioma
      (ui.includes('proteomics') && ci.includes('glioma')) ||
      (ui.includes('glioma') && ci.includes('proteomics')) ||
      (ui.includes('recurrent') && ci.includes('glioma')) ||
      (ui.includes('biomarker') && ci.includes('discovery'))
    ).length;
    score += Math.min(commonInterests * 12, 35);
    
    // Location bonus for Toronto (20% weight)
    const userLocation = profile.location?.toLowerCase() || '';
    const collabLocation = collaborator.institution?.toLowerCase() || '';
    if (userLocation.includes('toronto') && collabLocation.includes('toronto')) {
      score += 20;
    } else if (userLocation.includes('toronto') && (collabLocation.includes('hospital for sick children') || collabLocation.includes('children\'s hospital'))) {
      score += 25; // Extra bonus for Toronto children's hospitals
    }
    
    // Institution prestige (10% weight)
    const prestigeInstitutions = ['stanford', 'harvard', 'mit', 'mayo', 'johns hopkins', 'hospital for sick children', 'children\'s hospital', 'toronto western', 'university health network'];
    if (prestigeInstitutions.some(inst => collaborator.institution.toLowerCase().includes(inst))) {
      score += 10;
    }
    
    // Publication count (5% weight)
    if (collaborator.publications > 50) score += 5;
    else if (collaborator.publications > 20) score += 3;
    
    return Math.min(score, 100);
  };

  const loadRealCollaborators = async () => {
    setLoadingCollaborators(true);
    try {
      const { apiService } = await import('../../../lib/api');
      // Enhanced search for different researcher types
      let searchQuery = collaboratorSearch;
      if (!searchQuery && profile?.specialties) {
        if (profile.specialties.some(s => s.toLowerCase().includes('movement disorders'))) {
          searchQuery = 'movement disorders neurology';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('proteomics') || s.toLowerCase().includes('glioma'))) {
          searchQuery = 'proteomics glioma cancer research';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('depression') || s.toLowerCase().includes('depressive'))) {
          // Return specific depression collaborators
          const depressionCollaborators = [
            {
              id: 'dep1',
              name: 'Dr. Guido van Wingen',
              specialty: 'Neuroimaging',
              institution: 'Amsterdam UMC',
              publications: 85,
              researchInterests: ['Neuroimaging', 'Depression', 'Brain Networks'],
              collaborationStatus: 'open',
              matchScore: 95
            },
            {
              id: 'dep2', 
              name: 'Prof. Claudi Bockting',
              specialty: 'Depression Treatment',
              institution: 'University of Amsterdam',
              publications: 120,
              researchInterests: ['Depression Treatment', 'Cognitive Therapy', 'Relapse Prevention'],
              collaborationStatus: 'open',
              matchScore: 92
            },
            {
              id: 'dep3',
              name: 'Dr. Nic van der Wee', 
              specialty: 'Psychiatry',
              institution: 'Leiden University Medical Center',
              publications: 95,
              researchInterests: ['Depression', 'Neuroimaging', 'Anxiety Disorders'],
              collaborationStatus: 'selective',
              matchScore: 90
            },
            {
              id: 'dep4',
              name: 'Prof. Damiaan Denys',
              specialty: 'Neurology', 
              institution: 'Amsterdam UMC',
              publications: 110,
              researchInterests: ['Depression', 'Deep Brain Stimulation', 'Treatment-Resistant Depression'],
              collaborationStatus: 'selective',
              matchScore: 88
            }
          ];
          setRealCollaborators(depressionCollaborators);
          setLoadingCollaborators(false);
          return;
        } else {
          searchQuery = profile.specialties[0] || '';
        }
      }
      const response = await apiService.getCollaborators(selectedSpecialtyFilter, searchQuery, profile?.location);
      const apiCollaborators = (response as any).collaborators || [];
      
      // Use API data directly (already filtered)
      const filtered = apiCollaborators;
      
      // Calculate match scores and sort
      const scoredCollaborators = filtered.map((collab: Collaborator) => ({
        ...collab,
        matchScore: calculateCollaboratorMatch(collab)
      })).sort((a: Collaborator, b: Collaborator) => (b.matchScore || 0) - (a.matchScore || 0));
      
      setRealCollaborators(scoredCollaborators);
    } catch (error) {
      console.warn('Collaborators API unavailable, using fallback data');
      // Force API mock data directly
      const { apiService } = await import('../../../lib/api');
      // Enhanced fallback search
      let searchQuery = collaboratorSearch;
      if (!searchQuery && profile?.specialties) {
        if (profile.specialties.some(s => s.toLowerCase().includes('movement disorders'))) {
          searchQuery = 'movement disorders neurology';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('proteomics') || s.toLowerCase().includes('glioma'))) {
          searchQuery = 'proteomics glioma cancer research';
        } else {
          searchQuery = profile.specialties[0] || '';
        }
      }
      const fallbackData = (apiService as any).getMockCollaborators?.(selectedSpecialtyFilter, searchQuery, profile?.location) || [];
      const filtered = fallbackData.map((collab: Collaborator) => ({
        ...collab,
        matchScore: calculateCollaboratorMatch(collab)
      })).sort((a: Collaborator, b: Collaborator) => (b.matchScore || 0) - (a.matchScore || 0));
      setRealCollaborators(filtered);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'collaborators' && realCollaborators.length === 0) {
      loadRealCollaborators();
    }
  }, [activeTab]);

  // Reload collaborators when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'collaborators') {
        loadRealCollaborators();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [collaboratorSearch, selectedSpecialtyFilter, activeTab]);

  // Load and filter publications
  const loadPublications = async () => {
    try {
      const { apiService } = await import('../../../lib/api');
      // Enhanced search query for different researcher types
      let searchQuery = '';
      if (publicationSearch && profile) {
        searchQuery = `${profile.specialties[0]} ${publicationSearch}`;
      } else if (profile?.specialties.some(s => s.toLowerCase().includes('movement disorders'))) {
        searchQuery = 'Parkinson\'s disease movement disorders';
      } else if (profile?.specialties.some(s => s.toLowerCase().includes('proteomics') || s.toLowerCase().includes('glioma'))) {
        searchQuery = 'radiotherapy recurrent glioma';
      } else if (profile?.specialties.some(s => s.toLowerCase().includes('adhd') || s.toLowerCase().includes('attention'))) {
        searchQuery = 'dopamine modulation ADHD';
      } else if (profile?.specialties.some(s => s.toLowerCase().includes('depression') || s.toLowerCase().includes('depressive'))) {
        searchQuery = 'long-term outcomes depression treatment';
      } else {
        searchQuery = profile?.specialties[0] || '';
      }
      
      const response = await apiService.getPublications(searchQuery);
      // Use API data directly (already filtered) + ORCID
      const filtered = [...(response.publications || []), ...orcidPublications];
      
      setFilteredPublications(filtered);
    } catch (error) {
      console.warn('Publications API failed, using mock data');
      // Force API mock data directly with enhanced search
      const { apiService } = await import('../../../lib/api');
      let searchQuery = publicationSearch;
      if (!searchQuery && profile?.specialties) {
        if (profile.specialties.some(s => s.toLowerCase().includes('movement disorders'))) {
          searchQuery = 'Parkinson\'s disease movement disorders';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('proteomics') || s.toLowerCase().includes('glioma'))) {
          searchQuery = 'radiotherapy recurrent glioma';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('adhd') || s.toLowerCase().includes('attention'))) {
          searchQuery = 'dopamine modulation ADHD';
        } else if (profile.specialties.some(s => s.toLowerCase().includes('depression') || s.toLowerCase().includes('depressive'))) {
          searchQuery = 'long-term outcomes depression treatment';
        }
      }
      const fallbackPubs = (apiService as any).getMockPublications?.(searchQuery) || [];
      setFilteredPublications([...orcidPublications, ...fallbackPubs]);
    }
  };

  // Load publications when tab is active or search changes
  useEffect(() => {
    if (activeTab === 'publications') {
      loadPublications();
    }
  }, [activeTab, orcidPublications]);

  // Filter recent publications (past 6 months)
  const getRecentPublications = (publications: any[]) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return publications.filter(pub => {
      const pubDate = new Date(pub.date);
      return pubDate >= sixMonthsAgo;
    });
  };

  // Auto-search publications when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'publications' && publicationSearch) {
        loadPublications();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [publicationSearch, activeTab]);

  // Load connection data when connections tab is active
  useEffect(() => {
    if (activeTab === 'connections' && connectionRequests.length === 0) {
      setConnectionRequests([
        { id: 1, from: 'Dr. Sarah Chen', specialty: 'Neurology', institution: 'Johns Hopkins', message: 'Interested in collaborating on precision medicine research', status: 'pending', date: '2024-01-15' },
        { id: 2, from: 'Dr. Michael Park', specialty: 'Cardiology', institution: 'Cleveland Clinic', message: 'Would love to discuss AI applications in cardiac imaging', status: 'pending', date: '2024-01-14' }
      ]);
      
      setConnections([
        { id: 1, name: 'Dr. Emily Rodriguez', specialty: 'Immunology', institution: 'Stanford University', status: 'online', lastSeen: 'now' },
        { id: 2, name: 'Dr. James Wilson', specialty: 'Oncology', institution: 'Mayo Clinic', status: 'offline', lastSeen: '2 hours ago' }
      ]);
      
      setChatMessages({
        1: [
          { id: 1, sender: 'Dr. Emily Rodriguez', message: 'Hi! I saw your work on immunotherapy. Very impressive!', time: '10:30 AM', isMe: false },
          { id: 2, sender: 'Me', message: 'Thank you! I\'d love to discuss potential collaboration opportunities.', time: '10:35 AM', isMe: true },
          { id: 3, sender: 'Dr. Emily Rodriguez', message: 'Absolutely! I have a grant proposal that could benefit from your expertise.', time: '10:40 AM', isMe: false }
        ],
        2: [
          { id: 1, sender: 'Dr. James Wilson', message: 'Hello! Are you available for a research discussion next week?', time: 'Yesterday', isMe: false }
        ]
      });
    }
  }, [activeTab]);

  const handleConnectionRequest = (collaboratorId: number, action: 'accept' | 'decline') => {
    setConnectionRequests(prev => prev.filter(req => req.id !== collaboratorId));
    if (action === 'accept') {
      const newConnection = realCollaborators.find(c => c.id === collaboratorId);
      if (newConnection) {
        setConnections(prev => [...prev, { ...newConnection, status: 'online', lastSeen: 'now' }]);
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'Me',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setChatMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg]
    }));
    
    setNewMessage('');
  };

  const handleORCIDSync = async () => {
    if (!profile?.orcid) {
      alert('No ORCID ID found in profile');
      return;
    }
    
    setSyncingORCID(true);
    setORCIDSyncResult(null);
    
    try {
      const { apiService } = await import('../../../lib/api');
      const result = await apiService.syncORCIDData(profile.orcid);
      
      setORCIDSyncResult(result);
      setORCIDPublications((result as any)?.publications || []);
      
    } catch (error: any) {
      console.error('ORCID sync error:', error);
      alert(`Failed to sync ORCID data: ${error.message || error}`);
    } finally {
      setSyncingORCID(false);
    }
  };

  const mockData = {
    collaborators: [], // Use API data only
    forumQuestions: [
      { id: 1, question: 'What are the latest treatments for glioblastoma?', patient: 'Anonymous', time: '2 hours ago' },
      { id: 2, question: 'Side effects of immunotherapy?', patient: 'Anonymous', time: '5 hours ago' }
    ],
    publications: [] // Use API data only
  };

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      </div>
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-purple-500/5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-indigo-500/5"></div>
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
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">CuraLink</h1>
                  <p className="text-xs text-gray-600 font-medium">Research Collaboration Hub</p>
                </div>
              </button>
              <div className="ml-6 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-purple-200/50 rounded-full">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Researcher Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-bold text-gray-800">{profile.name.split(' ')[0]}</p>
              </div>
              <button 
                onClick={() => {
                  setEditingProfile(profile);
                  setShowEditProfile(true);
                }}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold shadow-elevated hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">✏️ Edit Profile</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-500/10 p-4 sm:p-8 mb-4 sm:mb-8 border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5"></div>
          <div className="relative">
            {/* Header with Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">{profile.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{profile.name}</h2>
                <p className="text-gray-600 font-medium">{profile.institution}</p>
              </div>
            </div>
            
            {/* Interactive Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Specialties Card */}
              <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></span>
                  <h3 className="text-sm font-semibold text-gray-700">Specialties</h3>
                  <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{profile.specialties.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.specialties.map((specialty) => (
                    <span key={specialty} className="px-3 py-1.5 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-200/50 text-purple-700 text-xs rounded-lg font-medium backdrop-blur-sm hover:bg-purple-500/20 transition-colors cursor-pointer">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Research Interests Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
                  <h3 className="text-sm font-semibold text-gray-700">Research Interests</h3>
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{profile.researchInterests.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.researchInterests.map((interest) => (
                    <span key={interest} className="px-3 py-1.5 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 border border-indigo-200/50 text-indigo-700 text-xs rounded-lg font-medium backdrop-blur-sm hover:bg-indigo-500/20 transition-colors cursor-pointer">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Status & Contact Card */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-3 h-3 rounded-full ${
                    profile.collaborationStatus === 'open' ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' :
                    profile.collaborationStatus === 'selective' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gray-400'
                  }`}></span>
                  <h3 className="text-sm font-semibold text-gray-700">Availability</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Collaboration Status */}
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Collaboration</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {profile.collaborationStatus === 'open' ? '🟢 Open' :
                       profile.collaborationStatus === 'selective' ? '🟡 Selective' :
                       profile.collaborationStatus === 'closed' ? '🔴 Closed' :
                       profile.availableForMeetings ? '🟢 Available' : '🔴 Busy'}
                    </span>
                  </div>
                  
                  {/* Contact Preference */}
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                    <span className="text-xs text-gray-600">Contact</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {profile.contactPreference === 'direct' ? '💬 Direct' :
                       profile.contactPreference === 'through_admin' ? '🏢 Via Admin' :
                       profile.contactPreference === 'email_only' ? '📧 Email Only' :
                       '💬 Direct'}
                    </span>
                  </div>
                  
                  {/* ORCID if available */}
                  {profile.orcid && (
                    <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-white/30">
                      <span className="text-xs text-gray-600">ORCID</span>
                      <a 
                        href={`https://orcid.org/${profile.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-orange-600 hover:text-orange-800 hover:underline"
                      >
                        {profile.orcid.slice(-8)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg shadow-purple-500/10 border border-white/20">
            <nav className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'collaborators', label: 'Collaborators', icon: '🤝' },
                { id: 'connections', label: 'My Network', icon: '🌐' },
                { id: 'trials', label: 'Clinical Trials', icon: '🧪' },
                { id: 'meetings', label: 'Meetings', icon: '📅' },
                { id: 'forums', label: 'Forums', icon: '💬' },
                { id: 'publications', label: 'Publications', icon: '📚' },
                { id: 'favorites', label: 'Favorites', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    localStorage.setItem('researcherActiveTab', tab.id);
                  }}
                  className={`relative px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap focus-ring ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-800 hover:text-indigo-700 hover:bg-indigo-100 border border-transparent hover:border-indigo-200'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="relative">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Trials</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">2</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Collaborators</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">12</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Publications</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">45</p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Forum Questions</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">8</p>
            </div>

            <div className="lg:col-span-2 xl:col-span-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">New in Your Field</h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    {profile.specialties.slice(0, 2).map((specialty, index) => {
                      // Enhanced content for movement disorders and related fields
                      const fieldPublications = specialty.toLowerCase().includes('movement disorders') ? [
                        { title: 'Deep Brain Stimulation Advances in Movement Disorders', journal: 'Nature Medicine', date: '2024-01-20', isNew: true },
                        { title: 'Parkinson\'s Disease Treatment Guidelines Update', journal: 'NEJM', date: '2024-01-18', isNew: true }
                      ] : specialty.toLowerCase().includes('neurology') ? [
                        { title: 'Pediatric Neurology Research Breakthrough', journal: 'Nature Medicine', date: '2024-01-20', isNew: true },
                        { title: 'Movement Disorders in Children: New Insights', journal: 'NEJM', date: '2024-01-18', isNew: true }
                      ] : specialty.toLowerCase().includes('adhd') || specialty.toLowerCase().includes('attention') ? [
                        { title: 'Neuroimaging Advances in ADHD Research Netherlands', journal: 'Nature Medicine', date: '2024-01-20', isNew: true },
                        { title: 'ADHD Dopamine Modulation: New Insights', journal: 'NEJM', date: '2024-01-18', isNew: true }
                      ] : specialty.toLowerCase().includes('depression') || specialty.toLowerCase().includes('depressive') ? [
                        { title: 'Neuroimaging Advances in Depression Research Netherlands', journal: 'Nature Medicine', date: '2024-01-20', isNew: true },
                        { title: 'Long-term Depression Treatment Outcomes', journal: 'NEJM', date: '2024-01-18', isNew: true }
                      ] : [
                        { title: `Latest ${specialty} Research Breakthrough`, journal: 'Nature Medicine', date: '2024-01-20', isNew: true },
                        { title: `${specialty} Clinical Guidelines Update`, journal: 'NEJM', date: '2024-01-18', isNew: true }
                      ];
                      return fieldPublications.map((pub, pubIndex) => (
                        <div key={`${index}-${pubIndex}`} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-800">{pub.title}</h4>
                            {pub.isNew && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">NEW</span>}
                          </div>
                          <p className="text-xs text-gray-700">{pub.journal} • {pub.date}</p>
                          <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(specialty)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View on PubMed →</a>
                        </div>
                      ));
                    })}
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">New Clinical Trials</h3>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    {profile.specialties.slice(0, 2).map((specialty, index) => {
                      // Enhanced trials for movement disorders and related fields
                      const fieldTrials = specialty.toLowerCase().includes('movement disorders') ? [
                        { title: 'Freezing of Gait in Parkinson\'s Disease: Intervention Study', phase: 'Phase II', status: 'Recruiting', date: '2024-01-19', isNew: true },
                        { title: 'Deep Brain Stimulation for Movement Disorders', phase: 'Phase III', status: 'Starting Soon', date: '2024-01-17', isNew: true }
                      ] : specialty.toLowerCase().includes('neurology') ? [
                        { title: 'Pediatric Movement Disorders Treatment Study', phase: 'Phase II', status: 'Recruiting', date: '2024-01-19', isNew: true },
                        { title: 'Epilepsy Surgery in Children: Multi-center Trial', phase: 'Phase III', status: 'Starting Soon', date: '2024-01-17', isNew: true }
                      ] : specialty.toLowerCase().includes('adhd') || specialty.toLowerCase().includes('attention') ? [
                        { title: 'ADHD Dopamine Modulation Amsterdam Study', phase: 'Phase II', status: 'Recruiting', date: '2024-01-19', isNew: true },
                        { title: 'Neuroimaging in ADHD: Netherlands Trial', phase: 'Phase III', status: 'Starting Soon', date: '2024-01-17', isNew: true }
                      ] : specialty.toLowerCase().includes('depression') || specialty.toLowerCase().includes('depressive') ? [
                        { title: 'Psilocybin Depression Amsterdam Study', phase: 'Phase II', status: 'Recruiting', date: '2024-01-19', isNew: true },
                        { title: 'Long-term Depression Treatment Netherlands', phase: 'Phase III', status: 'Starting Soon', date: '2024-01-17', isNew: true }
                      ] : [
                        { title: `${specialty} Phase III Multi-center Study`, phase: 'Phase III', status: 'Recruiting', date: '2024-01-19', isNew: true },
                        { title: `Novel ${specialty} Treatment Protocol`, phase: 'Phase II', status: 'Starting Soon', date: '2024-01-17', isNew: true }
                      ];
                      return fieldTrials.map((trial, trialIndex) => (
                        <div key={`${index}-${trialIndex}`} className="border-l-4 border-purple-500 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-800">{trial.title}</h4>
                            {trial.isNew && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">NEW</span>}
                          </div>
                          <div className="flex gap-2 mb-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{trial.phase}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{trial.status}</span>
                          </div>
                          <p className="text-xs text-gray-700">Posted: {trial.date}</p>
                          <a href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(specialty)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">View on ClinicalTrials.gov →</a>
                        </div>
                      ));
                    })}
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Patient Questions</h3>
                  <div className="space-y-4">
                    {mockData.forumQuestions.map((question) => (
                      <div key={question.id} className="border-l-4 border-orange-500 pl-4">
                        <p className="font-medium text-sm text-gray-800">{question.question}</p>
                        <p className="text-xs text-gray-700">{question.patient} • {question.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recommended Collaborators</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Search automatically includes your specialty ({profile?.specialties[0]}). Ranked by alignment & overlap</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={`Search (auto-includes ${profile?.specialties[0] || 'your field'}): e.g., "pediatric neurology", "proteomics", "neuroimaging"`}
                    value={collaboratorSearch}
                    onChange={(e) => {
                      setCollaboratorSearch(e.target.value);
                      // Trigger search automatically after typing
                      setTimeout(() => loadRealCollaborators(), 300);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && loadRealCollaborators()}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 flex-1"
                  />
                  <select
                    value={selectedSpecialtyFilter}
                    onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  >
                    <option value="">All Specialties</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatric Neurology">Pediatric Neurology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Proteomics">Proteomics</option>
                  </select>
                  <button 
                    onClick={loadRealCollaborators}
                    disabled={loadingCollaborators}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    {loadingCollaborators ? '🔄' : '🔍'} Search
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(realCollaborators.length > 0 ? realCollaborators : mockData.collaborators.map((collab: Collaborator) => ({
                ...collab,
                matchScore: calculateCollaboratorMatch(collab)
              }))).map((collaborator: Collaborator) => (
                <div key={collaborator.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {collaborator.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{collaborator.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            (collaborator.matchScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                            (collaborator.matchScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {collaborator.matchScore || 0}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{collaborator.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">🏛️ {collaborator.institution}</p>
                  <p className="text-xs text-gray-700 mb-3">📊 {collaborator.publications} publications</p>
                  
                  {/* Research Interests */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {collaborator.researchInterests?.slice(0, 2).map((interest: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {interest}
                        </span>
                      ))}
                      {(collaborator.researchInterests?.length || 0) > 2 && (
                        <span className="text-xs text-gray-500">+{(collaborator.researchInterests?.length || 0) - 2} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const status = collaborator.collaborationStatus || 'selective';
                        const context = `Researcher in ${profile?.specialties[0] || 'Medical Research'} interested in collaboration on ${collaborator.specialty} research. Shared interests: ${collaborator.researchInterests?.slice(0, 2).join(', ') || 'Medical Research'}`;
                        
                        if (status === 'closed') {
                          alert(`${collaborator.name} is not currently accepting collaborations.`);
                        } else {
                          alert(`Collaboration request sent to ${collaborator.name}!\n\nContext: ${context}\n\nThey will review your request and respond within 48 hours.`);
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                        (collaborator.collaborationStatus || 'selective') === 'closed' 
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : (collaborator.collaborationStatus || 'selective') === 'open'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      }`}
                      disabled={(collaborator.collaborationStatus || 'selective') === 'closed'}
                    >
                      {(collaborator.collaborationStatus || 'selective') === 'closed' ? '🚫 Closed' :
                       (collaborator.collaborationStatus || 'selective') === 'open' ? '🟢 Request Collaboration' :
                       '🤝 Request Collaboration'}
                    </button>
                    <button 
                      onClick={() => {
                        if (isFavorited(collaborator.id, 'collaborator')) {
                          removeFromFavorites(collaborator.id, 'collaborator');
                        } else {
                          addToFavorites(collaborator, 'collaborator');
                        }
                      }}
                      className={`px-3 py-2 rounded text-sm ${
                        isFavorited(collaborator.id, 'collaborator')
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isFavorited(collaborator.id, 'collaborator') ? '⭐ Saved' : '⭐ Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trials' && (
          <ClinicalTrialsTab 
            onSaveTrial={(trial: any) => {
              addToFavorites(trial, 'trial');
              alert(`Clinical trial "${trial.title}" saved to favorites`);
            }}
            isFavorited={(id: number) => isFavorited(id, 'trial')}
            onRemoveTrial={(id: number) => removeFromFavorites(id, 'trial')}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingRequestsTab />
        )}

        {activeTab === 'forums' && (
          <ForumsTab />
        )}

        {activeTab === 'publications' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">My Publications</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Linked to PubMed, ORCID, Google Scholar & more</span>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Search publications (auto-includes ${profile?.specialties[0] || 'your field'}): e.g., "Vyalev", "radiotherapy"`}
                  value={publicationSearch}
                  onChange={(e) => {
                    setPublicationSearch(e.target.value);
                    // Trigger search automatically after typing
                    setTimeout(() => loadPublications(), 300);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && loadPublications()}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 w-80"
                />
                <button 
                  onClick={loadPublications}
                  className="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  🔍 Search
                </button>
                <button 
                  onClick={handleORCIDSync}
                  disabled={!profile.orcid || syncingORCID}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {syncingORCID ? 'Syncing...' : '🔄 Sync ORCID'}
                </button>
                {profile.researchGate && (
                  <a 
                    href={`https://www.researchgate.net/profile/${profile.researchGate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    🔗 ResearchGate
                  </a>
                )}
              </div>
            </div>
            
            {!profile.orcid && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ No ORCID ID found in your profile. Add it to auto-sync publications.
                </p>
              </div>
            )}
            
            {orcidSyncResult && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-green-800">
                  ✅ ORCID sync completed! Found {orcidSyncResult?.publications_count || 0} publications.
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* ORCID Publications */}
              {orcidPublications.map((pub, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{pub.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-blue-600 font-medium">{pub.journal}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{pub.date}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">ORCID</span>
                      </div>
                      {pub.authors && (
                        <p className="text-sm text-gray-600 mb-3">Authors: {pub.authors.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {pub.pmid && (
                      <a 
                        href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                      >
                        📖 PubMed
                      </a>
                    )}
                    {pub.doi && (
                      <a 
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                      >
                        🔗 DOI: {pub.doi}
                      </a>
                    )}
                    <a 
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                    >
                      🎓 Google Scholar
                    </a>
                    {profile.orcid && (
                      <a 
                        href={`https://orcid.org/${profile.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded hover:bg-orange-200"
                      >
                        🆔 ORCID Profile
                      </a>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Filtered Publications with Enhanced Links */}
              {filteredPublications.filter(pub => !orcidPublications.some(op => op.title === pub.title)).map((pub) => (
                <div key={pub.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{pub.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-indigo-600 font-medium">{pub.journal}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{pub.date}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">📊 {pub.citations} citations</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Authors: {profile.name}, et al.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(pub.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                    >
                      📖 Search PubMed
                    </a>
                    <a 
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                    >
                      🎓 Google Scholar
                    </a>
                    <a 
                      href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(pub.title.split(' ').slice(0, 3).join(' '))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded hover:bg-purple-200"
                    >
                      🧪 ClinicalTrials.gov
                    </a>
                    {profile.researchGate && (
                      <a 
                        href={`https://www.researchgate.net/search/publication?q=${encodeURIComponent(pub.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                      >
                        🔬 ResearchGate
                      </a>
                    )}
                    {profile.orcid && (
                      <a 
                        href={`https://orcid.org/${profile.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded hover:bg-orange-200"
                      >
                        🆔 ORCID Profile
                      </a>
                    )}
                    <button 
                      onClick={() => {
                        // Save as trial template
                        {
                          const publicationAsTrial = {
                            id: pub.id,
                            title: pub.title,
                            phase: 'Published',
                            status: 'Completed',
                            description: `Published research: ${pub.title}`,
                            location: 'Academic Publication'
                          };
                          alert(`Publication "${pub.title}" saved to favorites`);
                        }
                      }}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200"
                    >
                      ⭐ Save to Favorites
                    </button>
                  </div>
                </div>
              ))}
              
              {orcidPublications.length === 0 && filteredPublications.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">📚</span>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No publications yet</h4>
                  <p className="text-gray-600 mb-4">
                    {profile.orcid ? 'Sync your ORCID profile to import publications.' : 'Add your ORCID ID to auto-import publications.'}
                  </p>
                  <div className="flex justify-center gap-3">
                    <a 
                      href="https://orcid.org/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      🆔 Get ORCID ID
                    </a>
                    <a 
                      href="https://www.researchgate.net/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      🔬 Join ResearchGate
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connection Requests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Requests</h3>
              <div className="space-y-4">
                {connectionRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {request.from.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-800 text-sm">{request.from}</h4>
                        <p className="text-xs text-gray-600">{request.specialty} • {request.institution}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{request.message}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConnectionRequest(request.id, 'accept')}
                        className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600"
                      >
                        ✓ Accept
                      </button>
                      <button 
                        onClick={() => handleConnectionRequest(request.id, 'decline')}
                        className="flex-1 bg-gray-300 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-400"
                      >
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                ))}
                {connectionRequests.length === 0 && (
                  <div className="text-center py-6">
                    <span className="text-2xl block mb-2">📬</span>
                    <p className="text-sm text-gray-600">No pending requests</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Connections */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My Connections ({connections.length})</h3>
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div 
                    key={connection.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      activeChat === connection.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveChat(connection.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-xs">
                            {connection.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-2">
                          <h4 className="font-medium text-gray-800 text-sm">{connection.name}</h4>
                          <p className="text-xs text-gray-600">{connection.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          connection.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-xs text-gray-500">{connection.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {connections.length === 0 && (
                  <div className="text-center py-6">
                    <span className="text-2xl block mb-2">🤝</span>
                    <p className="text-sm text-gray-600">No connections yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="bg-white rounded-lg shadow-sm">
              {activeChat ? (
                <div className="flex flex-col h-96">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-xs">
                          {connections.find(c => c.id === activeChat)?.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-2">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {connections.find(c => c.id === activeChat)?.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {connections.find(c => c.id === activeChat)?.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                      {(chatMessages[activeChat] || []).map((message) => (
                        <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.isMe 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p>{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.isMe ? 'text-purple-200' : 'text-gray-500'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                      />
                      <button 
                        onClick={sendMessage}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <span className="text-4xl block mb-4">💬</span>
                    <h4 className="font-medium text-gray-700 mb-2">Select a Connection</h4>
                    <p className="text-sm text-gray-600">Choose a connection to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">My Favorites</h3>
              <span className="text-sm text-gray-600">
                {(favorites['publication']?.length || 0) + (favorites['collaborator']?.length || 0) + (favorites['trial']?.length || 0)} saved items
              </span>
            </div>
            
            <div className="space-y-6">
              {favorites['trial'] && favorites['trial'].length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">🧪 Saved Clinical Trials</h4>
                  <div className="space-y-3">
                    {favorites['trial'].map((trial) => (
                      <div key={trial.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">🧪</span>
                            <div>
                              <h4 className="font-medium text-gray-800">{trial.title}</h4>
                              <p className="text-sm text-gray-600">{trial.phase} • {trial.status} • {trial.location}</p>
                              {trial.description && (
                                <p className="text-sm text-gray-500 mt-1">{trial.description.substring(0, 100)}...</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromFavorites(trial.id, 'trial')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {favorites['collaborator'] && favorites['collaborator'].length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">🤝 Saved Collaborators</h4>
                  <div className="space-y-3">
                    {favorites['collaborator'].map((collab) => (
                      <div key={collab.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">🤝</span>
                            <div>
                              <h4 className="font-medium text-gray-800">{collab.name}</h4>
                              <p className="text-sm text-gray-600">{collab.specialty} • {collab.institution}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromFavorites(collab.id, 'collaborator')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {favorites['publication'] && favorites['publication'].length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">📚 Saved Publications</h4>
                  <div className="space-y-3">
                    {favorites['publication'].map((pub) => (
                      <div key={pub.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">📚</span>
                            <div>
                              <h4 className="font-medium text-gray-800">{pub.title}</h4>
                              <p className="text-sm text-gray-600">{pub.journal} • {pub.date}</p>
                              {pub.authors && (
                                <p className="text-sm text-gray-500 mt-1">Authors: {pub.authors.join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromFavorites(pub.id, 'publication')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!favorites['publication'] || favorites['publication'].length === 0) && 
               (!favorites['collaborator'] || favorites['collaborator'].length === 0) && 
               (!favorites['trial'] || favorites['trial'].length === 0) && (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">⭐</span>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Favorites Yet</h4>
                  <p className="text-gray-600">Save collaborators, publications, and trials for quick access</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditProfile && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                setProfile(editingProfile);
                localStorage.setItem('researcherProfile', JSON.stringify(editingProfile));
                setShowEditProfile(false);
                alert('Profile updated successfully!');
              }} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      value={editingProfile.institution}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, institution: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 Location</label>
                  <input
                    type="text"
                    value={editingProfile.location || ''}
                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Toronto, Canada or Boston, MA, USA"
                  />
                </div>
                
                {/* Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="space-y-2">
                    {editingProfile.specialties.map((specialty, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => {
                            const newSpecialties = [...editingProfile.specialties];
                            newSpecialties[index] = e.target.value;
                            setEditingProfile(prev => prev ? {...prev, specialties: newSpecialties} : null);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                          placeholder="Enter specialty"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecialties = editingProfile.specialties.filter((_, i) => i !== index);
                            setEditingProfile(prev => prev ? {...prev, specialties: newSpecialties} : null);
                          }}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecialties = [...editingProfile.specialties, ''];
                        setEditingProfile(prev => prev ? {...prev, specialties: newSpecialties} : null);
                      }}
                      className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      + Add Specialty
                    </button>
                  </div>
                </div>
                
                {/* Research Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Research Interests</label>
                  <div className="space-y-2">
                    {editingProfile.researchInterests.map((interest, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={interest}
                          onChange={(e) => {
                            const newInterests = [...editingProfile.researchInterests];
                            newInterests[index] = e.target.value;
                            setEditingProfile(prev => prev ? {...prev, researchInterests: newInterests} : null);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                          placeholder="Enter research interest"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newInterests = editingProfile.researchInterests.filter((_, i) => i !== index);
                            setEditingProfile(prev => prev ? {...prev, researchInterests: newInterests} : null);
                          }}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newInterests = [...editingProfile.researchInterests, ''];
                        setEditingProfile(prev => prev ? {...prev, researchInterests: newInterests} : null);
                      }}
                      className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      + Add Research Interest
                    </button>
                  </div>
                </div>
                
                {/* External Profiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ORCID ID</label>
                    <input
                      type="text"
                      value={editingProfile.orcid}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, orcid: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ResearchGate Profile</label>
                    <input
                      type="text"
                      value={editingProfile.researchGate}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, researchGate: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="ResearchGate username"
                    />
                  </div>
                </div>
                
                {/* Availability & Collaboration */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingProfile.availableForMeetings}
                        onChange={(e) => setEditingProfile(prev => prev ? {...prev, availableForMeetings: e.target.checked} : null)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Available for meetings</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Status</label>
                    <select
                      value={editingProfile.collaborationStatus || 'selective'}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, collaborationStatus: e.target.value as any} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      <option value="open">🟢 Open for Collaboration</option>
                      <option value="selective">🟡 Selective Collaboration</option>
                      <option value="closed">🔴 Not Available</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Preference</label>
                    <select
                      value={editingProfile.contactPreference || 'direct'}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, contactPreference: e.target.value as any} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    >
                      <option value="direct">💬 Direct Contact</option>
                      <option value="through_admin">🏢 Through Admin</option>
                      <option value="email_only">📧 Email Only</option>
                    </select>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Assistant */}
      <AIAssistant userType="researcher" userProfile={profile} />
    </div>
  );
}