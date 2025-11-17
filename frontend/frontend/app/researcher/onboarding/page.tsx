'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResearcherOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    location: '',
    specialties: [] as string[],
    researchInterests: [] as string[],
    orcid: '',
    researchGate: '',
    availableForMeetings: false
  });

  const specialtyOptions = [
    'Oncology', 'Neurology', 'Movement Disorders Neurology', 'Cardiology', 'Immunology', 'Genetics',
    'Pharmacology', 'Radiology', 'Pathology', 'Surgery', 'Pediatrics', 'Psychiatry',
    'Child and Adolescent Psychiatry', 'Proteomics and Cancer Research', 'Chemical Biology',
    'Proteomics and Pathology', 'Pediatric Neurology', 'Pediatric Neurosurgery'
  ];

  const researchInterestOptions = [
    'Immunotherapy', 'Clinical AI', 'Gene Therapy', 'Drug Discovery',
    'Biomarkers', 'Precision Medicine', 'Clinical Trials', 'Diagnostics',
    'Parkinson\'s Disease', 'Deep Brain Stimulation', 'Movement Disorders', 'Neurodegeneration',
    'Stem Cell Therapy', 'Proteomics', 'Recurrent Glioma', 'Mass Spectrometry',
    'Attention-Deficit/Hyperactivity Disorder (ADHD)', 'ADHD', 'Neurofeedback Training', 'Neuroimaging', 'Brain Development',
    'Depression', 'Brain Stimulation', 'Cognitive Therapy', 'Long-term Outcomes',
    'Pediatric Neurology', 'Epilepsy Surgery', 'Breast Cancer', 'Ductal Carcinoma in Situ'
  ];

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.institution.trim() && formData.location.trim()) {
      setStep(2);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.includes(interest)
        ? prev.researchInterests.filter(i => i !== interest)
        : [...prev.researchInterests, interest]
    }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.specialties.length > 0 && formData.researchInterests.length > 0) {
      const profileData = {
        ...formData,
        lastAccessed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Save to both localStorage and Supabase
      localStorage.setItem('researcherProfile', JSON.stringify(profileData));
      
      try {
        const { apiService } = await import('../../../lib/api');
        await apiService.createResearcherProfile({
          name: profileData.name,
          institution: profileData.institution,
          location: profileData.location,
          specialties: profileData.specialties,
          research_interests: profileData.researchInterests,
          orcid: profileData.orcid,
          research_gate: profileData.researchGate,
          available_for_meetings: profileData.availableForMeetings
        });
      } catch (error) {
        console.error('Failed to save to Supabase:', error);
      }
      
      router.push('/researcher/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.01] transition-all duration-300">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-2xl">C</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">CuraLink</h1>
            <p className="text-gray-600 font-medium">Research Collaboration Platform</p>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Step {step} of 3</span>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200/50">
                {step === 1 ? '👤 Basic Info' : step === 2 ? '🎯 Specialties' : '🔬 Research Interests'}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${(step / 3) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              {/* Step indicators */}
              <div className="flex justify-between mt-2">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    stepNum <= step 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg transform scale-110' 
                      : 'bg-gray-300'
                  }`}></div>
                ))}
              </div>
            </div>
          </div>

        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200/50 mb-4">
                <span className="text-2xl">👋</span>
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Welcome, Researcher!</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Let's set up your professional profile</h2>
              <p className="text-gray-600">Join thousands of researchers collaborating worldwide</p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 transition-all duration-200 group-hover:border-purple-300"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  Institution *
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  placeholder="e.g., Harvard Medical School, Mayo Clinic"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 transition-all duration-200 group-hover:border-purple-300"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Toronto, Canada or Boston, MA, USA"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200 group-hover:border-blue-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">🆔</span>
                    ORCID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.orcid}
                    onChange={(e) => setFormData({...formData, orcid: e.target.value})}
                    placeholder="0000-0000-0000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400 transition-all duration-200 group-hover:border-orange-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">🔬</span>
                    ResearchGate (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.researchGate}
                    onChange={(e) => setFormData({...formData, researchGate: e.target.value})}
                    placeholder="Your profile username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 transition-all duration-200 group-hover:border-green-300"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="meetings"
                    checked={formData.availableForMeetings}
                    onChange={(e) => setFormData({...formData, availableForMeetings: e.target.checked})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                  />
                  <label htmlFor="meetings" className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    I'm available for meetings with patients and collaborators
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Continue to Specialties</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Medical Specialties</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Select Your Areas of Expertise</h2>
              <p className="text-gray-600">Choose the medical fields you specialize in</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {specialtyOptions.map((specialty, index) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className={`group p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                    formData.specialties.includes(specialty)
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.specialties.includes(specialty) && (
                      <span className="text-purple-500 text-lg animate-bounce">✓</span>
                    )}
                    <span className="text-center leading-tight">{specialty}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {formData.specialties.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span className="font-semibold text-green-700">Selected Specialties ({formData.specialties.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty) => (
                    <span key={specialty} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={formData.specialties.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
              >
                <span>Continue to Research</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full border border-cyan-200/50 mb-4">
                <span className="text-2xl">🔬</span>
                <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Research Focus</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your Research Interests</h2>
              <p className="text-gray-600">Select the areas you're actively researching</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {researchInterestOptions.map((interest, index) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`group p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                    formData.researchInterests.includes(interest)
                      ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 shadow-lg'
                      : 'border-gray-200 hover:border-cyan-300 text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.researchInterests.includes(interest) && (
                      <span className="text-cyan-500 text-lg animate-bounce">✓</span>
                    )}
                    <span className="text-center leading-tight">{interest}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {formData.researchInterests.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500 text-lg">🔬</span>
                  <span className="font-semibold text-blue-700">Research Focus Areas ({formData.researchInterests.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.researchInterests.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={formData.researchInterests.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
              >
                <span className="text-xl">🚀</span>
                <span>Complete Setup</span>
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}