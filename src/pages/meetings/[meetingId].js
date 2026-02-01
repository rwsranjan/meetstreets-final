// app/meetings/[meetingId]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { 
  Calendar, MapPin, Clock, Coins, User, Check, X, 
  MessageCircle, Phone, Navigation, Star, AlertCircle 
} from 'lucide-react';

export default function MeetingDetails() {
  const router = useRouter();
  const params = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')._id : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadMeeting();
  }, [params.meetingId]);

  const loadMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/meeting/${params.meetingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMeeting(data.meeting);
      }
    } catch (error) {
      console.error('Failed to load meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (action) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/meeting/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meetingId: params.meetingId,
          action
        })
      });
      
      if (res.ok) {
        loadMeeting();
      }
    } catch (error) {
      console.error('Failed to respond:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (rating) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/meeting/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meetingId: params.meetingId,
          rating
        })
      });
      
      if (res.ok) {
        alert('Meeting completed! Coins have been awarded.');
        loadMeeting();
      }
    } catch (error) {
      console.error('Failed to complete meeting:', error);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/meeting/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId: params.meetingId })
      });
      
      if (res.ok) {
        alert('Meeting cancelled');
        router.push('/meetings');
      }
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
         <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Meeting not found</h2>
            <button onClick={() => router.back()} className="text-orange-400 hover:text-orange-300">
              Go back
            </button>
          </div>
        </div>
       </div>
    );
  }

  const isOrganizer = meeting.organizer?._id === currentUserId;
  const isPending = meeting.status === 'proposed';
  const isAccepted = meeting.status === 'accepted';
  const isCompleted = meeting.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-lg border ${
            meeting.status === 'proposed' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
            meeting.status === 'accepted' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            meeting.status === 'completed' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {meeting.status === 'proposed' && <Clock size={20} />}
              {meeting.status === 'accepted' && <Check size={20} />}
              {meeting.status === 'completed' && <Star size={20} />}
              {meeting.status === 'cancelled' && <X size={20} />}
              <span className="font-semibold capitalize">
                {meeting.status === 'proposed' && 'Meeting Pending Confirmation'}
                {meeting.status === 'accepted' && 'Meeting Confirmed'}
                {meeting.status === 'completed' && 'Meeting Completed'}
                {meeting.status === 'cancelled' && 'Meeting Cancelled'}
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-b border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                  {meeting.meetingType?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize">
                    {meeting.meetingType?.replace('-', ' ')}
                  </h1>
                  <p className="text-gray-400">
                    Organized by {isOrganizer ? 'You' : meeting.organizer?.profileName}
                  </p>
                </div>
              </div>

              {meeting.coinsOffered > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg w-fit">
                  <Coins className="text-orange-400" size={20} />
                  <span className="text-orange-400 font-semibold">
                    {meeting.coinsOffered} coins reward
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                  <Calendar className="text-orange-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Date</div>
                    <div className="text-white font-medium">
                      {meeting.scheduledDate 
                        ? new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'To be decided'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                  <Clock className="text-orange-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Time</div>
                    <div className="text-white font-medium">
                      {meeting.scheduledDate 
                        ? new Date(meeting.scheduledDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'To be decided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                <MapPin className="text-orange-400 mt-1" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">Location</div>
                  <div className="text-white font-medium">
                    {meeting.location?.name || meeting.location?.address || 'Location to be decided'}
                  </div>
                  {meeting.location?.city && (
                    <div className="text-sm text-gray-400 mt-1">
                      {meeting.location.city}, {meeting.location.state}
                    </div>
                  )}
                  {meeting.location?.coordinates && (
                    <button className="mt-2 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300">
                      <Navigation size={14} />
                      Get Directions
                    </button>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Participants ({meeting.participants?.length})
                </h3>
                <div className="space-y-3">
                  {meeting.participants?.map((participant) => (
                    <div key={participant._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                          {participant.profileName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {participant.profileName}
                            {participant._id === currentUserId && ' (You)'}
                            {participant._id === meeting.organizer?._id && ' (Organizer)'}
                          </div>
                          <div className="text-sm text-gray-400">{participant.address?.city}</div>
                        </div>
                      </div>
                      {participant._id !== currentUserId && (
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <MessageCircle size={18} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {meeting.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-400 leading-relaxed">{meeting.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-gray-800">
                {isPending && !isOrganizer && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond('accept')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <Check size={20} />
                      Accept Meeting
                    </button>
                    <button
                      onClick={() => handleRespond('decline')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      <X size={20} />
                      Decline
                    </button>
                  </div>
                )}

                {isAccepted && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const rating = prompt('Rate this meeting (1-5):');
                        if (rating && rating >= 1 && rating <= 5) {
                          handleComplete(parseInt(rating));
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-semibold transition-all"
                    >
                      <Star size={20} />
                      Mark as Completed
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500/10 rounded-lg font-semibold transition-colors"
                    >
                      Cancel Meeting
                    </button>
                  </div>
                )}

                {isPending && isOrganizer && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 border border-red-500 text-red-400 hover:bg-red-500/10 rounded-lg font-semibold transition-colors"
                    >
                      Cancel Meeting
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="text-center py-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Star className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-400 font-semibold">This meeting has been completed!</p>
                    {meeting.rating && (
                      <p className="text-gray-400 text-sm mt-2">Rating: {meeting.rating}/5</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

     </div>
  );
}