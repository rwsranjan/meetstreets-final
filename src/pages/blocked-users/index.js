"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Ban, Unlock, Shield } from 'lucide-react';

export default function BlockedUsers() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/blocked', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/unblock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Ban className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Blocked Users</h1>
              <p className="text-gray-400 mt-1">Manage users you've blocked</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No blocked users</h3>
              <p className="text-gray-400">You haven't blocked anyone yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user) => (
                <div key={user._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xl font-bold">
                        {user.profileName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{user.profileName}</h3>
                        <p className="text-sm text-gray-400">{user.address?.city}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Blocked on {new Date(user.blockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Unblock ${user.profileName}?`)) {
                          unblockUser(user._id);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Unlock size={18} />
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">About Blocking</h3>
            <ul className="text-sm text-blue-200 space-y-2">
              <li>• Blocked users cannot send you messages or match requests</li>
              <li>• They won't be able to see your profile or find you in search</li>
              <li>• You won't see their profile anywhere on the platform</li>
              <li>• Unblocking a user restores normal interaction</li>
            </ul>
          </div>
        </div>
      </main>

     </div>
  );
}