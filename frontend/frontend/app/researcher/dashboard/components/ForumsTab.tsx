'use client';

import { useState } from 'react';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorType: 'researcher' | 'patient';
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  tags: string[];
}

interface Community {
  id: number;
  name: string;
  description: string;
  members: number;
  posts: number;
  creator: string;
  isOwner: boolean;
}

interface ProfessionalThread {
  id: number;
  title: string;
  content: string;
  author: string;
  institution: string;
  specialty: string;
  replies: number;
  views: number;
  timeAgo: string;
  tags: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface PatientQuestion {
  id: number;
  question: string;
  patient: string;
  time: string;
  category: string;
  keywords: string[];
}

export default function ForumsTab() {
  const getResearcherProfile = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('researcherProfile');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };
  
  const researcherProfile = getResearcherProfile();
  const [activeView, setActiveView] = useState<'communities' | 'discussions' | 'professional' | 'patient-questions'>('communities');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [professionalReplies, setProfessionalReplies] = useState<{[key: number]: string}>({});
  const [replyingToProfessional, setReplyingToProfessional] = useState<number | null>(null);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<{[key: string]: 'pending' | 'accepted' | 'declined'}>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{[key: string]: Array<{sender: string, message: string, time: string}>}>({});
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [followedPosts, setFollowedPosts] = useState<Set<number>>(new Set());
  const [expertResponses, setExpertResponses] = useState<{[key: number]: string}>({});
  const [responseTexts, setResponseTexts] = useState<{[key: number]: string}>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());

  const [communities, setCommunities] = useState<Community[]>([
    {
      id: 1,
      name: 'Cancer Immunotherapy Research',
      description: 'Latest developments in cancer immunotherapy and clinical applications',
      members: 245,
      posts: 89,
      creator: 'Dr. Emily Rodriguez',
      isOwner: true
    },
    {
      id: 2,
      name: 'AI in Medical Diagnosis',
      description: 'Artificial intelligence applications in medical diagnosis and imaging',
      members: 189,
      posts: 156,
      creator: 'Dr. James Wilson',
      isOwner: false
    },
    {
      id: 3,
      name: 'Precision Medicine Network',
      description: 'Personalized medicine approaches and genomic research',
      members: 312,
      posts: 203,
      creator: 'Dr. Sarah Chen',
      isOwner: false
    }
  ]);

  const [discussions, setDiscussions] = useState<ForumPost[]>([
    {
      id: 1,
      title: 'New CAR-T therapy results - Phase II data',
      content: 'Exciting preliminary results from our Phase II CAR-T trial. Looking for collaborators to discuss next steps.',
      author: 'Dr. Emily Rodriguez',
      authorType: 'researcher',
      category: 'Cancer Immunotherapy Research',
      replies: 12,
      views: 89,
      lastActivity: '2 hours ago',
      tags: ['CAR-T', 'Phase II', 'Collaboration']
    },
    {
      id: 2,
      title: 'Machine learning models for radiology - validation needed',
      content: 'Developed ML models for chest X-ray analysis. Seeking validation datasets and feedback from radiologists.',
      author: 'Dr. James Wilson',
      authorType: 'researcher',
      category: 'AI in Medical Diagnosis',
      replies: 8,
      views: 156,
      lastActivity: '4 hours ago',
      tags: ['Machine Learning', 'Radiology', 'Validation']
    }
  ]);

  const professionalThreads: ProfessionalThread[] = [
    {
      id: 1,
      title: "Multi-Center CAR-T Cell Therapy Trial - Seeking Collaborators",
      content: "Leading a Phase II trial for next-generation CAR-T cells targeting relapsed B-cell lymphoma. Looking for centers with GMP facilities and experience in cellular therapy manufacturing.",
      author: "Dr. Michael Chen, MD PhD",
      institution: "Stanford Cancer Institute",
      specialty: "Hematology-Oncology",
      replies: 12,
      views: 156,
      timeAgo: "3 hours ago",
      tags: ["CAR-T", "Phase-II", "Collaboration", "GMP"],
      priority: "high"
    },
    {
      id: 2,
      title: "AI-Driven Cardiac Risk Prediction - Validation Cohorts Needed",
      content: "Developed ML model achieving 94% accuracy in predicting cardiac events. Seeking external validation cohorts from different populations and healthcare systems.",
      author: "Dr. Lisa Rodriguez, MD",
      institution: "Mayo Clinic",
      specialty: "Cardiology",
      replies: 8,
      views: 203,
      timeAgo: "6 hours ago",
      tags: ["AI", "Cardiology", "Validation", "ML"],
      priority: "medium"
    },
    {
      id: 3,
      title: "Grant Opportunity: NIH R01 - Precision Oncology Initiative",
      content: "Sharing information about upcoming NIH R01 funding opportunity focused on precision oncology. Deadline approaching - looking for potential collaborators.",
      author: "Dr. Sarah Kim, PhD",
      institution: "MD Anderson Cancer Center",
      specialty: "Cancer Biology",
      replies: 22,
      views: 445,
      timeAgo: "2 days ago",
      tags: ["Grant", "NIH", "Precision-Medicine", "Funding"],
      priority: "urgent"
    }
  ];

  const generateRelevantQuestions = (): PatientQuestion[] => {
    const allQuestions: PatientQuestion[] = [
      { id: 1, question: 'What are the latest treatments for glioblastoma?', patient: 'Anonymous', time: '2 hours ago', category: 'Oncology', keywords: ['cancer', 'brain', 'tumor', 'oncology'] },
      { id: 2, question: 'Side effects of immunotherapy?', patient: 'Anonymous', time: '5 hours ago', category: 'Immunotherapy', keywords: ['immunotherapy', 'cancer', 'treatment'] },
      { id: 3, question: 'Clinical trials for Alzheimer\'s disease?', patient: 'Anonymous', time: '1 day ago', category: 'Neurology', keywords: ['alzheimer', 'neurology', 'brain', 'dementia'] },
      { id: 4, question: 'CAR-T cell therapy eligibility criteria?', patient: 'Anonymous', time: '4 hours ago', category: 'Immunotherapy', keywords: ['car-t', 'immunotherapy', 'cancer', 'cell therapy'] }
    ];
    
    if (!researcherProfile) return allQuestions;
    
    const specialties = researcherProfile.specialties || [];
    const interests = researcherProfile.researchInterests || [];
    
    return allQuestions.filter(question => {
      const categoryMatch = specialties.some((specialty: string) => 
        specialty.toLowerCase().includes(question.category.toLowerCase()) ||
        question.category.toLowerCase().includes(specialty.toLowerCase())
      );
      
      const interestMatch = interests.some((interest: string) => 
        question.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      return categoryMatch || interestMatch;
    });
  };

  const patientQuestions = generateRelevantQuestions();

  const handleExpertResponse = (questionId: number) => {
    const responseText = responseTexts[questionId];
    if (!responseText?.trim()) return;
    
    setExpertResponses(prev => ({
      ...prev,
      [questionId]: responseText
    }));
    
    setResponseTexts(prev => ({
      ...prev,
      [questionId]: ''
    }));
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newCommunity: Community = {
      id: Date.now(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      members: 1,
      posts: 0,
      creator: 'You',
      isOwner: true
    };
    setCommunities(prev => [newCommunity, ...prev]);
    setShowCreateCommunity(false);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPost: ForumPost = {
      id: Date.now(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author: 'You',
      authorType: 'researcher',
      category: formData.get('category') as string,
      replies: 0,
      views: 0,
      lastActivity: 'now',
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim())
    };
    setDiscussions(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const filteredThreads = professionalThreads.filter(thread => 
    filterSpecialty === 'All' || 
    thread.specialty.includes(filterSpecialty) ||
    thread.tags.some(tag => tag.toLowerCase().includes(filterSpecialty.toLowerCase()))
  );

  const filteredDiscussions = discussions.filter(post => 
    !selectedCategory || post.category === selectedCategory
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Research Forums</h3>
          {Object.values(collaborationRequests).filter(status => status === 'accepted').length > 0 && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-700 text-sm font-medium">
                {Object.values(collaborationRequests).filter(status => status === 'accepted').length} Active Collaborations
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateCommunity(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 text-sm"
          >
            ➕ Create Community
          </button>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
          >
            💬 New Discussion
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { id: 'communities', label: 'My Communities', count: communities.length },
          { id: 'discussions', label: 'Discussions', count: discussions.length },
          { id: 'professional', label: 'Professional Threads', count: professionalThreads.length, badge: 'RESEARCHERS ONLY' },
          { id: 'patient-questions', label: `Patient Q&A ${researcherProfile ? '(Your Field)' : ''}`, count: patientQuestions.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeView === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>
            {tab.badge && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Create Community Form */}
      {showCreateCommunity && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4">Create New Community</h4>
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Community Name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
            <textarea
              name="description"
              placeholder="Community Description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Create Community
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateCommunity(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Post Form */}
      {showCreatePost && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4">Start New Discussion</h4>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <input
              name="title"
              type="text"
              placeholder="Discussion Title"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <select
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Select Community</option>
              {communities.map(community => (
                <option key={community.id} value={community.name}>{community.name}</option>
              ))}
            </select>
            <textarea
              name="content"
              placeholder="What would you like to discuss?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <input
              name="tags"
              type="text"
              placeholder="Tags (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Post Discussion
              </button>
              <button 
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Communities View */}
      {activeView === 'communities' && (
        <div className="space-y-4">
          {communities.map((community) => (
            <div key={community.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{community.name}</h4>
                    {community.isOwner && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">Owner</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>👥 {community.members} members</span>
                    <span>💬 {community.posts} posts</span>
                    <span>👤 Created by {community.creator}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discussions View */}
      {activeView === 'discussions' && (
        <div>
          <div className="mb-6 flex gap-4 items-center flex-wrap">
            <label className="text-sm font-medium text-gray-700">Filter by Community:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Communities</option>
              {communities.map(community => (
                <option key={community.id} value={community.name}>{community.name}</option>
              ))}
            </select>
            {researcherProfile && (
              <button
                onClick={() => {
                  const relevantCommunity = communities.find(c => 
                    researcherProfile.specialties?.some((spec: string) => 
                      c.name.toLowerCase().includes(spec.toLowerCase())
                    )
                  );
                  setSelectedCategory(relevantCommunity?.name || '');
                }}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm hover:bg-blue-200"
              >
                🎯 My Interest
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {filteredDiscussions.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-2">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                      <button 
                        onClick={() => {
                          setNavigationHistory(prev => [...prev, 'discussions']);
                          setViewingProfile(post.author);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        👤 {post.author}
                      </button>
                      <span>📂 {post.category}</span>
                      <span>💬 {post.replies} replies</span>
                      <span>👁️ {post.views} views</span>
                      <span>🕒 {post.lastActivity}</span>
                    </div>
                  </div>
                </div>
                
                {replyingTo === post.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (replyText.trim()) {
                            setDiscussions(prev => prev.map(p => 
                              p.id === post.id ? { ...p, replies: p.replies + 1 } : p
                            ));
                            alert(`Reply posted to "${post.title}"`);
                            setReplyText('');
                            setReplyingTo(null);
                          }
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Post Reply
                      </button>
                      <button 
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setReplyingTo(post.id)}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                    >
                      💬 Reply
                    </button>
                    <button 
                      onClick={() => {
                        const newFollowed = new Set(followedPosts);
                        if (followedPosts.has(post.id)) {
                          newFollowed.delete(post.id);
                          alert(`Unfollowed "${post.title}"`);
                        } else {
                          newFollowed.add(post.id);
                          alert(`Now following "${post.title}"`);
                        }
                        setFollowedPosts(newFollowed);
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        followedPosts.has(post.id)
                          ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {followedPosts.has(post.id) ? '✓ Following' : '⭐ Follow'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Threads View */}
      {activeView === 'professional' && (
        <div>
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600">🔒</span>
              <h4 className="font-semibold text-red-800">Researcher-Only Professional Threads</h4>
            </div>
            <p className="text-sm text-red-700 mb-2">
              Exclusive discussions for verified researchers on advanced topics, collaborations, and professional matters.
            </p>
            <p className="text-xs text-red-600">
              🎓 Access restricted to researchers with verified credentials and institutional affiliations.
            </p>
          </div>
          
          <div className="mb-6 flex gap-4 items-center flex-wrap">
            <label className="text-sm font-medium text-gray-700">Filter by Field:</label>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="All">All Fields</option>
              <option value="Oncology">Oncology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Immunology">Immunology</option>
            </select>
            {researcherProfile && (
              <button
                onClick={() => setFilterSpecialty(researcherProfile.specialties?.[0] || 'All')}
                className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm hover:bg-purple-200"
              >
                🎯 My Field
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <div key={thread.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{thread.title}</h4>
                      {thread.priority === 'urgent' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full font-medium animate-pulse">
                          🚨 URGENT
                        </span>
                      )}
                      {thread.priority === 'high' && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full font-medium">
                          🔥 HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{thread.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <button 
                        onClick={() => {
                          setNavigationHistory(prev => [...prev, 'professional-threads']);
                          setViewingProfile(thread.author);
                        }}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {thread.author}
                      </button>
                      <span>🏥 {thread.institution}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {thread.specialty}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {thread.tags.map((tag, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>💬 {thread.replies} replies</span>
                    <span>👁️ {thread.views} views</span>
                    <span>🕒 {thread.timeAgo}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setReplyingToProfessional(thread.id)}
                      className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      💬 Reply
                    </button>
                    {collaborationRequests[thread.author] === 'accepted' ? (
                      <button 
                        onClick={() => setActiveChat(thread.author)}
                        className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        💬 Chat
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setCollaborationRequests(prev => ({ ...prev, [thread.author]: 'pending' }));
                          alert(`Collaboration request sent to ${thread.author}`);
                          setTimeout(() => {
                            setCollaborationRequests(prev => ({ ...prev, [thread.author]: 'accepted' }));
                            alert(`${thread.author} accepted your request! Chat available.`);
                          }, 2000);
                        }}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        🤝 Collaborate
                      </button>
                    )}
                  </div>
                </div>
                
                {replyingToProfessional === thread.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-3">Reply to this thread:</h5>
                    <textarea
                      value={professionalReplies[thread.id] || ''}
                      onChange={(e) => setProfessionalReplies(prev => ({ ...prev, [thread.id]: e.target.value }))}
                      placeholder="Share your professional insights, offer collaboration, or ask questions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => {
                          if (professionalReplies[thread.id]?.trim()) {
                            alert(`Professional reply posted to "${thread.title}"`);
                            setProfessionalReplies(prev => ({ ...prev, [thread.id]: '' }));
                            setReplyingToProfessional(null);
                          }
                        }}
                        disabled={!professionalReplies[thread.id]?.trim()}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🎓 Post Professional Reply
                      </button>
                      <button 
                        onClick={() => {
                          setReplyingToProfessional(null);
                          setProfessionalReplies(prev => ({ ...prev, [thread.id]: '' }));
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Questions View */}
      {activeView === 'patient-questions' && (
        <div>
          {researcherProfile && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600">🎯</span>
                <h4 className="font-semibold text-orange-800">Questions in Your Field</h4>
              </div>
              <p className="text-sm text-orange-700 mb-2">
                Showing questions relevant to your specialties: <strong>{researcherProfile.specialties?.join(', ')}</strong>
              </p>
            </div>
          )}
          <div className="space-y-4">
            {patientQuestions.filter(q => !skippedQuestions.has(q.id)).map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded">{question.category}</span>
                      <span className="text-xs text-gray-500">{question.time}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-2">{question.question}</h4>
                    <p className="text-sm text-gray-600">Asked by {question.patient}</p>
                  </div>
                </div>
                
                {expertResponses[question.id] ? (
                  <div className="bg-blue-50 p-4 rounded-lg mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-blue-600">🥼</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Your Expert Response:</p>
                        <p className="text-sm text-blue-900 mt-1">{expertResponses[question.id]}</p>
                        <p className="text-xs text-blue-600 mt-2">Posted just now</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <label className="block text-sm font-medium text-green-800 mb-2">Your Expert Response:</label>
                      <textarea
                        rows={3}
                        placeholder="Provide your professional medical insight..."
                        value={responseTexts[question.id] || ''}
                        onChange={(e) => setResponseTexts(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleExpertResponse(question.id)}
                        disabled={!responseTexts[question.id]?.trim()}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🥼 Post Expert Reply
                      </button>
                      <button 
                        onClick={() => {
                          setSkippedQuestions(prev => new Set([...prev, question.id]));
                          alert(`Question "${question.question}" has been skipped.`);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        Skip
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <button 
                onClick={() => {
                  setViewingProfile(null);
                  setNavigationHistory([]);
                }}
                className="text-blue-600 hover:underline"
              >
                Forums
              </button>
              {navigationHistory.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                  <span>›</span>
                  <button 
                    onClick={() => {
                      setViewingProfile(null);
                      if (item === 'professional-threads') setActiveView('professional');
                      if (item === 'discussions') setActiveView('discussions');
                      setNavigationHistory([]);
                    }}
                    className="text-blue-600 hover:underline capitalize"
                  >
                    {item.replace('-', ' ')}
                  </button>
                </span>
              ))}
              <span>›</span>
              <span className="font-medium">{viewingProfile}</span>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{viewingProfile}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Institution:</p>
                  <p className="font-medium">Stanford Cancer Institute</p>
                </div>
                <div>
                  <p className="text-gray-600">Specialty:</p>
                  <p className="font-medium">Hematology-Oncology</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              {collaborationRequests[viewingProfile] === 'accepted' ? (
                <button 
                  onClick={() => {
                    setActiveChat(viewingProfile);
                    setViewingProfile(null);
                    setNavigationHistory([]);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                >
                  💬 Open Chat
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setCollaborationRequests(prev => ({ ...prev, [viewingProfile]: 'pending' }));
                    alert(`Collaboration request sent to ${viewingProfile}`);
                    setTimeout(() => {
                      setCollaborationRequests(prev => ({ ...prev, [viewingProfile]: 'accepted' }));
                      alert(`${viewingProfile} accepted your collaboration request! Chat is now available.`);
                    }, 2000);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                >
                  🤝 Request Collaboration
                </button>
              )}
              <button 
                onClick={() => {
                  setViewingProfile(null);
                  setNavigationHistory([]);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {activeChat.split(' ')[1]?.[0] || activeChat[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeChat}</h3>
                  <p className="text-xs text-green-600">● Online</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {(chatMessages[activeChat] || []).length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <p>🎉 Collaboration accepted!</p>
                  <p>Start your research discussion...</p>
                </div>
              ) : (
                chatMessages[activeChat]?.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender === 'You' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'You' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      setChatMessages(prev => ({
                        ...prev,
                        [activeChat]: [
                          ...(prev[activeChat] || []),
                          { sender: 'You', message: newMessage, time: now }
                        ]
                      }));
                      setNewMessage('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newMessage.trim()) {
                      const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      setChatMessages(prev => ({
                        ...prev,
                        [activeChat]: [
                          ...(prev[activeChat] || []),
                          { sender: 'You', message: newMessage, time: now }
                        ]
                      }));
                      setNewMessage('');
                    }
                  }}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}