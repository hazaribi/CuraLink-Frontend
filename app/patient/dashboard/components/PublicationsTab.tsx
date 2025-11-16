'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../../lib/api';

interface PatientProfile {
  condition: string;
  location: string;
}

interface Publication {
  id: number;
  title: string;
  journal: string;
  authors: string[];
  date: string;
  doi?: string;
  pmid?: string;
  abstract?: string;
}

export default function PublicationsTab({ profile }: { profile: PatientProfile }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [journalFilter, setJournalFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showAISummary, setShowAISummary] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (profile?.condition) {
      loadPublications();
      loadFavorites();
    }
  }, [profile?.condition]);

  const loadPublications = async () => {
    if (!profile?.condition) return;
    try {
      const keyword = searchTerm ? `${profile.condition} ${searchTerm}` : profile.condition;
      const response = await apiService.getPublications(keyword, journalFilter);
      setPublications(response.publications || []);
    } catch (error) {
      console.error('Publications API error:', error instanceof Error ? error.message : 'Unknown error');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPublications = async () => {
    if (searchTerm.length > 2) {
      setLoading(true);
      await loadPublications();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchPublications();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadFavorites = () => {
    const saved = localStorage.getItem('patientFavorites');
    if (saved) {
      const allFavorites = JSON.parse(saved);
      setFavorites(allFavorites.publications || []);
    }
  };

  const toggleFavorite = (pubId: number) => {
    const saved = localStorage.getItem('patientFavorites') || '{}';
    const allFavorites = JSON.parse(saved);
    const currentPubs = allFavorites.publications || [];
    
    const newPubs = currentPubs.includes(pubId)
      ? currentPubs.filter((id: number) => id !== pubId)
      : [...currentPubs, pubId];
    
    const updatedFavorites = { ...allFavorites, publications: newPubs };
    localStorage.setItem('patientFavorites', JSON.stringify(updatedFavorites));
    setFavorites(newPubs);
  };

  const calculatePublicationMatchScore = (pub: Publication) => {
    let score = 0;
    const condition = profile.condition.toLowerCase();
    const title = pub.title.toLowerCase();
    const abstract = pub.abstract?.toLowerCase() || '';
    const journal = pub.journal.toLowerCase();
    const year = parseInt(pub.date);
    const currentYear = new Date().getFullYear();
    
    // Title relevance (40% weight)
    if (title.includes(condition)) score += 40;
    else if (title.includes(condition.split(' ')[0])) score += 25;
    
    // Abstract relevance (25% weight)
    if (abstract.includes(condition)) score += 25;
    else if (abstract.includes(condition.split(' ')[0])) score += 15;
    
    // Journal impact (20% weight)
    const highImpactJournals = ['nature', 'science', 'nejm', 'lancet', 'jama', 'cell'];
    if (highImpactJournals.some(j => journal.includes(j))) score += 20;
    else if (journal.includes('journal')) score += 10;
    
    // Recency (15% weight)
    const yearsOld = currentYear - year;
    if (yearsOld <= 1) score += 15;
    else if (yearsOld <= 3) score += 10;
    else if (yearsOld <= 5) score += 5;
    
    return Math.min(score, 100);
  };

  const filteredPublications = publications.filter(pub => {
    const searchLower = searchTerm.toLowerCase();
    const conditionLower = profile.condition.toLowerCase();
    
    // Enhanced search: combine user's condition with search term for disease-specific results
    const enhancedSearch = searchTerm ? `${conditionLower} ${searchLower}` : conditionLower;
    
    const matchesSearch = !searchTerm || 
      pub.title.toLowerCase().includes(searchLower) ||
      pub.journal.toLowerCase().includes(searchLower) ||
      pub.authors.some(author => author.toLowerCase().includes(searchLower)) ||
      (pub.abstract && pub.abstract.toLowerCase().includes(searchLower)) ||
      // Disease-specific matching: search term + condition
      pub.title.toLowerCase().includes(enhancedSearch) ||
      (pub.abstract && pub.abstract.toLowerCase().includes(enhancedSearch));
    
    const matchesJournal = !journalFilter || pub.journal.toLowerCase().includes(journalFilter.toLowerCase());
    const matchesYear = !yearFilter || pub.date.includes(yearFilter);
    
    return matchesSearch && matchesJournal && matchesYear;
  }).map(pub => ({ ...pub, matchScore: calculatePublicationMatchScore(pub) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const researchKeywords = [
    'immunotherapy', 'chemotherapy', 'targeted therapy', 'biomarkers',
    'clinical outcomes', 'survival rates', 'side effects', 'quality of life',
    'drug resistance', 'personalized medicine', 'genetic testing',
    'combination therapy', 'early detection', 'prognosis', 'metastasis'
  ];

  const generateAISummary = (pub: Publication) => {
    const title = pub.title.toLowerCase();
    const abstract = pub.abstract?.toLowerCase() || '';
    
    if (title.includes('meta-analysis') || title.includes('systematic review')) {
      return `📊 **Study Type**: This is a comprehensive review that analyzes multiple studies together. **Key Insight**: Provides high-level evidence by combining results from many research papers. **Why It Matters**: Offers the most reliable conclusions about what treatments work best. **For Patients**: This type of study provides strong evidence to guide treatment decisions.`;
    }
    
    if (title.includes('clinical trial') || title.includes('randomized')) {
      return `🧪 **Study Type**: This is a clinical trial that tested treatments in real patients. **Key Insight**: Compares new treatments to existing ones to see which works better. **Why It Matters**: Provides direct evidence about treatment effectiveness and safety. **For Patients**: Results from trials like this directly inform treatment guidelines.`;
    }
    
    if (title.includes('biomarker') || title.includes('genetic')) {
      return `🧬 **Study Type**: This research focuses on genetic or biological markers in ${profile.condition}. **Key Insight**: Identifies specific characteristics that can predict treatment response. **Why It Matters**: Helps doctors choose the right treatment for each patient. **For Patients**: May lead to more personalized, effective treatments.`;
    }
    
    if (title.includes('survival') || title.includes('outcome')) {
      return `📈 **Study Type**: This research examines patient outcomes and survival rates. **Key Insight**: Analyzes how different factors affect patient prognosis and quality of life. **Why It Matters**: Helps predict treatment success and plan care strategies. **For Patients**: Provides realistic expectations about treatment outcomes.`;
    }
    
    if (title.includes('immunotherapy') || abstract.includes('immunotherapy')) {
      return `🛡️ **Study Type**: This research focuses on immunotherapy treatments. **Key Insight**: Studies how to harness the immune system to fight ${profile.condition}. **Why It Matters**: Immunotherapy can provide long-lasting responses with fewer side effects. **For Patients**: May offer new hope, especially for advanced cases.`;
    }
    
    return `📚 **Study Type**: This is scientific research about ${profile.condition}. **Key Insight**: Advances our understanding of the condition and potential treatments. **Why It Matters**: Contributes to the growing knowledge that leads to better treatments. **For Patients**: While not immediately applicable, this research builds the foundation for future breakthroughs.`;
  };

  const getFullPaperLink = (pub: Publication) => {
    if (pub.pmid) {
      return `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`;
    }
    if (pub.doi) {
      return `https://doi.org/${pub.doi}`;
    }
    // Fallback to PubMed search
    const searchQuery = encodeURIComponent(`${pub.title} ${pub.authors[0]}`);
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${searchQuery}`;
  };

  const getJournalLink = (journal: string) => {
    // Decode HTML entities
    const decodedJournal = journal.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    
    const journalMap: {[key: string]: string} = {
      'nature': 'https://www.nature.com',
      'nature medicine': 'https://www.nature.com/nm',
      'science': 'https://www.science.org',
      'nejm': 'https://www.nejm.org',
      'new england journal': 'https://www.nejm.org',
      'lancet': 'https://www.thelancet.com',
      'jama': 'https://jamanetwork.com',
      'journal of the american medical': 'https://jamanetwork.com',
      'cell': 'https://www.cell.com',
      'journal of clinical oncology': 'https://ascopubs.org/journal/jco',
      'jco': 'https://ascopubs.org/journal/jco',
      'bmj': 'https://www.bmj.com',
      'british medical journal': 'https://www.bmj.com',
      'annals of internal medicine': 'https://www.acpjournals.org/journal/aim',
      'annals internal': 'https://www.acpjournals.org/journal/aim',
      'plos': 'https://plos.org',
      'cancer research': 'https://aacrjournals.org/cancerres',
      'clinical cancer research': 'https://aacrjournals.org/clincancerres',
      'blood': 'https://ashpublications.org/blood',
      'journal of immunology': 'https://www.jimmunol.org',
      'acs': 'https://pubs.acs.org',
      'acs biomaterials': 'https://pubs.acs.org/journal/abseba',
      'biomaterials': 'https://www.journals.elsevier.com/biomaterials',
      'proceedings of the national academy': 'https://www.pnas.org',
      'pnas': 'https://www.pnas.org',
      'journal of biological chemistry': 'https://www.jbc.org',
      'molecular cell': 'https://www.cell.com/molecular-cell',
      'cancer cell': 'https://www.cell.com/cancer-cell',
      'immunity': 'https://www.cell.com/immunity'
    };
    
    const journalKey = decodedJournal.toLowerCase();
    for (const [key, url] of Object.entries(journalMap)) {
      if (journalKey.includes(key)) {
        return url;
      }
    }
    
    // Fallback to Google Scholar search
    return `https://scholar.google.com/scholar?q=journal:"${encodeURIComponent(journal)}"`;
  };

  const getAlternativeLinks = (pub: Publication) => {
    const title = encodeURIComponent(pub.title);
    const authors = encodeURIComponent(pub.authors[0] || '');
    const searchQuery = encodeURIComponent(`${pub.title} ${pub.authors[0]}`);
    
    return {
      googleScholar: `https://scholar.google.com/scholar?q=${title}`,
      pubmed: `https://pubmed.ncbi.nlm.nih.gov/?term=${searchQuery}`,
      clinicalTrials: `https://clinicaltrials.gov/search?term=${title}`,
      orcid: `https://orcid.org/orcid-search/search?searchQuery=${authors}`,
      researchGate: `https://www.researchgate.net/search/publication?q=${title}`
    };
  };

  if (loading) return <div className="text-center py-8">Loading publications...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Research Publications</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Live data from PubMed API</span>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={`Search (auto-includes ${profile.condition}): e.g., "stem cell therapy", "diet", "immunotherapy"`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            />
            {searchTerm.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {researchKeywords
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Filter by journal (e.g., Nature, NEJM)"
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Filter by year (e.g., 2024, 2023)"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <p className="text-xs text-indigo-600 mt-2">💡 Search automatically includes your condition ({profile.condition}). Try: "stem cell therapy", "diet", "immunotherapy"</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredPublications.map((pub) => (
          <div key={pub.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{pub.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    (pub as any).matchScore >= 80 ? 'bg-green-100 text-green-800' :
                    (pub as any).matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(pub as any).matchScore}% match
                  </span>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                📄 Research Paper
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <a 
                href={getJournalLink(pub.journal)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                {pub.journal} ↗
              </a>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{pub.date}</span>
              {pub.pmid && (
                <>
                  <span className="text-sm text-gray-500">•</span>
                  <a 
                    href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    PMID: {pub.pmid} ↗
                  </a>
                </>
              )}
              {pub.doi && !pub.pmid && (
                <>
                  <span className="text-sm text-gray-500">•</span>
                  <a 
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    DOI: {pub.doi} ↗
                  </a>
                </>
              )}
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              <strong>Authors:</strong> {(pub.authors || []).join(', ')}
            </p>
            
            {pub.abstract && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  <strong>Abstract:</strong> {pub.abstract}
                </p>
              </div>
            )}
            
            {showAISummary[pub.id] && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-400">
                <div className="flex items-center mb-3">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">🤖 AI Summary</span>
                  <span className="text-xs text-green-600">Patient-friendly explanation</span>
                </div>
                <div className="text-sm text-green-900 whitespace-pre-line leading-relaxed">
                  {generateAISummary(pub)}
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700">
                    💡 <strong>Note:</strong> This is a simplified explanation. Discuss findings with your healthcare team.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="flex flex-wrap gap-2">
                <a 
                  href={getFullPaperLink(pub)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-1"
                >
                  📖 Read Full Paper ↗
                </a>
                
                <button 
                  onClick={() => setShowAISummary(prev => ({...prev, [pub.id]: !prev[pub.id]}))}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  {showAISummary[pub.id] ? 'Hide Summary' : '🤖 AI Summary'}
                </button>
                
                <button
                  onClick={() => toggleFavorite(pub.id)}
                  className={`px-3 py-2 text-sm rounded ${
                    favorites.includes(pub.id)
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {favorites.includes(pub.id) ? '⭐ Saved' : '⭐ Save'}
                </button>
              </div>
              
              {/* Alternative Resources */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">🔍 Find this paper on other platforms:</p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={getAlternativeLinks(pub).googleScholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 flex items-center gap-1"
                  >
                    🎓 Google Scholar ↗
                  </a>
                  
                  <a 
                    href={getAlternativeLinks(pub).pubmed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 flex items-center gap-1"
                  >
                    🧬 PubMed ↗
                  </a>
                  
                  <a 
                    href={getAlternativeLinks(pub).clinicalTrials}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded hover:bg-purple-200 flex items-center gap-1"
                  >
                    🧪 ClinicalTrials.gov ↗
                  </a>
                  
                  <a 
                    href={getAlternativeLinks(pub).orcid}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded hover:bg-orange-200 flex items-center gap-1"
                  >
                    🆔 ORCID ↗
                  </a>
                  
                  <a 
                    href={getAlternativeLinks(pub).researchGate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded hover:bg-teal-200 flex items-center gap-1"
                  >
                    🔬 ResearchGate ↗
                  </a>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Tip:</strong> Try multiple sources if one link doesn't work. Some papers may be freely available on certain platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPublications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No publications found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}