'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../../lib/api';

interface PatientProfile {
  condition: string;
  location: string;
}

interface FavoriteItem {
  id: number;
  title: string;
  type: 'trial' | 'expert' | 'publication';
  subtitle: string;
  date: string;
  data: any; // Store the full object data
}

export default function FavoritesTab({ profile }: { profile: PatientProfile }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const saved = localStorage.getItem('patientFavorites');
    if (saved) {
      const favData = JSON.parse(saved);
      const allFavorites: FavoriteItem[] = [];

      try {
        // Load actual trials data
        if (favData.trials?.length > 0) {
          try {
            const trialsResponse = await apiService.getClinicalTrials(profile.condition);
            const savedTrials = (trialsResponse.trials || []).filter(trial => favData.trials.includes(trial.id));
          
            savedTrials.forEach((trial) => {
              allFavorites.push({
                id: trial.id,
                title: trial.title,
                type: 'trial',
                subtitle: `${trial.phase} • ${trial.status} • ${trial.location}`,
                date: getSavedDate(trial.id, 'trials'),
                data: trial
              });
            });
          } catch (error) {
            console.warn('Failed to load trial data for favorites');
          }
        }

        // Load actual experts data
        if (favData.experts?.length > 0) {
          try {
            const expertsResponse = await apiService.getHealthExperts();
            const savedExperts = (expertsResponse.experts || []).filter(expert => favData.experts.includes(expert.id));
          
            savedExperts.forEach((expert) => {
              allFavorites.push({
                id: expert.id,
                title: expert.name,
                type: 'expert',
                subtitle: `${expert.specialty} • ${expert.institution} • ${expert.location}`,
                date: getSavedDate(expert.id, 'experts'),
                data: expert
              });
            });
          } catch (error) {
            console.warn('Failed to load expert data for favorites');
          }
        }

        // Load actual publications data
        if (favData.publications?.length > 0) {
          try {
            const pubsResponse = await apiService.getPublications(profile.condition);
            const savedPubs = (pubsResponse.publications || []).filter(pub => favData.publications.includes(pub.id));
          
            savedPubs.forEach((pub) => {
              allFavorites.push({
                id: pub.id,
                title: pub.title,
                type: 'publication',
                subtitle: `${pub.journal} • ${pub.date} • ${pub.authors[0]}`,
                date: getSavedDate(pub.id, 'publications'),
                data: pub
              });
            });
          } catch (error) {
            console.warn('Failed to load publication data for favorites');
          }
        }

        // Sort by most recently saved
        allFavorites.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFavorites(allFavorites);
      } catch (error) {
        console.warn('Error loading favorites, using cached data');
        setFavorites([]);
      }
    }
  };

  const getSavedDate = (id: number, type: string) => {
    const savedDates = JSON.parse(localStorage.getItem('favoriteDates') || '{}');
    const key = `${type}_${id}`;
    if (savedDates[key]) {
      const date = new Date(savedDates[key]);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    }
    return 'Recently';
  };

  const removeFavorite = (item: FavoriteItem) => {
    const saved = localStorage.getItem('patientFavorites') || '{}';
    const favData = JSON.parse(saved);
    
    if (item.type === 'trial') {
      favData.trials = (favData.trials || []).filter((id: number) => id !== item.id);
    } else if (item.type === 'expert') {
      favData.experts = (favData.experts || []).filter((id: number) => id !== item.id);
    } else if (item.type === 'publication') {
      favData.publications = (favData.publications || []).filter((id: number) => id !== item.id);
    }
    
    localStorage.setItem('patientFavorites', JSON.stringify(favData));
    loadFavorites();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trial': return '🔬';
      case 'expert': return '👨‍⚕️';
      case 'publication': return '📄';
      default: return '⭐';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-green-100 text-green-800';
      case 'publication': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewItem = (item: FavoriteItem) => {
    if (item.type === 'trial') {
      // Could navigate to trial details or show modal
      alert(`Viewing trial: ${item.title}\n\nPhase: ${item.data.phase}\nStatus: ${item.data.status}\nLocation: ${item.data.location}\n\nDescription: ${item.data.description || 'No description available'}`);
    } else if (item.type === 'expert') {
      // Could navigate to expert profile or show contact modal
      alert(`Expert: ${item.title}\n\nSpecialty: ${item.data.specialty}\nInstitution: ${item.data.institution}\nLocation: ${item.data.location}\nAvailable: ${item.data.available_for_meetings ? 'Yes' : 'No'}\n\nResearch Interests: ${item.data.research_interests.join(', ')}`);
    } else if (item.type === 'publication') {
      // Could open publication link
      const link = item.data.doi ? `https://doi.org/${item.data.doi}` : `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(item.title)}`;
      window.open(link, '_blank');
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateSummary = () => {
    const selectedFavorites = favorites.filter(item => selectedItems.includes(item.id));
    
    let summary = `MEDICAL RESEARCH SUMMARY FOR DOCTOR CONSULTATION\n`;
    summary += `Patient Condition: ${profile.condition}\n`;
    summary += `Patient Location: ${profile.location}\n`;
    summary += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    const trials = selectedFavorites.filter(item => item.type === 'trial');
    const experts = selectedFavorites.filter(item => item.type === 'expert');
    const publications = selectedFavorites.filter(item => item.type === 'publication');

    if (experts.length > 0) {
      summary += `RECOMMENDED SPECIALISTS (${experts.length}):\n`;
      experts.forEach((item, index) => {
        const expert = item.data;
        summary += `${index + 1}. ${expert.name}\n`;
        summary += `   Specialty: ${expert.specialty}\n`;
        summary += `   Institution: ${expert.institution}\n`;
        summary += `   Location: ${expert.location}\n\n`;
      });
    }

    if (trials.length > 0) {
      summary += `RELEVANT CLINICAL TRIALS (${trials.length}):\n`;
      trials.forEach((item, index) => {
        const trial = item.data;
        summary += `${index + 1}. ${trial.title}\n`;
        summary += `   Phase: ${trial.phase}\n`;
        summary += `   Status: ${trial.status}\n`;
        summary += `   Location: ${trial.location}\n\n`;
      });
    }

    if (publications.length > 0) {
      summary += `RELEVANT RESEARCH PUBLICATIONS (${publications.length}):\n`;
      publications.forEach((item, index) => {
        const pub = item.data;
        summary += `${index + 1}. ${pub.title}\n`;
        summary += `   Journal: ${pub.journal}\n`;
        summary += `   Date: ${pub.date}\n\n`;
      });
    }

    summary += `\nNOTES FOR DISCUSSION:\n`;
    summary += `- Please review these specialists for potential referrals\n`;
    summary += `- Consider eligibility for listed clinical trials\n`;
    summary += `- Discuss latest research findings and treatment options\n`;

    setGeneratedSummary(summary);
    setShowSummary(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSummary).then(() => {
      alert('✅ Summary copied to clipboard!');
    }).catch(() => {
      prompt('Copy this summary:', generatedSummary);
    });
  };

  const exportFavorites = () => {
    const exportData = {
      exported_date: new Date().toISOString(),
      patient_condition: profile.condition,
      favorites: favorites.map(item => ({
        title: item.title,
        type: item.type,
        subtitle: item.subtitle,
        saved_date: item.date
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-favorites-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredFavorites = activeFilter === 'all' 
    ? favorites 
    : favorites.filter(item => item.type === activeFilter);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">My Favorites</h3>
          <p className="text-sm text-gray-600">Your saved clinical trials, experts, and publications</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{favorites.length} saved items</span>
          {selectedItems.length > 0 && (
            <button
              onClick={generateSummary}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 text-sm font-medium shadow-card transition-all duration-200"
            >
              📋 Generate Doctor Summary ({selectedItems.length})
            </button>
          )}
          {favorites.length > 0 && (
            <button
              onClick={exportFavorites}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center gap-1"
            >
              💾 Export
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All', count: favorites.length },
          { id: 'trial', label: 'Trials', count: favorites.filter(f => f.type === 'trial').length },
          { id: 'expert', label: 'Experts', count: favorites.filter(f => f.type === 'expert').length },
          { id: 'publication', label: 'Publications', count: favorites.filter(f => f.type === 'publication').length }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === filter.id
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Instructions */}
      {favorites.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 Doctor Consultation Helper</h4>
          <p className="text-sm text-blue-700">
            Select items using checkboxes, then click "Generate Doctor Summary" to create a professional summary 
            you can print or share with your healthcare provider.
          </p>
        </div>
      )}

      {/* Favorites List */}
      <div className="space-y-4">
        {filteredFavorites.map((item) => (
          <div key={`${item.type}-${item.id}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="mt-1"
                />
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{item.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">Saved {item.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => viewItem(item)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 font-medium focus-ring transition-colors duration-200"
                >
                  View Details
                </button>
                <button
                  onClick={() => removeFavorite(item)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                >
                  ✖ Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredFavorites.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">⭐</span>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No favorites yet</h4>
            <p className="text-gray-600 mb-4">
              {activeFilter === 'all' 
                ? 'Start saving clinical trials, experts, and publications to see them here.'
                : `No ${activeFilter}s saved yet. Browse and save items to build your collection.`
              }
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigateToTab', { detail: 'trials' });
                  window.dispatchEvent(event);
                }}
                className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
              >
                🔬 Browse Trials
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigateToTab', { detail: 'experts' });
                  window.dispatchEvent(event);
                }}
                className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200"
              >
                👨‍⚕️ Find Experts
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigateToTab', { detail: 'publications' });
                  window.dispatchEvent(event);
                }}
                className="px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded hover:bg-purple-200"
              >
                📚 Read Papers
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">📋 Doctor Consultation Summary</h3>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 overflow-y-auto max-h-60 sm:max-h-96">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-4 rounded-lg">
                {generatedSummary}
              </pre>
            </div>
            
            <div className="p-3 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={copyToClipboard}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-cyan-600 font-medium shadow-card transition-all duration-200"
              >
                📋 Copy to Clipboard
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium shadow-card transition-all duration-200"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}