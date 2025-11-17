'use client';

import { useState, useEffect } from 'react';
import ResearcherProfileModal from './ResearcherProfileModal';

interface PatientProfile {
  condition: string;
  location: string;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  authorType: 'patient' | 'researcher';
  time: string;
  replies: ForumReply[];
  upvotes: number;
  isUpvoted: boolean;
}

interface ForumReply {
  id: number;
  content: string;
  author: string;
  authorType: 'researcher' | 'patient';
  credentials?: string;
  time: string;
  upvotes: number;
  isUpvoted: boolean;
}

export default function ForumsTab({ profile }: { profile: PatientProfile }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Cancer Research' });
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileExpert, setProfileExpert] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const categories = [
    'Cancer Research',
    'Clinical Trials Insights', 
    'Immunotherapy',
    'Neurology',
    'General Health'
  ];

  const generateDynamicPosts = () => {
    const condition = profile.condition.toLowerCase();
    const posts: ForumPost[] = [];
    
    // Generate condition-specific posts
    if (condition.includes('cancer') || condition.includes('glioma') || condition.includes('tumor')) {
      posts.push({
        id: 1,
        title: `Latest treatments for ${profile.condition}?`,
        content: `I was recently diagnosed with ${profile.condition} and my oncologist mentioned some new treatments. Can anyone provide information about the most recent advances in treatment options? I'm particularly interested in immunotherapy and targeted therapies.`,
        category: 'Cancer Research',
        author: 'Patient123',
        authorType: 'patient',
        time: '2 hours ago',
        upvotes: 15,
        isUpvoted: false,
        replies: [
          {
            id: 101,
            content: `Recent advances for ${profile.condition} include CAR-T cell therapy and checkpoint inhibitors. The FDA recently approved several new targeted therapies with specific genetic markers. I'd recommend discussing genetic testing with your oncologist to see if you qualify for precision medicine approaches.`,
            author: 'Dr. Sarah Johnson',
            authorType: 'researcher',
            credentials: 'Neuro-Oncologist, Memorial Sloan Kettering',
            time: '1 hour ago',
            upvotes: 8,
            isUpvoted: false
          }
        ]
      });
    }
    
    if (condition.includes('heart') || condition.includes('cardiac')) {
      posts.push({
        id: 2,
        title: `Managing ${profile.condition} - lifestyle changes?`,
        content: `What lifestyle changes have helped others with ${profile.condition}? My cardiologist mentioned diet and exercise but I'd love to hear real experiences.`,
        category: 'General Health',
        author: 'HeartPatient2024',
        authorType: 'patient',
        time: '4 hours ago',
        upvotes: 12,
        isUpvoted: false,
        replies: []
      });
    }
    
    // Always include general posts
    posts.push({
      id: posts.length + 1,
      title: 'Clinical trial eligibility questions',
      content: 'I found a clinical trial that might be relevant for my condition, but I\'m not sure if I meet the eligibility criteria. How do I find out more?',
      category: 'Clinical Trials Insights',
      author: 'Survivor2024',
      authorType: 'patient',
      time: '1 day ago',
      upvotes: 18,
      isUpvoted: false,
      replies: []
    });
    
    return posts;
  };

  useEffect(() => {
    const dynamicPosts = generateDynamicPosts();
    setPosts(dynamicPosts);
  }, [profile.condition]);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const post: ForumPost = {
      id: Date.now(),
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      category: newPost.category,
      author: 'You',
      authorType: 'patient',
      time: 'Just now',
      upvotes: 1,
      isUpvoted: false,
      replies: []
    };
    
    // Add to beginning of posts array
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    
    // Reset form
    setNewPost({ title: '', content: '', category: 'Cancer Research' });
    setShowNewPostForm(false);
    
    // Show success message
    alert('Question posted successfully! Researchers will be notified and can respond.');
  };

  const calculateForumMatchScore = (post: ForumPost) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();
    const category = post.category.toLowerCase();
    
    // Title relevance (40% weight)
    if (title.includes(condition)) score += 40;
    else if (title.includes(condition.split(' ')[0])) score += 25;
    
    // Content relevance (30% weight)
    if (content.includes(condition)) score += 30;
    else if (content.includes(condition.split(' ')[0])) score += 20;
    
    // Category relevance (20% weight)
    if (condition.includes('cancer') && category.includes('cancer')) score += 20;
    else if (condition.includes('brain') && category.includes('neurology')) score += 20;
    else if (category.includes('general')) score += 10;
    
    // Expert engagement (10% weight)
    if (post.replies.length > 0) score += 10;
    else if (post.upvotes > 5) score += 5;
    
    return Math.min(score, 100);
  };

  const filteredPosts = (selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory))
    .map(post => ({ ...post, matchScore: calculateForumMatchScore(post) }))
    .sort((a, b) => {
      if (sortBy === 'popular') return b.upvotes - a.upvotes;
      if (sortBy === 'unanswered') return a.replies.length - b.replies.length;
      return b.matchScore - a.matchScore; // Sort by relevance for newest
    });

  const toggleUpvote = (postId: number, replyId?: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (replyId) {
          // Toggle reply upvote
          return {
            ...post,
            replies: post.replies.map(reply => 
              reply.id === replyId 
                ? { ...reply, upvotes: reply.isUpvoted ? reply.upvotes - 1 : reply.upvotes + 1, isUpvoted: !reply.isUpvoted }
                : reply
            )
          };
        } else {
          // Toggle post upvote
          return {
            ...post,
            upvotes: post.isUpvoted ? post.upvotes - 1 : post.upvotes + 1,
            isUpvoted: !post.isUpvoted
          };
        }
      }
      return post;
    }));
  };

  const viewResearcherProfile = (reply: ForumReply) => {
    // Convert forum reply to expert format for the modal
    const mockExpert = {
      id: reply.id,
      name: reply.author,
      specialty: reply.credentials?.split(',')[0] || 'Medical Researcher',
      institution: reply.credentials?.split(',')[1]?.trim() || 'Medical Institution',
      location: 'United States',
      available_for_meetings: true,
      research_interests: ['Clinical Research', 'Patient Care', 'Medical Innovation']
    };
    setProfileExpert(mockExpert);
    setShowProfileModal(true);
  };

  const handleProfileMeetingRequest = (expert: any) => {
    setShowProfileModal(false);
    alert(`Meeting request functionality would be implemented for ${expert.name}`);
  };

  const handleAddComment = (postId: number) => {
    if (!replyText.trim()) return;
    
    const newReply: ForumReply = {
      id: Date.now(),
      content: replyText.trim(),
      author: 'You',
      authorType: 'patient',
      time: 'Just now',
      upvotes: 0,
      isUpvoted: false
    };
    
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    ));
    
    setReplyText('');
    setReplyingTo(null);
    alert('Comment posted successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Community Forums</h3>
          <p className="text-sm text-gray-600">Ask questions and get expert answers from researchers</p>
        </div>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          ❓ Ask Question
        </button>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>
      


      {/* New Post Form */}
      {showNewPostForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-700 mb-4">Ask a Question</h4>
          <form onSubmit={handleSubmitPost}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                🚫 Categories are managed by researchers. Patients can only post in existing communities.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="What would you like to ask?"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                placeholder="Provide more details about your question..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Post Question
              </button>
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            {/* Reddit-style layout */}
            <div className="flex gap-3">
              {/* Upvote section */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleUpvote(post.id)}
                  className={`p-1 rounded ${
                    post.isUpvoted ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'
                  }`}
                >
                  ▲
                </button>
                <span className="text-sm font-medium text-gray-700">{post.upvotes}</span>
                <button className="p-1 rounded text-gray-400 hover:text-blue-600">
                  ▼
                </button>
              </div>
              
              {/* Post content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-gray-700">{post.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      (post as any).matchScore >= 80 ? 'bg-green-100 text-green-800' :
                      (post as any).matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(post as any).matchScore}% match
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {post.category}
                    </span>
                    {post.replies.length === 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        ❓ Unanswered
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">{post.content}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      👤 {post.author} 
                      <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {post.authorType}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>💬 {post.replies.length} expert replies</span>
                    <button 
                      onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      className="text-indigo-600 hover:underline"
                    >
                      {selectedPost?.id === post.id ? 'Hide Discussion' : 'View Discussion'}
                    </button>
                  </div>
                </div>
                
                {/* Replies (only shown when expanded) */}
                {selectedPost?.id === post.id && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-3">🥼 Expert Responses:</h5>
                    {post.replies.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No expert responses yet. Researchers can reply to help answer this question.</p>
                    ) : (
                      <div className="space-y-3">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className={`p-3 rounded-lg border-l-4 ${
                            reply.authorType === 'researcher' 
                              ? 'bg-green-50 border-green-400' 
                              : 'bg-indigo-50 border-indigo-400'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {reply.authorType === 'researcher' ? (
                                  <button
                                    onClick={() => viewResearcherProfile(reply)}
                                    className="font-medium text-green-600 hover:text-green-800 hover:underline"
                                  >
                                    🥼 {reply.author}
                                  </button>
                                ) : (
                                  <span className="font-medium text-indigo-600">
                                    👤 {reply.author}
                                  </span>
                                )}
                                <span className={`px-2 py-1 text-xs rounded ${
                                  reply.authorType === 'researcher'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {reply.authorType === 'researcher' ? 'Researcher' : 'Patient'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleUpvote(post.id, reply.id)}
                                  className={`flex items-center gap-1 text-xs ${
                                    reply.isUpvoted ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
                                  }`}
                                >
                                  ▲ {reply.upvotes}
                                </button>
                              </div>
                            </div>
                            {reply.credentials && (
                              <p className="text-xs text-green-700 mb-2">{reply.credentials}</p>
                            )}
                            <p className={`text-sm ${
                              reply.authorType === 'researcher' ? 'text-green-900' : 'text-indigo-900'
                            }`}>{reply.content}</p>
                            <p className={`text-xs mt-2 ${
                              reply.authorType === 'researcher' ? 'text-green-600' : 'text-indigo-600'
                            }`}>{reply.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Patient Comment Section */}
                    {replyingTo === post.id ? (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h6 className="font-medium text-indigo-800 mb-2">Add Your Comment:</h6>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Share your experience or ask a follow-up question..."
                          className="w-full px-3 py-2 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            disabled={!replyText.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            💬 Post Comment
                          </button>
                          <button 
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => setReplyingTo(post.id)}
                          className="px-4 py-2 bg-indigo-100 text-indigo-800 text-sm rounded hover:bg-indigo-200 flex items-center gap-1"
                        >
                          💬 Add Comment
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📝 <strong>Forum Rules:</strong><br/>
                        • Verified researchers provide expert medical responses<br/>
                        • Patients can share experiences and ask follow-up questions<br/>
                        • Everyone can upvote helpful responses
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No posts found in this category.
          </div>
        )}
      </div>
      
      <ResearcherProfileModal
        expert={profileExpert}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onRequestMeeting={handleProfileMeetingRequest}
      />
    </div>
  );
}