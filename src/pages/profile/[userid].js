"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { 
  MapPin, Heart, MessageCircle, Send, Ban, Flag,
  Sparkles, Calendar, Coffee, Briefcase, GraduationCap
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
        setShowMatchModal(false);
      }
    } catch (error) {
      console.error('Failed to send match request:', error);
    }
  };

 const startChat = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: params.userId, // 🔥 MUST be receiverId
        content: "Hi 👋",
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
          {/* Profile Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
            <div className="h-64 bg-gradient-to-br from-orange-500 to-amber-500 relative">
              {profile.profilePictures?.[0] && (
                <img 
                  src={profile.profilePictures[0].url} 
                  alt={profile.profileName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profile.profileName}</h1>
                    {profile.isOnline && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                        Online
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <MapPin size={16} />
                    <span>{profile.address?.city}, {profile.address?.locality}</span>
                  </div>

                  {profile.aiMatchScore && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Sparkles size={16} />
                      <span className="font-semibold">{profile.aiMatchScore}% Compatible</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
                  >
                    <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
                  </button>
                 <button
  onClick={startChat}
  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
>
  <MessageCircle size={20} />
  Message
</button>

                  <button
                    onClick={() => setShowMatchModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-orange-600/30"
                  >
                    <Send size={20} />
                    Connect
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">{profile.meetsPerMonth || 0}</div>
                  <div className="text-sm text-gray-400">Meets/Month</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{profile.qualityScore || 0}/5</div>
                  <div className="text-sm text-gray-400">Quality Score</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{profile.ageRange}</div>
                  <div className="text-sm text-gray-400">Age Range</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {profile.subscriptionType === 'premium' ? '⭐' : profile.subscriptionType === 'regular' ? '✓' : '•'}
                  </div>
                  <div className="text-sm text-gray-400 capitalize">{profile.subscriptionType}</div>
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
                <div className="space-y-3">
                  <InfoRow icon={<Briefcase size={18} />} label="Purpose" value={profile.purposeOnApp?.replace('-', ' ')} />
                  <InfoRow icon={<GraduationCap size={18} />} label="Education" value={profile.education} />
                  <InfoRow icon={<Coffee size={18} />} label="Eating Habits" value={profile.eatingHabits} />
                </div>
              </div>

              {/* Interests & Hobbies */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Interests & Hobbies</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies?.map((hobby) => (
                    <span key={hobby} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">
                      {hobby}
                    </span>
                  ))}
                </div>
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