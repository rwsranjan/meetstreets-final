// app/messages/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { MessageCircle, Search, MoreVertical, Archive, Trash2 } from 'lucide-react';

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.profileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col">
       
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
              <p className="text-gray-400">Chat with your connections</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <MessageCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Start connecting with people to begin chatting!'}
              </p>
              {!searchQuery && (
                <Link href="/explore" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-amber-500 transition-all">
                  Find People
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conv) => (
                <ConversationCard key={conv._id} conversation={conv} />
              ))}
            </div>
          )}
        </div>
      </main>

     </div>
  );
}

function ConversationCard({ conversation }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Link href={`/messages/${conversation._id}`}>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-orange-500/50 transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                {conversation.participant?.profilePictures?.[0] ? (
                  <img 
                    src={conversation.participant.profilePictures[0].url} 
                    alt={conversation.participant.profileName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  conversation.participant?.profileName?.charAt(0)
                )}
              </div>
              {conversation.participant?.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                  {conversation.participant?.profileName}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate pr-2">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold flex-shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Menu Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </Link>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-4 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-2 min-w-[160px]">
            <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Archive size={16} />
              Archive
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatTime(date) {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return msgDate.toLocaleDateString();
}