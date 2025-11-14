'use client';

import { useState, useEffect } from 'react';

interface AdminRequest {
  id: string;
  type: string;
  patient_name?: string;
  expert_name?: string;
  status: string;
  created_at: string;
  message?: string;
  urgency?: string;
  email?: string;
  patient_email?: string;
  phone?: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Save admin profile access
    const adminProfile = {
      lastAccessed: new Date().toISOString(),
      accessCount: (JSON.parse(localStorage.getItem('adminProfile') || '{}').accessCount || 0) + 1
    };
    localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
    
    loadAdminRequests();
  }, []);

  const loadAdminRequests = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/admin/requests`);
      const data = await response.json();
      console.log('Admin API response:', data);
      console.log('Requests array:', data.requests);
      
      // Apply saved status updates from localStorage
      const statusUpdates = JSON.parse(localStorage.getItem('adminRequestStatus') || '{}');
      const updatedRequests = (data.requests || []).map((req: AdminRequest) => ({
        ...req,
        status: statusUpdates[req.id] || req.status
      }));
      
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to load admin requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      setProcessingId(requestId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: newStatus }
          : req
      );
      setRequests(updatedRequests);
      
      // Persist to localStorage
      const statusUpdates = JSON.parse(localStorage.getItem('adminRequestStatus') || '{}');
      statusUpdates[requestId] = newStatus;
      localStorage.setItem('adminRequestStatus', JSON.stringify(statusUpdates));
      
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CuraLink Admin</h1>
              <p className="text-gray-600 mt-1">Manage external expert requests and platform oversight</p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              🛡️ Admin Access
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending_admin_review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Request Management</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending_admin_review', 'in_progress', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Requests' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Requests' : `${filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Requests`}
              <span className="ml-2 text-sm text-gray-500">({filteredRequests.length})</span>
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No requests match the current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.urgency && (
                          <span className={`text-sm font-medium ${
                            request.urgency === 'high' ? 'text-red-600' : 
                            request.urgency === 'normal' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {request.urgency.toUpperCase()} PRIORITY
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {request.type === 'external_expert_contact' 
                          ? `Patient Contact Request: ${request.expert_name}`
                          : `Missing Contact Info: ${request.expert_name}`
                        }
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {request.patient_name && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Patient:</span>
                            <p className="text-gray-900">{request.patient_name}</p>
                          </div>
                        )}
                        {(request.email || request.patient_email) && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Email:</span>
                            <p className="text-gray-900">{request.email || request.patient_email}</p>
                          </div>
                        )}
                      </div>

                      {request.message && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Message:</span>
                          <p className="text-gray-900 mt-1">{request.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {request.status === 'pending_admin_review' && (
                        <>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'in_progress')}
                            disabled={processingId === request.id}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 border border-blue-400"
                          >
                            {processingId === request.id ? '⏳' : '🔄'} Start Processing
                          </button>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                            disabled={processingId === request.id}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 border border-red-400"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      
                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                          disabled={processingId === request.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 border border-green-400"
                        >
                          {processingId === request.id ? '⏳' : '✅'} Mark Complete
                        </button>
                      )}

                      {(request.email || request.patient_email) && (
                        <button
                          onClick={() => {
                            const email = request.email || request.patient_email;
                            const subject = 'CuraLink Expert Connection Request';
                            const body = `Dear ${request.patient_name || 'Patient'},\n\nThank you for your request to connect with ${request.expert_name || 'the expert'}.\n\nWe are working on facilitating this connection and will get back to you within 24-48 hours.\n\nYour original message:\n"${request.message || 'No message provided'}"\n\nBest regards,\nCuraLink Admin Team`;
                            
                            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            
                            // Try to open email client
                            const link = document.createElement('a');
                            link.href = mailtoLink;
                            link.click();
                            
                            // Also copy email to clipboard as fallback
                            if (email) {
                              navigator.clipboard.writeText(email).then(() => {
                                alert(`Email client opened. If it didn't work, the email address (${email}) has been copied to your clipboard.`);
                              }).catch(() => {
                                alert(`Please email the patient at: ${email}`);
                              });
                            }
                          }}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 border border-indigo-400"
                        >
                          📧 Email Patient
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}