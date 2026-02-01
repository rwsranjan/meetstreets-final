"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 import { Camera, Edit, Save, X, MapPin, Heart, Briefcase } from 'lucide-react';

export default function MyProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setFormData(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(user);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="h-48 bg-gradient-to-br from-orange-500 to-amber-500 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 border-4 border-gray-900 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {user?.profileName?.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full border-2 border-gray-800 hover:border-orange-500 transition-colors">
                  <Camera size={18} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="pt-20 p-8">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{user?.coins || 0}</div>
                  <div className="text-sm text-gray-400">Coins</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{user?.meetsPerMonth || 0}</div>
                  <div className="text-sm text-gray-400">Meets/Month</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{user?.qualityScore || 0}/5</div>
                  <div className="text-sm text-gray-400">Quality Score</div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Profile Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.profileName || ''}
                      onChange={(e) => setFormData({...formData, profileName: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-white text-lg">{user?.profileName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                  <div className="text-white text-lg">{user?.age} years</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                  <div className="text-white text-lg capitalize">{user?.gender}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Location
                  </label>
                  <div className="text-white text-lg">{user?.address?.city}, {user?.address?.locality}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Education</label>
                  {editing ? (
                    <select
                      value={formData.education || ''}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select...</option>
                      <option value="high-school">High School</option>
                      <option value="bachelors">Bachelor's</option>
                      <option value="masters">Master's</option>
                      <option value="phd">PhD</option>
                    </select>
                  ) : (
                    <div className="text-white text-lg capitalize">{user?.education?.replace('-', ' ') || 'Not specified'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Briefcase size={16} className="inline mr-1" />
                    Purpose
                  </label>
                  <div className="text-white text-lg capitalize">{user?.purposeOnApp?.replace(/-/g, ' ')}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <Heart size={16} className="inline mr-1" />
                    Hobbies & Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user?.hobbies?.map((hobby, index) => (
                      <span key={index} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Subscription</label>
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-semibold capitalize">{user?.subscriptionType} Plan</div>
                      <div className="text-sm text-gray-400">
                        {user?.subscriptionType === 'premium' 
                          ? 'Unlimited features' 
                          : user?.subscriptionType === 'regular'
                          ? '50 searches/month'
                          : '10 searches/month'}
                      </div>
                    </div>
                    {user?.subscriptionType !== 'premium' && (
                      <button
                        onClick={() => router.push('/subscription')}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

     </div>
  );
}