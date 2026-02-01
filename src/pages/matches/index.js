"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
  import { Heart, X, Check, Sparkles } from 'lucide-react';

export default function Matches() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/match/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        setPending(data.pending || []);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/match/respond', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matchId, action })
      });
      
      if (res.ok) {
        loadMatches();
      }
    } catch (error) {
      console.error('Failed to respond:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">My Matches</h1>

          {/* Pending Requests */}
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Pending Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((match) => (
                  <div key={match._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                        {match.user?.profileName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{match.user?.profileName}</h3>
                        <div className="text-sm text-gray-400">{match.user?.address?.city}</div>
                      </div>
                      <div className="text-orange-400 font-bold">{match.aiMatchScore}%</div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{match.requestMessage}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(match._id, 'accept')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Check size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(match._id, 'decline')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Matches */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">My Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Link key={match._id} href={`/profile/${match.user._id}`}>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer">
                    <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <div className="text-6xl text-white font-bold">
                        {match.user?.profileName?.charAt(0)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{match.user?.profileName}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{match.user?.address?.city}</span>
                        <span className="flex items-center gap-1 text-sm text-orange-400">
                          <Sparkles size={14} />
                          {match.aiMatchScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

     </div>
  );
}