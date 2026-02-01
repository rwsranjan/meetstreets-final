// app/events/[eventId]/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import { 
  Calendar, MapPin, Users, Coins, Clock, User, 
  Check, AlertCircle, Share2, Navigation, X 
} from 'lucide-react';

export default function EventDetails() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const currentUserId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')._id : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadEvent();
  }, [params.eventId]);

  const loadEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${params.eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: params.eventId })
      });
      
      if (res.ok) {
        alert('Successfully joined the event!');
        loadEvent();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to join event');
      }
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this event?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/leave', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: params.eventId })
      });
      
      if (res.ok) {
        alert('You have left the event');
        loadEvent();
      }
    } catch (error) {
      console.error('Failed to leave event:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
         <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
            <button onClick={() => router.back()} className="text-orange-400 hover:text-orange-300">
              Go back
            </button>
          </div>
        </div>
       </div>
    );
  }

  const isOrganizer = event.organizer?._id === currentUserId;
  const isParticipant = event.participants?.some(p => p._id === currentUserId);
  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.participants.length : null;
  const isFull = spotsLeft === 0;
  const isPast = new Date(event.eventDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
            <div className="h-64 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center relative">
              <Calendar className="w-32 h-32 text-white opacity-30" />
              {isFull && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-full">
                  EVENT FULL
                </div>
              )}
              {isPast && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-full">
                  EVENT ENDED
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full capitalize">
                      {event.eventType}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {event.title}
                  </h1>
                  <p className="text-gray-400">
                    Organized by {isOrganizer ? 'You' : event.organizer?.profileName}
                  </p>
                </div>
                <button className="p-3 hover:bg-gray-800 rounded-lg transition-colors">
                  <Share2 size={20} className="text-gray-400" />
                </button>
              </div>

              {event.entryCoins > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg w-fit mb-6">
                  <Coins className="text-orange-400" size={20} />
                  <span className="text-orange-400 font-semibold">
                    {event.entryCoins} coins entry fee
                  </span>
                </div>
              )}

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                  <Calendar className="text-orange-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Date</div>
                    <div className="text-white font-medium">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                  <Clock className="text-orange-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Time</div>
                    <div className="text-white font-medium">
                      {new Date(event.eventDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {event.duration && (
                      <div className="text-sm text-gray-400 mt-1">
                        Duration: {event.duration} min
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
                  <Users className="text-orange-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Participants</div>
                    <div className="text-white font-medium">
                      {event.participants?.length || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </div>
                    {spotsLeft !== null && spotsLeft > 0 && (
                      <div className="text-sm text-orange-400 mt-1">
                        {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg mb-6">
                <MapPin className="text-orange-400 mt-1" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">Location</div>
                  <div className="text-white font-medium">
                    {event.location?.address || event.location?.city || 'Location TBD'}
                  </div>
                  {event.location?.city && (
                    <div className="text-sm text-gray-400 mt-1">
                      {event.location.locality}, {event.location.city}
                    </div>
                  )}
                  {event.location?.coordinates && (
                    <button className="mt-2 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300">
                      <Navigation size={14} />
                      Get Directions
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-3">About this event</h2>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!isPast && (
                <div className="pt-6 border-t border-gray-800">
                  {isOrganizer ? (
                    <div className="text-center py-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 font-semibold">You are the organizer of this event</p>
                    </div>
                  ) : isParticipant ? (
                    <div className="flex gap-3">
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg font-semibold">
                        <Check size={20} />
                        You're attending this event
                      </div>
                      <button
                        onClick={handleLeave}
                        className="px-6 py-3 border border-red-500 text-red-400 hover:bg-red-500/10 rounded-lg font-semibold transition-colors"
                      >
                        Leave Event
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={joining || isFull}
                      className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {joining ? 'Joining...' : isFull ? 'Event Full' : 'Join Event'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Participants ({event.participants?.length || 0})
            </h2>
            
            {event.participants?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No participants yet. Be the first to join!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.participants?.map((participant) => (
                  <div key={participant._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {participant.profilePictures?.[0] ? (
                        <img 
                          src={participant.profilePictures[0].url} 
                          alt={participant.profileName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        participant.profileName?.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {participant.profileName}
                        {participant._id === event.organizer?._id && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            Organizer
                          </span>
                        )}
                        {participant._id === currentUserId && (
                          <span className="ml-2 text-gray-400 text-sm">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{participant.address?.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

     </div>
  );
}