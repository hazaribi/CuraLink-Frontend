'use client';

import { useState } from 'react';
import { apiService } from '../lib/api';

interface AIAssistantProps {
  userType: 'patient' | 'researcher';
  userProfile: any;
}

export default function AIAssistant({ userType, userProfile }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let content = '';
      
      if (userType === 'patient') {
        const response = await apiService.analyzeCondition(input);
        console.log('AI Response:', response);
        
        if ((response as any)?.success && (response as any)?.data?.primaryCondition) {
          content = (response as any).data.primaryCondition;
        } else {
          content = 'I can help you find researchers and clinical trials. What medical condition are you interested in?';
        }
      } else {
        const questionProfile = {
          specialties: userProfile?.specialties || [],
          research_interests: userProfile?.research_interests || [],
          question: input
        };
        
        const response = await apiService.getResearchSuggestions(questionProfile);
        console.log('Research AI Response:', response);
        
        if ((response as any)?.success && (response as any)?.suggestions?.length > 0) {
          content = (response as any).suggestions.join('\n\n');
        } else {
          content = 'I can help with research collaboration and academic questions. What would you like to know?';
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.' 
      }]);
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-200 ${
          userType === 'patient'
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'
        }`}
      >
        🤖 AI Assistant
      </button>

      {/* AI Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50">
          <div className={`rounded-xl w-80 h-96 flex flex-col shadow-2xl border ${
            userType === 'patient' ? 'bg-white border-indigo-200' : 'bg-white border-purple-200'
          }`}>
            <div className={`p-4 border-b flex justify-between items-center rounded-t-xl ${
              userType === 'patient' ? 'bg-indigo-50 border-indigo-200' : 'bg-purple-50 border-purple-200'
            }`}>
              <h3 className={`font-semibold ${
                userType === 'patient' ? 'text-indigo-700' : 'text-purple-700'
              }`}>AI Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className={`text-gray-500 hover:text-gray-700 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100`}
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs text-sm ${
                    msg.role === 'user' 
                      ? userType === 'patient'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm ${
                    userType === 'patient' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    AI is thinking...
                  </div>
                </div>
              )}
              {messages.length === 0 && (
                <div className={`text-sm p-3 rounded-lg border-2 border-dashed text-center ${
                  userType === 'patient' 
                    ? 'border-indigo-200 text-indigo-600 bg-indigo-50' 
                    : 'border-purple-200 text-purple-600 bg-purple-50'
                }`}>
                  👋 Hi! I'm your AI assistant. Ask me about {userType === 'patient' ? 'medical conditions, treatments, or finding researchers' : 'research collaboration, academic questions, or finding partners'}.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 text-sm ${
                    userType === 'patient' ? 'focus:ring-indigo-500' : 'focus:ring-purple-500'
                  }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    userType === 'patient'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}