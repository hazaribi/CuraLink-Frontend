'use client';

import { useState, useEffect } from 'react';

interface MeetingRequest {
  id: number;
  patientName: string;
  email: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  meetingType: string;
  message?: string;
  urgency: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  requestedAt: string;
  respondedAt?: string;
}

export default function MeetingRequestsTab() {
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState('pending');

  useEffect(() => {
    loadMeetingRequests();
  }, []);

  const loadMeetingRequests = () => {
    const saved = localStorage.getItem('meetingRequests');
    if (saved) {
      setRequests(JSON.parse(saved));
    }
  };

  const updateRequestStatus = (requestId: number, status: 'approved' | 'declined') => {
    const updatedRequests = requests.map(request => 
      request.id === requestId 
        ? { ...request, status, respondedAt: new Date().toISOString() }
        : request
    );
    setRequests(updatedRequests);
    localStorage.setItem('meetingRequests', JSON.stringify(updatedRequests));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'asap': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredRequests = requests.filter(request => 
    activeFilter === 'all' ? true : request.status === activeFilter
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Meeting Requests</h3>
        <span className="text-sm text-gray-600">
          {requests.filter(r => r.status === 'pending').length} pending requests
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
          { id: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
          { id: 'declined', label: 'Declined', count: requests.filter(r => r.status === 'declined').length },
          { id: 'all', label: 'All', count: requests.length }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === filter.id
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">{request.patientName}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(request.requestedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span> {request.email}
              </div>
              {request.phone && (
                <div>
                  <span className="text-gray-600">Phone:</span> {request.phone}
                </div>
              )}
              {request.preferredDate && (
                <div>
                  <span className="text-gray-600">Preferred Date:</span> {request.preferredDate}
                </div>
              )}
              {request.preferredTime && (
                <div>
                  <span className="text-gray-600">Preferred Time:</span> {request.preferredTime}
                </div>
              )}
              <div>
                <span className="text-gray-600">Meeting Type:</span> {request.meetingType}
              </div>
            </div>

            {request.message && (
              <div className="mb-4">
                <span className="text-gray-600 text-sm">Message:</span>
                <p className="text-gray-700 text-sm mt-1 p-2 bg-gray-50 rounded">{request.message}</p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateRequestStatus(request.id, 'approved')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateRequestStatus(request.id, 'declined')}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            )}

            {request.status === 'approved' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const meetingLink = `https://meet.google.com/new`;
                    const subject = `Meeting with ${request.patientName}`;
                    const body = `Dear ${request.patientName},\n\nYour meeting request has been approved. Please join the meeting at the scheduled time:\n\nMeeting Link: ${meetingLink}\nDate: ${request.preferredDate || 'TBD'}\nTime: ${request.preferredTime || 'TBD'}\n\nBest regards`;
                    
                    // Open email client
                    window.open(`mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  📅 Schedule Meeting
                </button>
                <button 
                  onClick={() => {
                    const subject = `Regarding your meeting request`;
                    const body = `Dear ${request.patientName},\n\nThank you for your meeting request. I wanted to follow up regarding our upcoming consultation.\n\nPlease let me know if you have any questions or need to reschedule.\n\nBest regards`;
                    
                    // Open email client
                    window.open(`mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  📧 Contact Patient
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📅</span>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No meeting requests</h4>
            <p className="text-gray-600">
              {activeFilter === 'pending' 
                ? 'No pending meeting requests at the moment.'
                : `No ${activeFilter} meeting requests found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}