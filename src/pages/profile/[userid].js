"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { 
  MapPin, Heart, MessageCircle, Send, Ban, Flag,
  Sparkles, Calendar, Coffee, Briefcase, GraduationCap, User, Check
} from 'lucide-react';

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadProfile();
  }, [params.userId]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/profile?userId=${params.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMatchRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/match/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId: params.userId,
          requestMessage: 'Hi! Would love to connect!'
        })
      });
      
      if (res.ok) {
        alert('Match request sent!');
        setProfile(prev => ({ ...prev, connectionStatus: 'pending', initiatedByMe: true }));
        setShowMatchModal(false);
      }
    } catch (error) {
      console.error('Failed to send match request:', error);
    }
  };

 const startChat = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/messages/start", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: params.userId,
      }),
    });

    const data = await res.json();
    router.push(`/messages/${data.conversationId}`);
  } catch (err) {
    console.error(err);
  }
};



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
          <button onClick={() => router.back()} className="text-orange-400 hover:text-orange-300">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950">
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6 shadow-2xl">
            {/* Gradient Hero Strip */}
            <div className="h-32 sm:h-40 bg-gradient-to-br from-orange-600 via-rose-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.10) 0%, transparent 60%)' }}></div>
            </div>
            
            <div className="px-5 sm:px-8 pb-6 sm:pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6">
                
                {/* Avatar (Intersecting) */}
                <div className="relative self-start flex-shrink-0 -mt-16 sm:-mt-20 z-10">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 border-4 border-gray-900 overflow-hidden shadow-2xl">
                    {profile.profilePictures?.[0] ? (
                      <img src={profile.profilePictures[0].url} alt={profile.profileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl font-black">
                        {profile.profileName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {Boolean(profile.isOnline) && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{profile.profileName}</h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <MapPin size={16} className="text-orange-400" />
                          <span>{profile.address?.city}, {profile.address?.locality}</span>
                        </div>
                        {profile.aiMatchScore && (
                          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full font-medium border border-amber-400/20">

                            <Sparkles size={14} />
                            <span>{profile.aiMatchScore}% Compatible</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 lg:mt-0 w-full lg:w-auto">
                      <div className="flex gap-3">
                        <button onClick={() => setIsFavorite(!isFavorite)} className="p-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-orange-500 hover:bg-gray-750 transition-all shadow-lg flex-shrink-0">
                          <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
                        </button>
                        <button onClick={startChat} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap">
                          <MessageCircle size={20} />
                          Message
                        </button>
                      </div>
                      
                      {profile.connectionStatus === 'pending' ? (
                        profile.initiatedByMe ? (
                          <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-bold opacity-80 cursor-not-allowed whitespace-nowrap">
                            <Check size={20} />
                            Request Sent
                          </button>
                        ) : (
                          <button onClick={() => router.push('/matches')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/30 whitespace-nowrap">
                            <Check size={20} />
                            Accept Request
                          </button>
                        )
                      ) : profile.connectionStatus === 'accepted' || profile.connectionStatus === 'matched' ? (
                        <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold shadow-lg opacity-90 cursor-default whitespace-nowrap">
                          <Check size={20} />
                          Connected
                        </button>
                      ) : (
                        <button onClick={() => setShowMatchModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap">
                          <Send size={20} />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-800">
                <div className="text-center p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{profile.meetsPerMonth || 0}</div>
                  <div className="text-sm font-medium text-gray-400">Meets/Month</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <div className="text-2xl font-bold text-green-400 mb-1">{profile.qualityScore || 0}/5</div>
                  <div className="text-sm font-medium text-gray-400">Quality Score</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{profile.ageRange || '-'}</div>
                  <div className="text-sm font-medium text-gray-400">Age Range</div>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {profile.subscriptionType === 'premium' ? '⭐' : profile.subscriptionType === 'regular' ? '✓' : '•'}
                  </div>
                  <div className="text-sm font-medium text-gray-400 capitalize">{profile.subscriptionType || 'Free'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">About</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={<Briefcase size={18} />} label="Purpose" value={
                    {
                      'offering-time-company': 'Offering Time & Company',
                      'looking-for-time-company': 'Looking for Company',
                      'both': 'Both'
                    }[profile.purposeOnApp] || profile.purposeOnApp
                  } />
                  <InfoRow icon={<GraduationCap size={18} />} label="Education" value={profile.education} />
                  <InfoRow icon={<GraduationCap size={18} />} label="Degree / Field" value={profile.degreeType} />
                  <InfoRow icon={<User size={18} />} label="Height" value={profile.height} />
                  <InfoRow icon={<User size={18} />} label="Ethnic Background" value={profile.ethnicBackground} />
                  <InfoRow icon={<Heart size={18} />} label="Want Kids" value={profile.wantKids} />
                  <InfoRow icon={<Sparkles size={18} />} label="Religious Beliefs" value={profile.religiousBeliefs} />
                  <InfoRow icon={<Briefcase size={18} />} label="Exercise Habits" value={profile.exerciseHabits} />
                  <InfoRow icon={<Coffee size={18} />} label="Eating Habits" value={profile.eatingHabits} />
                  <InfoRow icon={<MapPin size={18} />} label="Favorite Place to Meet" value={profile.interestsMeta?.favoritePlaceToMeet} />
                  <InfoRow icon={<MapPin size={18} />} label="Traveler Type" value={profile.interestsMeta?.travelerType} />
                </div>
              </div>

              {/* Interests & Hobbies */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Interests</h2>
                
                {profile.hobbies && profile.hobbies.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Hobbies</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby) => (
                        <span key={hobby} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.favoriteFood && profile.favoriteFood.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Favorite Cuisines</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteFood.map((food) => (
                        <span key={food} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.favoriteMusic && profile.favoriteMusic.length > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Favorite Music</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteMusic.map((music) => (
                        <span key={music} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                          {music}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photos */}
              {profile.profilePictures?.length > 1 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Photos</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.profilePictures.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Common Interests */}
              {profile.commonInterests?.length > 0 && (
                <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Common Interests</h3>
                  <div className="space-y-2">
                    {profile.commonInterests.map((interest) => (
                      <div key={interest} className="flex items-center gap-2 text-orange-300">
                        <Sparkles size={14} />
                        <span className="text-sm">{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg transition-colors">
                    <Ban size={18} />
                    Block User
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-lg transition-colors">
                    <Flag size={18} />
                    Report User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Match Request Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Send Match Request</h3>
            <p className="text-gray-400 mb-6">
              Send a connection request to {profile.profileName}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatchModal(false)}
                className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendMatchRequest}
                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-white capitalize">{value || 'Not specified'}</div>
      </div>
    </div>
  );
}
export async function getServerSideProps(context) {
  const { userId } = context.params;

  if (!userId) {
    return { notFound: true };
  }

  return {
    props: {
      userId
    }
  };
}


// ⏳ Remaining (17 pages):
// 5. my-profile/page.jsx
// 6. matches/page.jsx
// 7. messages/page.jsx
// 8. messages/[conversationId]/page.jsx
// 9. meetings/page.jsx
// 10. meetings/[meetingId]/page.jsx
// 11. events/page.jsx
// 12. events/[eventId]/page.jsx
// 13. events/create/page.jsx
// 14. wallet/page.jsx
// 15. subscription/page.jsx
// 16. settings/page.jsx
// 17. referrals/page.jsx
// 18. favorites/page.jsx
// 19. blocked-users/page.jsx
// 20. forgot-password/page.jsx
// 21. reset-password/page.jsx

// Create remaining 17 pages using the patterns shown above
// Create all API endpoints as per PROJECT_DOCUMENTATION.md
// Test authentication flow thoroughly
// Implement Socket.io for real-time features
// Add payment gateway integration
// Deploy to staging for testing