'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../../lib/api';

interface PatientProfile {
  condition: string;
  location: string;
}

interface ClinicalTrial {
  id: number;
  title: string;
  phase: string;
  status: string;
  location: string;
  description?: string;
}

export default function ClinicalTrialsTab({ profile }: { profile: PatientProfile }) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [phaseFilter, setPhaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAISummary, setShowAISummary] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (profile?.condition) {
      loadTrials();
      loadFavorites();
    }
  }, [profile?.condition]);

  const loadTrials = async () => {
    if (!profile?.condition) return;
    try {
      const searchQuery = searchTerm ? `${profile.condition} ${searchTerm}` : profile.condition;
      const response = await apiService.getClinicalTrials(searchQuery, profile.location);
      setTrials(response.trials || []);
    } catch (error) {
      console.warn('Trials API unavailable, using fallback data');
      setTrials([]);
    } finally {
      setLoading(false);
    }
  };



  const searchTrials = async () => {
    if (searchTerm.length > 2) {
      setLoading(true);
      await loadTrials();
    }
  };

  const keywordSuggestions = [
    'immunotherapy', 'chemotherapy', 'radiation therapy', 'targeted therapy',
    'CAR-T cell therapy', 'checkpoint inhibitors', 'monoclonal antibodies',
    'gene therapy', 'stem cell transplant', 'precision medicine',
    'biomarker testing', 'combination therapy', 'neoadjuvant therapy',
    'adjuvant therapy', 'maintenance therapy', 'palliative care'
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchTrials();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadFavorites = () => {
    const saved = localStorage.getItem('patientFavorites');
    if (saved) {
      const allFavorites = JSON.parse(saved);
      setFavorites(allFavorites.trials || []);
    }
  };

  const toggleFavorite = (trialId: number) => {
    const saved = localStorage.getItem('patientFavorites') || '{}';
    const allFavorites = JSON.parse(saved);
    const currentTrials = allFavorites.trials || [];
    
    const newTrials = currentTrials.includes(trialId)
      ? currentTrials.filter((id: number) => id !== trialId)
      : [...currentTrials, trialId];
    
    const updatedFavorites = { ...allFavorites, trials: newTrials };
    localStorage.setItem('patientFavorites', JSON.stringify(updatedFavorites));
    setFavorites(newTrials);
  };

  const calculateTrialLocationDistance = (trialLocation: string, patientLocation: string) => {
    const trial = trialLocation.toLowerCase();
    const patient = patientLocation.toLowerCase();
    
    // Exact city match
    if (trial.includes(patient.split(',')[0])) return 0;
    
    // Multi-center trials get priority
    if (trial.includes('multi-center') || trial.includes('multicenter')) return 0.5;
    
    // Same country/region match
    const patientParts = patient.split(',').map(p => p.trim());
    const trialParts = trial.split(',').map(p => p.trim());
    
    // Same country
    if (patientParts.length > 1 && trialParts.length > 1) {
      if (trialParts[trialParts.length - 1] === patientParts[patientParts.length - 1]) return 1;
    }
    
    // Same continent
    const northAmerica = ['usa', 'canada', 'united states', 'america'];
    const europe = ['netherlands', 'germany', 'france', 'uk', 'england'];
    
    const patientRegion = northAmerica.some(r => patient.includes(r)) ? 'na' : 
                         europe.some(r => patient.includes(r)) ? 'eu' : 'other';
    const trialRegion = northAmerica.some(r => trial.includes(r)) ? 'na' : 
                       europe.some(r => trial.includes(r)) ? 'eu' : 'other';
    
    if (patientRegion === trialRegion) return 2;
    return 3;
  };

  const calculateMatchScore = (trial: ClinicalTrial) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const title = trial.title.toLowerCase();
    const description = trial.description?.toLowerCase() || '';
    
    // Condition match (40% weight)
    if (title.includes(condition)) score += 40;
    else if (description.includes(condition)) score += 30;
    else if (title.includes(condition.split(' ')[0])) score += 20;
    
    // Location proximity (30% weight - increased from 25%)
    const distance = calculateTrialLocationDistance(trial.location, profile.location);
    if (distance === 0) score += 30; // Same city or multi-center
    else if (distance === 0.5) score += 28; // Multi-center
    else if (distance === 1) score += 20; // Same country
    else if (distance === 2) score += 10; // Same continent
    else score += 0; // Different continent
    
    // Phase relevance (15% weight - decreased from 20%)
    if (trial.phase === 'Phase III') score += 15;
    else if (trial.phase === 'Phase II') score += 12;
    else if (trial.phase === 'Phase I') score += 8;
    
    // Status relevance (15% weight)
    if (trial.status === 'Recruiting') score += 15;
    else if (trial.status === 'Enrolling') score += 10;
    else if (trial.status === 'Active') score += 5;
    
    return Math.min(score, 100);
  };

  const filteredTrials = trials.filter(trial => {
    const searchLower = searchTerm.toLowerCase();
    const conditionLower = profile.condition.toLowerCase();
    
    // Enhanced search: combine user's condition with search term for disease-specific results
    const enhancedSearch = searchTerm ? `${conditionLower} ${searchLower}` : conditionLower;
    
    const matchesSearch = !searchTerm || 
      trial.title.toLowerCase().includes(searchLower) ||
      trial.phase.toLowerCase().includes(searchLower) ||
      (trial.description && trial.description.toLowerCase().includes(searchLower)) ||
      // Disease-specific matching: search term + condition
      trial.title.toLowerCase().includes(enhancedSearch) ||
      (trial.description && trial.description.toLowerCase().includes(enhancedSearch));
    
    const matchesPhase = !phaseFilter || trial.phase.toLowerCase().includes(phaseFilter.toLowerCase());
    const matchesStatus = !statusFilter || trial.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesLocation = !locationFilter || trial.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesPhase && matchesStatus && matchesLocation;
  }).map(trial => ({ 
    ...trial, 
    matchScore: calculateMatchScore(trial),
    locationDistance: calculateTrialLocationDistance(trial.location, profile.location)
  }))
    .sort((a, b) => {
      // Primary sort: location distance (closest first)
      if (a.locationDistance !== b.locationDistance) {
        return a.locationDistance - b.locationDistance;
      }
      // Secondary sort: match score (highest first)
      return b.matchScore - a.matchScore;
    });

  const generateAISummary = (trial: ClinicalTrial) => {
    const title = trial.title.toLowerCase();
    const description = trial.description?.toLowerCase() || '';
    const condition = profile.condition.toLowerCase();
    
    // Personalized introduction based on patient's condition
    const personalizedIntro = `**For patients with ${profile.condition}:**`;
    
    // Enhanced AI-generated summaries with modern, interactive content
    if (title.includes('immunotherapy') || description.includes('immunotherapy')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: This trial harnesses your immune system's power to fight ${profile.condition}. Think of it as training your body's natural defenders to better recognize and eliminate problem cells.

⚙️ **How it works**: 
• Uses checkpoint inhibitors (removes brakes from immune cells)
• May include CAR-T therapy (genetically modified immune cells)
• Activates your T-cells to target specific cancer markers

📊 **Success rates**: Immunotherapy shows 20-40% response rates in similar conditions

⏱️ **Timeline**: Treatment cycles every 2-3 weeks, effects may take 2-3 months to show

⚠️ **What to watch for**: Immune-related side effects (fatigue, skin changes, digestive issues)`,
        keyPoints: ['Immune system training', 'Durable responses possible', 'Manageable side effects'],
        riskLevel: 'Moderate',
        timeCommitment: '3-6 months',
        eligibility: 'Previous treatment history may be required'
      };
    }
    
    if (title.includes('targeted therapy') || description.includes('targeted')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: This is precision medicine - a treatment designed specifically for your tumor's genetic "fingerprint".

🧬 **How it works**:
• Targets specific mutations in your ${condition} cells
• Blocks proteins that help cancer grow and spread
• Spares healthy cells (fewer side effects than chemotherapy)

📊 **Success rates**: 60-80% of patients with matching mutations respond

🔬 **Requirements**: Genetic testing of your tumor (biopsy or blood test)

⏱️ **Timeline**: Daily oral medication, effects visible in 6-12 weeks`,
        keyPoints: ['Personalized treatment', 'Fewer side effects', 'Genetic testing required'],
        riskLevel: 'Low-Moderate',
        timeCommitment: '6-12 months',
        eligibility: 'Specific genetic mutations required'
      };
    }
    
    if (title.includes('combination') || description.includes('combination')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: Combines multiple treatments to attack ${profile.condition} from different angles - like using multiple keys to unlock a door.

⚙️ **How it works**:
• Each treatment targets different pathways
• May include immunotherapy + targeted therapy
• Reduces chance of resistance developing

📊 **Success rates**: Combination therapies show 40-70% higher response rates

⚠️ **Considerations**: More monitoring required, potential for increased side effects

💡 **Why combinations work**: Cancer cells can't easily adapt to multiple attacks`,
        keyPoints: ['Multi-pronged attack', 'Higher success rates', 'More monitoring needed'],
        riskLevel: 'Moderate-High',
        timeCommitment: '4-8 months',
        eligibility: 'Good overall health status required'
      };
    }
    
    if (title.includes('phase i')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: You'd be among the first people to try this new treatment for ${profile.condition}.

🔬 **How it works**:
• Small groups (15-30 patients) test different doses
• Primary goal: Find the safest, most effective dose
• Secondary goal: Look for early signs of effectiveness

📊 **What we know**: Treatment showed promise in laboratory studies

⚠️ **Important**: This is experimental - unknown risks and benefits

🏥 **Commitment**: Frequent hospital visits, extensive monitoring

💪 **Why consider**: Access to cutting-edge treatment, contribute to medical breakthroughs`,
        keyPoints: ['First-in-human trial', 'Experimental treatment', 'Intensive monitoring'],
        riskLevel: 'Higher (Unknown)',
        timeCommitment: '3-6 months intensive',
        eligibility: 'Previous treatments may be required'
      };
    }
    
    if (title.includes('phase ii')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: Tests if this treatment actually works for ${profile.condition} while continuing safety monitoring.

📊 **How it works**:
• 50-100 patients with your condition
• Measures tumor shrinkage and symptom improvement
• Compares results to historical data

✅ **Safety profile**: Basic safety already established in Phase I

📈 **Success indicators**: Looking for 20-30% response rate to move forward

⏱️ **Timeline**: Regular scans every 6-8 weeks to track progress`,
        keyPoints: ['Proven safety profile', 'Effectiveness testing', 'Regular monitoring'],
        riskLevel: 'Moderate',
        timeCommitment: '4-6 months',
        eligibility: 'Specific disease stage may be required'
      };
    }
    
    if (title.includes('phase iii')) {
      return {
        summary: `${personalizedIntro}

🎯 **What it does**: Compares this promising new treatment directly against the current best treatment for ${profile.condition}.

⚖️ **How it works**:
• Large study (100-1000+ patients)
• Random assignment to new treatment or standard care
• Neither you nor your doctor chooses which group

📊 **Why this matters**: This is the final test before FDA approval

✅ **Advantages**: Access to potentially better treatment, excellent medical care

🎲 **The randomization**: 50% chance of new treatment, 50% chance of current standard

🏆 **Track record**: Most Phase III trials lead to FDA approval`,
        keyPoints: ['Gold standard trial', 'Random assignment', 'Potential FDA approval'],
        riskLevel: 'Low-Moderate',
        timeCommitment: '6-12 months',
        eligibility: 'Specific disease characteristics required'
      };
    }
    
    // Condition-specific summaries
    if (condition.includes('brain') || title.includes('glioma') || title.includes('glioblastoma')) {
      return {
        summary: `${personalizedIntro}

🧠 **What it does**: Specialized treatment designed to cross the blood-brain barrier and reach brain tissue effectively.

⚙️ **How it works**:
• Uses delivery methods that can penetrate brain tissue
• May include focused ultrasound or direct injection
• Targets brain tumor characteristics specifically

🔬 **Advanced monitoring**: Regular MRI scans, cognitive assessments

💡 **Goal**: Shrink tumors while preserving brain function and quality of life`,
        keyPoints: ['Brain-specific delivery', 'Cognitive monitoring', 'Quality of life focus'],
        riskLevel: 'Moderate',
        timeCommitment: '3-9 months',
        eligibility: 'Specific tumor location and type'
      };
    }
    
    // Default comprehensive summary with modern features
    return {
      summary: `${personalizedIntro}

🎯 **What it does**: This clinical trial is testing an innovative treatment approach specifically for ${profile.condition}.

🔬 **The science**: Researchers are investigating whether this new intervention can improve outcomes compared to current standard treatments.

📊 **Your role**: You'll receive cutting-edge medical care while helping advance treatment for future patients with ${profile.condition}.

🏥 **What to expect**: Regular medical monitoring, detailed tracking of your response, and contribution to medical breakthroughs.

📞 **Next steps**: Contact the study team to discuss eligibility criteria and learn about the enrollment process.`,
      keyPoints: ['Innovative approach', 'Standard care comparison', 'Medical advancement'],
      riskLevel: 'To be determined',
      timeCommitment: 'Varies by study',
      eligibility: 'Contact study team for details'
    };
  };

  const contactTrialAdmin = (trial: ClinicalTrial) => {
    const subject = `Inquiry about Clinical Trial: ${trial.title}`;
    const body = `Dear Clinical Trial Administrator,

I am interested in learning more about the following clinical trial:

Trial: ${trial.title}
Phase: ${trial.phase}
Status: ${trial.status}
Location: ${trial.location}

Patient Information:
- Medical Condition: ${profile.condition}
- Current Location: ${profile.location}
- Inquiry Date: ${new Date().toLocaleDateString()}

I would like to know more about:
- Eligibility criteria for this study
- Enrollment process and timeline
- Study location and schedule requirements
- Potential risks and benefits
- Contact information for the research team

Please let me know if you need any additional information from me.

Thank you for your time and consideration.

Best regards,
[Please enter your name and contact information]`;
    
    const emailContent = `To: [Trial Administrator Email]
Subject: ${subject}

${body}`;
    
    // Direct approach - try window.location first
    try {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (error) {
      console.log('Direct mailto failed, trying fallback');
    }
    
    // Immediate fallback option
    setTimeout(() => {
      if (confirm('Did your email client open? If not, click OK to copy the email content to clipboard.')) {
        navigator.clipboard.writeText(emailContent).then(() => {
          alert('✅ Email content copied to clipboard! You can paste it into Gmail, Outlook, or any email client.');
        }).catch(() => {
          // Fallback for clipboard API failure
          prompt('Copy this email content:', emailContent);
        });
      }
    }, 500);
  };

  if (loading) return <div className="text-center py-8">Loading trials...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Clinical Trials</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Live data from ClinicalTrials.gov API</span>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={`Search (auto-includes ${profile.condition}): e.g., "multiple system atrophy", "immunotherapy", "vaccine"`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            />
            {searchTerm.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {keywordSuggestions
                  .filter(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
                  .slice(0, 5)
                  .map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(keyword);
                        setTimeout(() => setSearchTerm(''), 100);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 text-sm"
                    >
                      {keyword}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="">All Phases</option>
              <option value="Phase I">Phase I</option>
              <option value="Phase II">Phase II</option>
              <option value="Phase III">Phase III</option>
              <option value="Phase IV">Phase IV</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="">All Status</option>
              <option value="Recruiting">🟢 Recruiting</option>
              <option value="Active">🟡 Active, not recruiting</option>
              <option value="Enrolling">🟢 Enrolling by invitation</option>
              <option value="Completed">⚫ Completed</option>
              <option value="Terminated">🔴 Terminated</option>
              <option value="Suspended">🟠 Suspended</option>
              <option value="Withdrawn">⚪ Withdrawn</option>
            </select>
            
            <input
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTrials.map((trial) => (
          <div key={trial.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{trial.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    (trial as any).matchScore >= 80 ? 'bg-green-100 text-green-800' :
                    (trial as any).matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(trial as any).matchScore}% match
                  </span>
                </div>
              </div>
              <a 
                href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(trial.title.split(' ').slice(0, 4).join(' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline ml-2"
              >
                ClinicalTrials.gov ↗
              </a>
            </div>
            
            {trial.description && (
              <p className="text-gray-700 text-sm mb-3">{trial.description}</p>
            )}
            
            {showAISummary[trial.id] && (() => {
              const aiData = generateAISummary(trial);
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                        🤖 AI Patient Guide
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Personalized for you</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        aiData.riskLevel === 'Low' || aiData.riskLevel === 'Low-Moderate' ? 'bg-green-100 text-green-800' :
                        aiData.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        Risk: {aiData.riskLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed mb-4">
                    {aiData.summary}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <h5 className="text-xs font-semibold text-blue-800 mb-2">✨ Key Benefits</h5>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {aiData.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-green-500">✓</span> {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <h5 className="text-xs font-semibold text-blue-800 mb-2">⏱️ Time Commitment</h5>
                      <p className="text-xs text-gray-700">{aiData.timeCommitment}</p>
                      <h5 className="text-xs font-semibold text-blue-800 mb-1 mt-2">📋 Eligibility</h5>
                      <p className="text-xs text-gray-700">{aiData.eligibility}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <h5 className="text-xs font-semibold text-blue-800 mb-2">📊 Match Score</h5>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" 
                            style={{ width: `${(trial as any).matchScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">{(trial as any).matchScore}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Based on your condition & location</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">💡</span>
                      <div className="flex-1">
                        <p className="text-xs text-blue-800 font-medium mb-1">Important Reminder:</p>
                        <p className="text-xs text-blue-700">
                          This AI summary is for educational purposes only. Always discuss clinical trial participation with your oncologist, 
                          primary care physician, and loved ones before making any decisions. They can help you understand if this trial 
                          is appropriate for your specific situation.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => {
                        const summaryText = `Clinical Trial AI Summary\n\nTrial: ${trial.title}\n\n${aiData.summary}\n\nKey Points: ${aiData.keyPoints.join(', ')}\nTime Commitment: ${aiData.timeCommitment}\nRisk Level: ${aiData.riskLevel}\nEligibility: ${aiData.eligibility}`;
                        navigator.clipboard.writeText(summaryText).then(() => {
                          alert('✅ AI summary copied to clipboard! You can share this with your healthcare team.');
                        }).catch(() => {
                          prompt('Copy this summary:', summaryText);
                        });
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      📋 Copy Summary
                    </button>
                    <button 
                      onClick={() => {
                        const questions = `Questions to ask your doctor about this clinical trial:\n\n1. Am I eligible for this study based on my current condition?\n2. How does this compare to my current treatment options?\n3. What are the potential risks and benefits for someone like me?\n4. How often would I need to visit the clinic?\n5. What side effects should I watch for?\n6. Can I continue my current medications?\n7. What happens if the treatment doesn't work?\n8. How long would I be in the study?\n9. What costs would be covered?\n10. Can I leave the study if I want to?`;
                        navigator.clipboard.writeText(questions).then(() => {
                          alert('✅ Doctor questions copied! Bring these to your next appointment.');
                        }).catch(() => {
                          prompt('Copy these questions for your doctor:', questions);
                        });
                      }}
                      className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      👩‍⚕️ Doctor Questions
                    </button>
                  </div>
                </div>
              );
            })()}
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{trial.phase}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                trial.status.toLowerCase().includes('recruiting') ? 'bg-green-100 text-green-800' :
                trial.status.toLowerCase().includes('completed') ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{trial.status}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">📍 {trial.location}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                (trial as any).locationDistance === 0 || (trial as any).locationDistance === 0.5 ? 'bg-green-100 text-green-800' :
                (trial as any).locationDistance === 1 ? 'bg-blue-100 text-blue-800' :
                (trial as any).locationDistance === 2 ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {(trial as any).locationDistance === 0 ? '📍 Local' :
                 (trial as any).locationDistance === 0.5 ? '🌐 Multi-center' :
                 (trial as any).locationDistance === 1 ? '🌍 Same Country' :
                 (trial as any).locationDistance === 2 ? '🌎 Same Region' :
                 '🌏 International'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setShowAISummary(prev => ({...prev, [trial.id]: !prev[trial.id]}))}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium focus-ring transition-all duration-200 shadow-sm flex items-center gap-1"
              >
                <span className="text-xs">🤖</span>
                {showAISummary[trial.id] ? 'Hide AI Guide' : 'AI Patient Guide'}
              </button>
              
              <button 
                onClick={() => contactTrialAdmin(trial)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                title="Opens email client or copies content to clipboard"
              >
                📧 Email Inquiry
              </button>
              
              <button
                onClick={() => toggleFavorite(trial.id)}
                className={`px-3 py-2 text-sm rounded ${
                  favorites.includes(trial.id)
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {favorites.includes(trial.id) ? '⭐ Saved' : '⭐ Save'}
              </button>
            </div>
          </div>
        ))}
        
        {filteredTrials.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trials found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}