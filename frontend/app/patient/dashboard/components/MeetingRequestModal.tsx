'use client';

import { useState } from 'react';

interface HealthExpert {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  available_for_meetings: boolean;
}

interface MeetingRequestModalProps {
  expert: HealthExpert;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

export default function MeetingRequestModal({ expert, isOpen, onClose, onSubmit }: MeetingRequestModalProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    meetingType: 'video',
    message: '',
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expertId: expert.id,
      expertName: expert.name,
      requestedAt: new Date().toISOString()
    });
    onClose();
    setFormData({
      patientName: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      meetingType: 'video',
      message: '',
      urgency: 'normal'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Request Meeting</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className={`mb-4 p-3 rounded-lg ${
            expert.available_for_meetings ? 'bg-blue-50' : 'bg-orange-50'
          }`}>
            <p className="text-sm text-gray-700">
              <strong>{expert.name}</strong><br/>
              {expert.specialty} • {expert.institution}
            </p>
            {!expert.available_for_meetings && (
              <p className="text-xs text-orange-700 mt-2">
                ⚠️ This expert is not active on our platform. Your request will be forwarded to admin.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="">Select time</option>
                  <option value="morning">Morning (9-12 PM)</option>
                  <option value="afternoon">Afternoon (12-5 PM)</option>
                  <option value="evening">Evening (5-8 PM)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="asap">ASAP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message {!expert.available_for_meetings && '(Will be sent to admin)'}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                placeholder={expert.available_for_meetings 
                  ? "Please Describe Your Condition And What You'd Like To Discuss..."
                  : "Describe Why You'd Like To Connect With This Expert. We'll Reach Out To Them And Invite Them To Join Our Platform."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {!expert.available_for_meetings && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>What happens next:</strong><br/>
                  1. We'll forward your request to our admin team<br/>
                  2. Admin will reach out to {expert.name} with an invitation to join<br/>
                  3. We'll send them your meeting request<br/>
                  4. You'll be notified once they respond
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  expert.available_for_meetings 
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {expert.available_for_meetings ? 'Send Request' : 'Send to Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}