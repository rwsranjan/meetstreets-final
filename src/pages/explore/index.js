"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
 import { Search, Filter, MapPin, Heart, User, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function Explore() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    ageRange: '',
    gender: '',
    purposeOnApp: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/search/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950">
       
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Explore People</h1>
              <p className="text-gray-400">Discover amazing connections nearby</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-orange-500 transition-colors"
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={filters.ageRange}
                  onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Ages</option>
                  <option value="18-25">18-25</option>
                  <option value="26-30">26-30</option>
                  <option value="31-40">31-40</option>
                  <option value="40-50">40-50</option>
                  <option value="50+">50+</option>
                </select>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
                <button
                  onClick={() => { setLoading(true); loadUsers(); }}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Finding amazing people...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function UserCard({ user }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    // TODO: API call to toggle favorite
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/profile/${user._id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer group">
        <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center relative overflow-hidden">
          {user.profilePictures?.[0] ? (
            <img src={user.profilePictures[0].url} alt={user.profileName} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl text-white font-bold">
              {user.profileName?.charAt(0)}
            </div>
          )}
          {user.isOnline && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                {user.profileName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <MapPin size={14} />
                <span>{user.address?.city}, {user.address?.locality}</span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Heart 
                size={20} 
                className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} 
              />
            </button>
          </div>
          
          <div className="flex gap-2 mb-3 flex-wrap">
            {user.hobbies?.slice(0, 3).map((hobby) => (
              <span key={hobby} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                {hobby}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              {user.ageRange}
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-400">
              <Sparkles size={14} />
              <span>{user.aiMatchScore || 0}% Match</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}