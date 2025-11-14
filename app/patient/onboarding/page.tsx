'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getConditionSuggestions } from '../../../lib/conditionProcessor';
import { getLocationSuggestions } from '../../../lib/locationProcessor';

// Popular conditions for quick selection
const popularConditions = [
  'Brain Cancer', 'Lung Cancer', 'Breast Cancer', 'Heart Disease', 'Diabetes',
  'Alzheimer Disease', 'Parkinson Disease', 'Multiple Sclerosis', 'Arthritis', 'Depression'
];

// Popular locations for quick selection
const popularLocations = [
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'London, UK', 'Toronto, Canada',
  'Sydney, Australia', 'Mumbai, India', 'Berlin, Germany', 'Tokyo, Japan', 'Paris, France'
];

export default function PatientOnboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    location: ''
  });
  const [conditionSuggestions, setConditionSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showConditionSuggestions, setShowConditionSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Instant condition processing without AI delays
  const handleConditionChange = (value: string) => {
    setFormData(prev => ({ ...prev, condition: value }));
    
    if (value.length > 1) {
      const suggestions = getConditionSuggestions(value);
      setConditionSuggestions(suggestions);
      setShowConditionSuggestions(suggestions.length > 0);
    } else {
      setShowConditionSuggestions(false);
    }
  };

  // Instant location processing
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    
    if (value.length > 1) {
      const suggestions = getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  // Quick selection handlers
  const selectCondition = (condition: string) => {
    setFormData(prev => ({ ...prev, condition }));
    setShowConditionSuggestions(false);
  };

  const selectLocation = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  // Streamlined form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.condition.trim()) newErrors.condition = 'Condition is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Save profile instantly without AI processing
    const profileData = {
      ...formData,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    localStorage.setItem('patientProfile', JSON.stringify(profileData));
    
    // Quick transition to dashboard
    setTimeout(() => {
      router.push('/patient/dashboard');
    }, 500);
  };



  const completionPercentage = Math.round(
    ((formData.name ? 1 : 0) + (formData.condition ? 1 : 0) + (formData.location ? 1 : 0)) / 3 * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">CuraLink</h1>
                <p className="text-xs text-gray-600">Healthcare Matching Platform</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">{completionPercentage}% Complete</div>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="max-w-2xl w-full">
          {/* Main Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Find Your Perfect Match
              </h2>
              <p className="text-gray-600 text-lg">Connect with clinical trials, experts, and research tailored to you</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👋 What's your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.name && <p className="mt-2 text-red-600 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.name}</p>}
              </div>

              {/* Condition Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🏥 What condition are you interested in?
                </label>
                <input
                  id="condition-input"
                  type="text"
                  value={formData.condition}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  placeholder="Type your condition or select from popular ones below"
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all ${
                    errors.condition ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.condition && <p className="mt-2 text-red-600 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.condition}</p>}
                
                {/* Condition Suggestions */}
                {showConditionSuggestions && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {conditionSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectCondition(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Popular Conditions */}
                {!formData.condition && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Popular conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularConditions.map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => selectCondition(condition)}
                          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📍 Where are you located?
                </label>
                <input
                  id="location-input"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Enter your city and country"
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all ${
                    errors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.location && <p className="mt-2 text-red-600 text-sm flex items-center"><span className="mr-1">⚠️</span>{errors.location}</p>}
                
                {/* Location Suggestions */}
                {showLocationSuggestions && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Popular Locations */}
                {!formData.location && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Popular locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularLocations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => selectLocation(location)}
                          className="px-3 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm hover:bg-cyan-200 transition-colors"
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.condition.trim() || !formData.location.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Setting up your profile...</span>
                  </div>
                ) : (
                  <span>🚀 Start Matching</span>
                )}
              </button>
            </form>

            {/* Benefits */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">🧪</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Clinical Trials</p>
                  <p className="text-xs text-gray-500">Find relevant studies</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Expert Doctors</p>
                  <p className="text-xs text-gray-500">Connect with specialists</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">📚</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Latest Research</p>
                  <p className="text-xs text-gray-500">Stay informed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}