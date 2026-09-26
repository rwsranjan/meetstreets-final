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
    <div className="h-[calc(100dvh-4rem)] mt-16 bg-gray-950 flex overflow-hidden">
      
      {/* LEFT SIDEBAR (Full width on mobile, resizable on desktop) */}
      <div 
        className="w-full lg:w-[400px] flex-col border-r border-gray-800 bg-[#0f1115] flex lg:resize-x lg:overflow-hidden"
        style={{ minWidth: '300px', maxWidth: '600px' }}
      >
        <div className="p-4 border-b border-gray-800 bg-[#0f1115]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <Link href="/explore" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Find People
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationCard key={conv._id} conversation={conv} />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE (Hidden on mobile, empty state on desktop) */}
      <div 
        className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#0b0c10] relative min-w-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="text-center max-w-md p-8">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-800">
            <MessageCircle className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">MeetStreet Web</h2>
          <p className="text-gray-400 mb-8">
            Send and receive messages seamlessly. Select a conversation on the left to start chatting, or explore new connections.
          </p>
          <Link href="/explore" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg shadow-orange-500/20">
            Discover People
          </Link>
        </div>
        <div className="absolute bottom-8 text-xs text-gray-600 flex items-center gap-2">
           Secured with End-to-End Privacy
        </div>
      </div>
    </div>
  );
}

function ConversationCard({ conversation }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Link href={`/messages/${conversation._id}`}>
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
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
              {Boolean(conversation.participant?.isOnline) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                  {conversation.participant?.profileName}
                </h4>
                <span className="text-[11px] text-gray-500 flex-shrink-0 ml-2">
                  {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 truncate pr-2">
                  {conversation.lastMessage?.content || 'No messages'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
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