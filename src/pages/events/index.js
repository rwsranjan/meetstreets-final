"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 import { Calendar, MapPin, Users, Coins, Clock, Image as ImageIcon } from 'lucide-react';

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'meetup',
    eventDate: '',
    eventTime: '',
    duration: 60,
    city: '',
    locality: '',
    address: '',
    maxParticipants: '',
    entryCoins: 0,
    isPrivate: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          location: {
            city: formData.city,
            locality: formData.locality,
            address: formData.address
          }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert('Event created successfully!');
        router.push(`/events/${data.event._id}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
            <p className="text-gray-400">Organize a meetup and invite people to join</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Weekend Coffee Meetup"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell people what this event is about..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="meetup">Meetup</option>
                <option value="coffee">Coffee</option>
                <option value="dinner">Dinner</option>
                <option value="movie">Movie</option>
                <option value="sports">Sports</option>
                <option value="outdoor">Outdoor Activity</option>
                <option value="party">Party</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  required
                  value={formData.eventDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  name="eventTime"
                  required
                  value={formData.eventTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                step="15"
                placeholder="60"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-medium">
                <MapPin size={18} />
                <span>Location</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City *"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="locality"
                  required
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Locality *"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address (optional)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Participants & Entry Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="2"
                  placeholder="Unlimited"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Coins className="inline w-4 h-4 mr-1" />
                  Entry Coins
                </label>
                <input
                  type="number"
                  name="entryCoins"
                  value={formData.entryCoins}
                  onChange={handleChange}
                  min="0"
                  placeholder="0 (Free)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
              <input
                type="checkbox"
                name="isPrivate"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="isPrivate" className="text-gray-300">
                Make this event private (only invited people can see and join)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-600/30"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </main>

     </div>
  );
}