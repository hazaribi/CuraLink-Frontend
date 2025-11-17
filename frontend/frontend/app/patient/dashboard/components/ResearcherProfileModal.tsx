'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../../lib/api';

interface HealthExpert {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  location: string;
  available_for_meetings: boolean;
  research_interests: string[];
}

interface ResearcherProfileModalProps {
  expert: HealthExpert | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestMeeting: (expert: HealthExpert) => void;
}

export default function ResearcherProfileModal({ expert, isOpen, onClose, onRequestMeeting }: ResearcherProfileModalProps) {
  const [publications, setPublications] = useState<any[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [clinicalTrials, setClinicalTrials] = useState<any[]>([]);
  const [loadingTrials, setLoadingTrials] = useState(false);

  useEffect(() => {
    if (isOpen && expert) {
      loadPublications();
      loadClinicalTrials();
    }
  }, [isOpen, expert]);

  const loadPublications = async () => {
    if (!expert) return;
    setLoadingPubs(true);
    try {
      const response = await apiService.getPublications(expert.name, '');
      setPublications((response.publications || []).slice(0, 10)); // Show top 10
    } catch (error) {
      console.error('Error loading publications:', error);
      setPublications([]);
    } finally {
      setLoadingPubs(false);
    }
  };

  const loadClinicalTrials = async () => {
    if (!expert) return;
    setLoadingTrials(true);
    try {
      const response = await apiService.getClinicalTrials(expert.specialty, expert.location);
      setClinicalTrials((response.trials || []).slice(0, 8)); // Show top 8
    } catch (error) {
      console.error('Error loading clinical trials:', error);
      setClinicalTrials([]);
    } finally {
      setLoadingTrials(false);
    }
  };

  if (!isOpen || !expert) return null;

  const mockProfileData = {
    bio: `Dr. ${expert.name.split(' ').pop()} is a leading researcher in ${expert.specialty.toLowerCase()} with over 15 years of experience. They have published extensively in peer-reviewed journals and are actively involved in clinical research.`,
    education: [
      'MD - Harvard Medical School',
      'PhD in Biomedical Sciences - MIT',
      'Residency - Johns Hopkins Hospital'
    ],

    awards: [
      'Excellence in Research Award (2023)',
      'Young Investigator Award (2021)',
      'Best Publication Award (2020)'
    ],
    contact: {
      email: `${expert.name.toLowerCase().replace(/\s+/g, '.')}@${expert.institution.toLowerCase().replace(/\s+/g, '')}.edu`,
      phone: '+1 (555) 123-4567',
      office: 'Room 405, Medical Research Building'
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 mr-2 sm:mr-4 p-1 sm:p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors flex-shrink-0"
                title="Back to search"
              >
                ← Back
              </button>
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2 sm:mr-4 flex-shrink-0">
                <span className="text-lg sm:text-2xl font-bold">
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold truncate">{expert.name}</h2>
                <p className="text-indigo-100 text-sm sm:text-base truncate">{expert.specialty}</p>
                <p className="text-indigo-200 text-xs sm:text-sm truncate">{expert.institution}</p>
                <p className="text-indigo-200 text-xs sm:text-sm truncate">📍 {expert.location}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl sm:text-2xl flex-shrink-0 ml-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{mockProfileData.bio}</p>
              </div>

              {/* Research Interests */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Research Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.research_interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Publications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Publications</h3>
                {loadingPubs ? (
                  <div className="text-center py-4 text-gray-500">Loading publications...</div>
                ) : publications.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {publications.map((pub, index) => (
                      <div key={index} className="border-l-4 border-indigo-200 pl-4 py-2">
                        <h4 className="font-medium text-gray-800 text-sm mb-1">{pub.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-indigo-600 font-medium">{pub.journal}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{pub.date}</span>
                        </div>
                        <div className="flex gap-2">
                          {pub.pmid && (
                            <a 
                              href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              PubMed ↗
                            </a>
                          )}
                          {pub.doi && (
                            <a 
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                            >
                              DOI ↗
                            </a>
                          )}
                          <a 
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            Scholar ↗
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No publications found for this researcher.</p>
                    <p className="text-xs mt-1">Publications may be available on external platforms.</p>
                  </div>
                )}
              </div>

              {/* Active Clinical Trials */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Clinical Trials of Interest</h3>
                {loadingTrials ? (
                  <div className="text-center py-4 text-gray-500">Loading clinical trials...</div>
                ) : clinicalTrials.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clinicalTrials.map((trial, index) => (
                      <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                        <h4 className="font-medium text-gray-800 text-sm mb-1">{trial.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            trial.phase === 'Phase III' ? 'bg-blue-100 text-blue-800' :
                            trial.phase === 'Phase II' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trial.phase}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            trial.status === 'Recruiting' ? 'bg-green-100 text-green-800' :
                            trial.status === 'Active' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trial.status}
                          </span>
                          <span className="text-xs text-gray-500">📍 {trial.location}</span>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={`https://clinicaltrials.gov/study/NCT${trial.id.toString().padStart(8, '0')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded hover:bg-indigo-200"
                          >
                            ClinicalTrials.gov ↗
                          </a>
                          <button
                            onClick={() => {
                              const subject = `Inquiry about Clinical Trial: ${trial.title}`;
                              const body = `I'm interested in learning more about this clinical trial that Dr. ${expert.name} is associated with.`;
                              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            }}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Contact About Trial
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No clinical trials found for this researcher's specialty.</p>
                    <p className="text-xs mt-1">Check ClinicalTrials.gov for more information.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Availability</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-3 h-3 rounded-full ${expert.available_for_meetings ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-sm text-gray-600">
                    {expert.available_for_meetings ? 'Available for meetings' : 'Not currently available'}
                  </span>
                </div>
                <button
                  onClick={() => onRequestMeeting(expert)}
                  className={`w-full py-2 px-4 rounded text-sm font-medium ${
                    expert.available_for_meetings 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {expert.available_for_meetings ? 'Request Meeting' : 'Contact via Admin'}
                </button>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📧</span>
                    <span className="text-gray-600">{mockProfileData.contact.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📞</span>
                    <span className="text-gray-600">{mockProfileData.contact.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">🏢</span>
                    <span className="text-gray-600">{mockProfileData.contact.office}</span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Education</h4>
                <ul className="space-y-1 text-sm">
                  {mockProfileData.education.map((edu, index) => (
                    <li key={index} className="text-gray-600">{edu}</li>
                  ))}
                </ul>
              </div>

              {/* Awards */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Awards & Recognition</h4>
                <ul className="space-y-1 text-sm">
                  {mockProfileData.awards.map((award, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">🏆</span>
                      <span className="text-gray-600">{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            Profile last updated: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={() => onRequestMeeting(expert)}
              className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-indigo-700 text-sm flex-1 sm:flex-none"
            >
              Request Meeting
            </button>
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded hover:bg-gray-50 text-sm flex-1 sm:flex-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}