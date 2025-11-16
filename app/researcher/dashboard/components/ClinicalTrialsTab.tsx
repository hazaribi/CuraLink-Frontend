'use client';

import { useState, useEffect } from 'react';

interface ClinicalTrial {
  id: number;
  title: string;
  phase: string;
  status: string;
  description: string;
  eligibility: string;
  participants: number;
  maxParticipants: number;
  location: string;
  startDate: string;
  endDate: string;
  aiSummary?: string;
}

interface ClinicalTrialsTabProps {
  onSaveTrial?: (trial: ClinicalTrial) => void;
  isFavorited?: (id: number) => boolean;
  onRemoveTrial?: (id: number) => void;
}

export default function ClinicalTrialsTab({ onSaveTrial, isFavorited, onRemoveTrial }: ClinicalTrialsTabProps) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [apiTrials, setApiTrials] = useState<any[]>([]);
  
  // Load trials from API on component mount
  useEffect(() => {
    const loadTrials = async () => {
      try {
        const { apiService } = await import('@/lib/api');
        const response = await apiService.getClinicalTrials();
        const apiTrialsData = response.trials || [];
        
        // Convert API trials to component format
        const convertedTrials = apiTrialsData.map((trial: any) => ({
          id: trial.id,
          title: trial.title,
          phase: trial.phase,
          status: trial.status,
          description: trial.description || 'Clinical trial description',
          eligibility: 'Standard eligibility criteria apply',
          participants: Math.floor(Math.random() * 50) + 10,
          maxParticipants: Math.floor(Math.random() * 50) + 60,
          location: trial.location,
          startDate: '2024-01-15',
          endDate: '2025-12-15',
          aiSummary: `AI Summary: ${trial.title} - ${trial.description}`
        }));
        
        setApiTrials(convertedTrials);
      } catch (error) {
        console.warn('Clinical trials API failed, using local data');
      }
    };
    
    loadTrials();
  }, []);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [showAnalytics, setShowAnalytics] = useState<number | null>(null);
  const [showParticipants, setShowParticipants] = useState<number | null>(null);
  const [editingTrial, setEditingTrial] = useState<ClinicalTrial | null>(null);
  const [formData, setFormData] = useState<Partial<ClinicalTrial>>({});
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantForm, setParticipantForm] = useState<{ id?: number; name: string; age: string; condition: string; status: string }>({ name: '', age: '', condition: '', status: 'Active' });
  const [participants, setParticipants] = useState<any[]>([
    { id: 1, name: 'John Smith', age: 45, condition: 'Lung Cancer Stage III', status: 'Active', enrolled: '2024-01-11' },
    { id: 2, name: 'Sarah Johnson', age: 52, condition: 'Lung Cancer Stage IV', status: 'Active', enrolled: '2024-01-12' },
    { id: 3, name: 'Michael Brown', age: 38, condition: 'Lung Cancer Stage III', status: 'Completed', enrolled: '2024-01-13' }
  ]);
  const [viewingParticipant, setViewingParticipant] = useState<any>(null);
  const [participantSearch, setParticipantSearch] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Manage Clinical Trials</h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          ➕ Add New Trial
        </button>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search trials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Recruiting">Recruiting</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          >
            <option value="">All Phases</option>
            <option value="Phase I">Phase I</option>
            <option value="Phase II">Phase II</option>
            <option value="Phase III">Phase III</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {[...trials, ...apiTrials].filter(trial => {
          const matchesSearch = !searchTerm || trial.title.toLowerCase().includes(searchTerm.toLowerCase()) || trial.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = !statusFilter || trial.status === statusFilter;
          const matchesPhase = !phaseFilter || trial.phase === phaseFilter;
          return matchesSearch && matchesStatus && matchesPhase;
        }).map((trial) => (
          <div key={trial.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">{trial.title}</h4>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{trial.phase}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{trial.status}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">📍 {trial.location}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingTrial(trial);
                  setFormData(trial);
                }}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                ✏️ Edit
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-3">{trial.description}</p>
            <div className="text-sm text-gray-600 mb-3">
              <p><strong>Eligibility:</strong> {trial.eligibility}</p>
              <p><strong>Duration:</strong> {trial.startDate} to {trial.endDate}</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Recruitment Progress</span>
                <span className="text-sm text-gray-600">{trial.participants}/{trial.maxParticipants} participants</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((trial.participants / trial.maxParticipants) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">Participants:</label>
                  <input
                    type="number"
                    value={trial.participants}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value) || 0;
                      setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, participants: newCount } : t));
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900"
                    min="0"
                    max={trial.maxParticipants}
                  />
                  <span className="text-gray-500">/ {trial.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">Status:</label>
                  <select
                    value={trial.status}
                    onChange={(e) => {
                      setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, status: e.target.value } : t));
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Recruiting">Recruiting</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {trial.aiSummary && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm">🤖</span>
                  <div>
                    <p className="text-xs text-blue-800 font-medium mb-1">AI-Generated Summary:</p>
                    <p className="text-sm text-blue-900">{trial.aiSummary}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setShowAnalytics(trial.id)}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                📊 View Analytics
              </button>
              <button 
                onClick={() => setShowParticipants(trial.id)}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200"
              >
                👥 Manage Participants
              </button>
              <button 
                onClick={() => alert(`Trial data exported: ${trial.title}`)}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
              >
                📋 Export Data
              </button>
              {onSaveTrial && (
                <button 
                  onClick={() => {
                    if (isFavorited && isFavorited(trial.id)) {
                      onRemoveTrial && onRemoveTrial(trial.id);
                    } else {
                      onSaveTrial(trial);
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    isFavorited && isFavorited(trial.id)
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isFavorited && isFavorited(trial.id) ? '⭐ Saved' : '⭐ Save'}
                </button>
              )}
            </div>
          </div>
        ))}

        {[...trials, ...apiTrials].length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔬</span>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Clinical Trials</h4>
            <p className="text-gray-600 mb-4">Create your first clinical trial to get started</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              ➕ Create New Trial
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingTrial) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingTrial ? 'Edit Trial' : 'Add New Trial'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTrial) {
                setTrials(prev => prev.map(t => t.id === editingTrial.id ? { ...editingTrial, ...formData } : t));
                setEditingTrial(null);
              } else {
                const newTrial: ClinicalTrial = {
                  id: Date.now(),
                  title: formData.title || '',
                  phase: formData.phase || 'Phase I',
                  status: formData.status || 'Planning',
                  description: formData.description || '',
                  eligibility: formData.eligibility || '',
                  participants: formData.participants || 0,
                  maxParticipants: formData.maxParticipants || 0,
                  location: formData.location || '',
                  startDate: formData.startDate || '',
                  endDate: formData.endDate || ''
                };
                setTrials(prev => [...prev, newTrial]);
              }
              setFormData({});
              setShowAddForm(false);
            }} className="space-y-4">
              <input
                type="text"
                placeholder="Trial Title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.phase || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phase: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                >
                  <option value="">Select Phase</option>
                  <option value="Phase I">Phase I</option>
                  <option value="Phase II">Phase II</option>
                  <option value="Phase III">Phase III</option>
                </select>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Planning">Planning</option>
                  <option value="Recruiting">Recruiting</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                rows={3}
                required
              />
              <textarea
                placeholder="Eligibility Criteria"
                value={formData.eligibility || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                rows={2}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                required
              />
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="Current Participants"
                  value={formData.participants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max Participants"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  min="1"
                  required
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  {editingTrial ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTrial(null);
                    setFormData({});
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trial Analytics</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 p-4 rounded">
                <h4 className="font-medium text-purple-800">Enrollment Rate</h4>
                <p className="text-2xl font-bold text-purple-600">85%</p>
                <p className="text-sm text-purple-700">Target: 90%</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h4 className="font-medium text-green-800">Retention Rate</h4>
                <p className="text-2xl font-bold text-green-600">92%</p>
                <p className="text-sm text-green-700">Above average</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-800">Adverse Events</h4>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-sm text-blue-700">All Grade 1-2</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <h4 className="font-medium text-orange-800">Data Quality</h4>
                <p className="text-2xl font-bold text-orange-600">98%</p>
                <p className="text-sm text-orange-700">Excellent</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAnalytics(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Participants</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search participants..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
            
            <div className="space-y-3 mb-4">
              {participants.filter(p => 
                !participantSearch || 
                p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                p.condition.toLowerCase().includes(participantSearch.toLowerCase())
              ).map(participant => (
                <div key={participant.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-gray-600">Age: {participant.age} • Enrolled: {participant.enrolled} • Status: {participant.status}</p>
                    <p className="text-xs text-gray-500">{participant.condition}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingParticipant(participant)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => {
                        setParticipantForm(participant);
                        setShowAddParticipant(true);
                      }}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => alert(`Contact ${participant.name}: Email sent successfully`)}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                    >
                      Contact
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Remove ${participant.name} from trial?`)) {
                          setParticipants(prev => prev.filter(p => p.id !== participant.id));
                        }
                      }}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setParticipantForm({ name: '', age: '', condition: '', status: 'Active' });
                  setShowAddParticipant(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Participant
              </button>
              <button 
                onClick={() => setShowParticipants(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {participantForm.name ? 'Edit Participant' : 'Add New Participant'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (participantForm.name && participantForm.age) {
                if (participantForm.id) {
                  setParticipants(prev => prev.map(p => p.id === participantForm.id ? participantForm : p));
                } else {
                  const newParticipant = {
                    ...participantForm,
                    id: Date.now(),
                    enrolled: new Date().toISOString().split('T')[0]
                  };
                  setParticipants(prev => [...prev, newParticipant]);
                }
                setShowAddParticipant(false);
                setParticipantForm({ name: '', age: '', condition: '', status: 'Active' });
              }
            }} className="space-y-3">
              <input
                type="text"
                placeholder="Participant Name"
                value={participantForm.name}
                onChange={(e) => setParticipantForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={participantForm.age}
                onChange={(e) => setParticipantForm(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
                required
              />
              <input
                type="text"
                placeholder="Medical Condition"
                value={participantForm.condition}
                onChange={(e) => setParticipantForm(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
                required
              />
              <select
                value={participantForm.status}
                onChange={(e) => setParticipantForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Screening">Screening</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  {participantForm.id ? 'Update' : 'Add'} Participant
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddParticipant(false);
                    setParticipantForm({ name: '', age: '', condition: '', status: 'Active' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Participant Details Modal */}
      {viewingParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Participant Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name:</label>
                <p className="text-gray-800">{viewingParticipant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Age:</label>
                <p className="text-gray-800">{viewingParticipant.age} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Condition:</label>
                <p className="text-gray-800">{viewingParticipant.condition}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status:</label>
                <p className="text-gray-800">{viewingParticipant.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Enrolled:</label>
                <p className="text-gray-800">{viewingParticipant.enrolled}</p>
              </div>
            </div>
            <button 
              onClick={() => setViewingParticipant(null)}
              className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}