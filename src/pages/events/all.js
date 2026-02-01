// app/events/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { Calendar, MapPin, Users, Coins, Plus, Search, Filter } from 'lucide-react';

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/list', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || event.eventType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
              <p className="text-gray-400">Discover and join amazing events near you</p>
            </div>
            <Link
              href="/events/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg shadow-orange-600/30"
            >
              <Plus size={20} />
              Create Event
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Event Types</option>
              <option value="meetup">Meetup</option>
              <option value="coffee">Coffee</option>
              <option value="dinner">Dinner</option>
              <option value="movie">Movie</option>
              <option value="sports">Sports</option>
              <option value="outdoor">Outdoor</option>
              <option value="party">Party</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Be the first to create an event!'}
              </p>
              <Link href="/events/create" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all">
                Create Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>


    </div>
  );
}

function EventCard({ event }) {
  const router = useRouter();
  const spotsLeft = event.maxParticipants 
    ? event.maxParticipants - (event.participants?.length || 0)
    : null;
  const isFull = spotsLeft === 0;

  return (
    <div 
      onClick={() => router.push(`/events/${event._id}`)}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group"
    >
      {/* Event Image/Icon */}
      <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center relative">
        <Calendar className="w-20 h-20 text-white opacity-50" />
        {isFull && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            FULL
          </div>
        )}
        {event.entryCoins > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <Coins size={12} />
            {event.entryCoins}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full capitalize">
            {event.eventType}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">
          {event.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={14} />
            <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={14} />
            <span className="truncate">{event.location?.city || 'Online'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={14} />
              <span>
                {event.participants?.length || 0}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </span>
            </div>
            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
              <span className="text-xs text-orange-400 font-semibold">
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}