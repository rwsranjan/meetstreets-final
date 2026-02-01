 
import { Users, Heart, Shield, Zap, Target, Globe, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">MeetStreet</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We're building a platform where genuine connections happen naturally. 
              No swipes, no games, just real people meeting in real life.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Target className="text-orange-400" size={40} />
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              MeetStreet exists to bring people together in meaningful ways. We believe that the best 
              connections happen face-to-face, over coffee, during events, or while exploring your city together.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Unlike traditional dating apps, we focus on creating authentic friendships, travel companions, 
              activity partners, and genuine social connections. Our reward system encourages people to 
              actually meet up and spend quality time together.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <ValueCard
              icon={<Heart className="text-red-400" size={32} />}
              title="Genuine Connections"
              description="We prioritize quality over quantity. Every connection should be meaningful and authentic."
            />
            <ValueCard
              icon={<Shield className="text-blue-400" size={32} />}
              title="Safety First"
              description="KYC verification, police checks, and community reporting keep our platform safe."
            />
            <ValueCard
              icon={<Zap className="text-yellow-400" size={32} />}
              title="Rewarding Experience"
              description="Earn coins for meeting people, refer friends, and enjoy your social life with benefits."
            />
            <ValueCard
              icon={<Globe className="text-green-400" size={32} />}
              title="Community Driven"
              description="Built by the community, for the community. Your feedback shapes our platform."
            />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard number="10K+" label="Active Users" icon={<Users />} />
            <StatCard number="50K+" label="Meetups" icon={<Heart />} />
            <StatCard number="100+" label="Cities" icon={<Globe />} />
            <StatCard number="4.8★" label="Rating" icon={<Award />} />
          </div>

          {/* Why MeetStreet */}
          <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Why MeetStreet?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Feature
                title="Not a Dating App"
                description="We focus on friendships, activities, and genuine connections - not just romance."
              />
              <Feature
                title="Reward System"
                description="Earn coins for meeting people and use them for events, subscriptions, or cash out."
              />
              <Feature
                title="Purpose-Driven"
                description="Everyone states their purpose: coffee, travel, movies, transit, or just making friends."
              />
              <Feature
                title="AI Matching"
                description="Our algorithm finds compatible people based on interests, location, and preferences."
              />
              <Feature
                title="Verified Users"
                description="KYC and police verification ensure you're connecting with real, trustworthy people."
              />
              <Feature
                title="Local Events"
                description="Create or join events happening in your city - from coffee meetups to weekend trips."
              />
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="space-y-6">
              <HowItWorksStep
                number="1"
                title="Create Your Profile"
                description="Sign up, complete your profile, and tell us what you're looking for - coffee buddy, travel companion, or activity partner."
              />
              <HowItWorksStep
                number="2"
                title="Discover & Connect"
                description="Browse nearby people, get AI-powered match suggestions, and send connection requests to people who share your interests."
              />
              <HowItWorksStep
                number="3"
                title="Meet in Real Life"
                description="Chat, plan meetups, attend events together, and build genuine friendships. Earn coins for every successful meeting!"
              />
              <HowItWorksStep
                number="4"
                title="Earn & Enjoy"
                description="Get rewarded with coins, refer friends for bonuses, upgrade your subscription, or cash out your earnings."
              />
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center">
            <Users className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Growing Community</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              We're building the future of social connections. Whether you're new to a city, 
              looking for travel buddies, or just want to expand your social circle - MeetStreet is for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg shadow-orange-600/30">
                Get Started Free
              </Link>
              <Link href="/careers" className="inline-block px-8 py-4 border-2 border-gray-700 hover:border-orange-500 text-gray-300 hover:text-white rounded-lg font-semibold transition-all">
                We're Hiring
              </Link>
            </div>
          </div>
        </div>
      </main>

     </div>
  );
}

function ValueCard({ icon, title, description }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ number, label, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-orange-500/50 transition-all">
      <div className="w-8 h-8 text-orange-400 mx-auto mb-2">{icon}</div>
      <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold mt-0.5">
        ✓
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function HowItWorksStep({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}