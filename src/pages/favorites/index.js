"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { Heart, MapPin, X, MessageCircle } from 'lucide-react';

export default function Favorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/favorites', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        setFavorites(favorites.filter(fav => fav._id !== userId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Favorites</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
              <p className="text-gray-400 mb-6">Start adding people to your favorites!</p>
              <Link href="/explore" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all">
                Explore People
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((user) => (
                <div key={user._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group">
                  <Link href={`/profile/${user._id}`}>
                    <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center cursor-pointer relative">
                      {user.profilePictures?.[0] ? (
                        <img src={user.profilePictures[0].url} alt={user.profileName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-6xl text-white font-bold">{user.profileName?.charAt(0)}</div>
                      )}
                      {user.isOnline && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                          {user.profileName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <MapPin size={14} />
                          <span>{user.address?.city}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavorite(user._id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove from favorites"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {user.hobbies?.slice(0, 3).map((hobby) => (
                        <span key={hobby} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                          {hobby}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => router.push(`/messages?userId=${user._id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageCircle size={18} />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

     </div>
  );
}