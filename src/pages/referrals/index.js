"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 import { Gift, Copy, Users, Coins, Check } from 'lucide-react';

export default function Referrals() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarned: 0, referrals: [] });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/referral/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Gift className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Refer & Earn</h1>
            <p className="text-gray-400 text-lg">
              Invite friends and earn <span className="text-orange-400 font-semibold">50 coins</span> for each referral!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalReferrals}</div>
              <div className="text-sm text-gray-400">Total Referrals</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <Coins className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalEarned}</div>
              <div className="text-sm text-gray-400">Coins Earned</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">50</div>
              <div className="text-sm text-gray-400">Coins per Referral</div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Your Referral Code</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-6 py-4 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Referral Code</div>
                <div className="text-2xl font-bold text-orange-400 font-mono">{user?.referralCode || 'LOADING...'}</div>
              </div>
              <button
                onClick={copyReferralCode}
                className="flex items-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copy Link
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">
              Share this link with friends. You both get 50 coins when they sign up!
            </p>
          </div>

          {/* How it Works */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">How it Works</h2>
            <div className="space-y-4">
              <Step number="1" title="Share your referral link" description="Send your unique referral link to friends via WhatsApp, email, or social media" />
              <Step number="2" title="Friend signs up" description="Your friend creates an account using your referral link" />
              <Step number="3" title="Get rewarded" description="You both receive 50 coins instantly when they complete registration" />
            </div>
          </div>

          {/* Referral List */}
          {stats.referrals?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Referrals</h2>
              <div className="space-y-3">
                {stats.referrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                        {referral.profileName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{referral.profileName}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(referral.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 font-semibold">
                      <Coins size={16} />
                      +50
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

     </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-white mb-1">{title}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </div>
  );
}