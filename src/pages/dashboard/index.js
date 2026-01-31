"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Coins, Users, Calendar, TrendingUp, MapPin, Heart, 
  MessageCircle, Award, Bell, Settings, LogOut 
} from 'lucide-react';


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      // Fetch dashboard stats
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setNearbyUsers(data.nearbyUsers || []);
        setMatches(data.recentMatches || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950">
       
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{user?.profileName}!</span>
            </h1>
            <p className="text-gray-400">Here's what's happening in your network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Coins className="text-orange-400" />}
              label="Street Coins"
              value={user?.coins || 0}
              subtext="Available balance"
              gradient="from-orange-500 to-amber-500"
              link="/wallet"
            />
            <StatCard
              icon={<Users className="text-blue-400" />}
              label="Connections"
              value={stats?.totalMatches || 0}
              subtext="Active matches"
              gradient="from-blue-500 to-cyan-500"
              link="/matches"
            />
            <StatCard
              icon={<Calendar className="text-green-400" />}
              label="Meetings"
              value={stats?.totalMeetings || 0}
              subtext="This month"
              gradient="from-green-500 to-emerald-500"
              link="/meetings"
            />
            <StatCard
              icon={<TrendingUp className="text-purple-400" />}
              label="Quality Score"
              value={(stats?.qualityScore || 0).toFixed(1)}
              subtext="Out of 5.0"
              gradient="from-purple-500 to-pink-500"
              link="/my-profile"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Activity Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickAction
                    icon={<Users />}
                    label="Find People"
                    link="/explore"
                    color="orange"
                  />
                  <QuickAction
                    icon={<Calendar />}
                    label="Create Event"
                    link="/events/create"
                    color="blue"
                  />
                  <QuickAction
                    icon={<MessageCircle />}
                    label="Messages"
                    link="/messages"
                    color="green"
                  />
                  <QuickAction
                    icon={<MapPin />}
                    label="Nearby"
                    link="/nearby"
                    color="purple"
                  />
                </div>
              </div>

              {/* Recent Matches */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Matches</h2>
                  <Link href="/matches" className="text-sm text-orange-400 hover:text-orange-300">
                    View all
                  </Link>
                </div>
                
                {matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match) => (
                      <MatchCard key={match._id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500">No matches yet</p>
                    <Link href="/explore" className="text-sm text-orange-400 hover:text-orange-300 mt-2 inline-block">
                      Start exploring
                    </Link>
                  </div>
                )}
              </div>

              {/* Upcoming Meetings */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Upcoming Meetings</h2>
                  <Link href="/meetings" className="text-sm text-orange-400 hover:text-orange-300">
                    View all
                  </Link>
                </div>
                
                {stats?.upcomingMeetings?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.upcomingMeetings.map((meeting) => (
                      <MeetingCard key={meeting._id} meeting={meeting} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500">No upcoming meetings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Profile Strength</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Completion</span>
                    <span className="text-orange-400 font-semibold">{stats?.profileCompletion || 75}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats?.profileCompletion || 75}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Complete your profile to get better matches!
                </p>
                <Link 
                  href="/my-profile"
                  className="block w-full text-center py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Complete Profile
                </Link>
              </div>

              {/* Nearby Users */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Nearby People</h3>
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                
                {nearbyUsers.length > 0 ? (
                  <div className="space-y-3">
                    {nearbyUsers.slice(0, 5).map((user) => (
                      <NearbyUserCard key={user._id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No users nearby</p>
                  </div>
                )}
                
                <Link 
                  href="/nearby"
                  className="block w-full text-center mt-4 py-2 border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Explore More
                </Link>
              </div>

              {/* Subscription Card */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user?.subscriptionType === 'premium' ? 'Premium' : user?.subscriptionType === 'regular' ? 'Regular' : 'Free'} Plan
                    </h3>
                    <p className="text-sm text-gray-400">
                      {user?.subscriptionType === 'premium' 
                        ? 'Unlimited access' 
                        : 'Upgrade for more features'}
                    </p>
                  </div>
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                
                {user?.subscriptionType !== 'premium' && (
                  <Link 
                    href="/subscription"
                    className="block w-full text-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-600/30"
                  >
                    Upgrade Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, gradient, link }) {
  return (
    <Link href={link} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group-hover:shadow-lg group-hover:shadow-orange-500/10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xs text-gray-600 mt-1">{subtext}</div>
      </div>
    </Link>
  );
}

function QuickAction({ icon, label, link, color }) {
  const colors = {
    orange: 'from-orange-500 to-amber-500 hover:shadow-orange-500/20',
    blue: 'from-blue-500 to-cyan-500 hover:shadow-blue-500/20',
    green: 'from-green-500 to-emerald-500 hover:shadow-green-500/20',
    purple: 'from-purple-500 to-pink-500 hover:shadow-purple-500/20'
  };

  return (
    <Link href={link}>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} text-white text-center hover:shadow-lg transition-all cursor-pointer group`}>
        <div className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-sm font-medium">{label}</div>
      </div>
    </Link>
  );
}

function MatchCard({ match }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold">
        {match.user?.profileName?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{match.user?.profileName || 'User'}</div>
        <div className="text-sm text-gray-400 truncate">{match.commonInterests?.join(', ') || 'New match'}</div>
      </div>
      <div className="text-sm font-semibold text-orange-400">
        {match.aiMatchScore}%
      </div>
    </div>
  );
}

function MeetingCard({ meeting }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <Calendar className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-white">{meeting.meetingType}</div>
        <div className="text-sm text-gray-400">
          {new Date(meeting.scheduledDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function NearbyUserCard({ user }) {
  return (
    <Link href={`/profile/${user._id}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.profileName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{user.profileName}</div>
          <div className="text-xs text-gray-500 truncate">{user.address?.locality}</div>
        </div>
        <div className="text-xs text-gray-600">
          {user.distance}km
        </div>
      </div>
    </Link>
  );
}