// app/meetings/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
 import { Calendar, MapPin, Clock, Coins, User, Filter, Plus } from 'lucide-react';

export default function Meetings() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meeting/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['proposed', 'accepted'].includes(meeting.status);
    if (filter === 'completed') return meeting.status === 'completed';
    if (filter === 'cancelled') return meeting.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'proposed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Meetings</h1>
              <p className="text-gray-400">Manage your meetups and get-togethers</p>
            </div>
            <Link
              href="/matches"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg"
            >
              <Plus size={20} />
              Propose Meeting
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Meetings' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === tab.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Meetings List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No meetings found</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'Start connecting with people to schedule meetups!' 
                  : `No ${filter} meetings at the moment`}
              </p>
              <Link href="/matches" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all">
                View Matches
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMeetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} getStatusColor={getStatusColor} />
              ))}
            </div>
          )}
        </div>
      </main>

     </div>
  );
}

function MeetingCard({ meeting, getStatusColor }) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/meetings/${meeting._id}`)}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg capitalize">
              {meeting.meetingType?.replace('-', ' ')}
            </h3>
            <p className="text-sm text-gray-400">
              {meeting.participants?.length} participant{meeting.participants?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={16} />
          <span className="text-sm">
            {meeting.scheduledDate ? new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }) : 'Date TBD'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} />
          <span className="text-sm">
            {meeting.scheduledDate ? new Date(meeting.scheduledDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Time TBD'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <MapPin size={16} />
          <span className="text-sm truncate">
            {meeting.location?.name || meeting.location?.city || 'Location TBD'}
          </span>
        </div>
      </div>

      {meeting.coinsOffered > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-orange-400">
            <Coins size={16} />
            <span className="text-sm font-semibold">{meeting.coinsOffered} coins reward</span>
          </div>
        </div>
      )}
    </div>
  );
}