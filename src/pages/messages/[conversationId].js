// app/messages/[conversationId]/page.jsx
"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Image as ImageIcon,
  Search,
  MessageCircle
} from "lucide-react";

import VoiceCall from "../../components/VoiceCall";
import VideoCall from "../../components/VideoCall";
import { useSocket } from "../../hooks/useSocket";

export default function ChatWindow() {
  const router = useRouter();
const params = useParams();
const conversationId = params?.conversationId;

  const { joinRoom, sendMessage, onMessage, startCall } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);

  const currentUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUserId = currentUserStr 
    ? (JSON.parse(currentUserStr).id || JSON.parse(currentUserStr)._id)
    : null;

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  /* ---------------- SOCKET ROOM ---------------- */
  useEffect(() => {
    if (!currentUserId) return;

    joinRoom(currentUserId);

    const handleIncomingMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read immediately if it's the active chat
        const token = localStorage.getItem("token");
        fetch("/api/messages/mark-read", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversationId }),
        });
      }
      
      // Always reload sidebar so latest message and unread bubbles are fresh!
      loadConversations();
    };

    onMessage(handleIncomingMessage);

    return () => {
      // important: prevent duplicate listeners
      // socket.off handled inside hook via disconnect
    };
  }, [conversationId]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    // Optimistically clear the unread count in the UI instantly
    setConversations(prev => prev.map(c => 
      c._id === conversationId ? { ...c, unreadCount: 0 } : c
    ));

    loadMessages();
    loadConversations();
  }, [conversationId]);

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
    }
  };

  const messagesContainerRef = useRef(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  /* ---------------- API ---------------- */
  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setParticipant(data.participant);

        await fetch("/api/messages/mark-read", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversationId }),
        });
      }
    } catch (err) {
      console.error("Load messages failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || sending || !participant) return;

  const text = newMessage;
  setNewMessage("");
  setSending(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        receiverId: participant._id,
        content: text,
      }),
    });

    if (!res.ok) throw new Error("Send failed");

    const { message } = await res.json();

    // realtime emit
    sendMessage({
      receiverId: participant._id,
      message: {
        _id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        createdAt: message.createdAt,
      }
    });

    setMessages((prev) => [...prev, message]);
  } catch (err) {
    console.error("Send failed:", err);
    setNewMessage(text);
  } finally {
    setSending(false);
  }
};

  /* ---------------- CALLS ---------------- */
  const startVoiceCall = () => {
    alert("Voice call feature is coming soon!");
  };

  const startVideoCall = () => {
    alert("Video call feature is coming soon!");
  };

  /* ---------------- MENU ACTIONS ---------------- */
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  const handleRemoveConnection = async () => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/match/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId: participant._id, conversationId }),
      });
      if (res.ok) {
        alert("Connection removed.");
        router.push("/messages");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm("Are you sure you want to block this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/match/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId: participant._id, conversationId, block: true }),
      });
      if (res.ok) {
        alert("User blocked.");
        router.push("/messages");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant?.profileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100dvh-4rem)] mt-16 bg-gray-950 flex overflow-hidden">
      
      {/* LEFT SIDEBAR (Desktop Only, Resizable) */}
      <div 
        className="hidden lg:flex flex-col border-r border-gray-800 bg-[#0f1115] resize-x overflow-hidden"
        style={{ width: '400px', minWidth: '300px', maxWidth: '600px' }}
      >
        <div className="p-4 border-b border-gray-800 bg-[#0f1115]">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
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
          {filteredConversations.map(conv => {
            const isActive = conv._id === conversationId;
            return (
              <div 
                key={conv._id}
                onClick={() => router.push(`/messages/${conv._id}`)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                    {conv.participant?.profilePictures?.[0] ? (
                      <img 
                        src={conv.participant.profilePictures[0].url} 
                        alt={conv.participant.profileName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      conv.participant?.profileName?.charAt(0)
                    )}
                  </div>
                  {Boolean(conv.participant?.isOnline) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-white font-medium truncate">{conv.participant?.profileName}</h4>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.lastMessage?.content || 'No messages'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div 
        className="flex-1 flex flex-col relative min-w-0 bg-[#0b0c10]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        
        {/* HEADER */}
        <div className="bg-[#0f1115]/95 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 flex justify-between items-center z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="lg:hidden">
              <ArrowLeft className="text-gray-400" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {participant?.profilePictures?.[0] ? (
                <img src={participant.profilePictures[0].url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 font-bold">{participant?.profileName?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">
                {participant?.profileName}
              </h2>
              <p className="text-xs text-gray-400">
                {participant?.isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={startVoiceCall} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <Phone className="text-gray-400 hover:text-orange-400" size={20} />
            </button>
            <button onClick={startVideoCall} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <Video className="text-gray-400 hover:text-orange-400" size={20} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <MoreVertical className="text-gray-400 hover:text-orange-400" size={20} />
              </button>
              
              {/* Dropdown */}
              {showHeaderMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHeaderMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button 
                      onClick={handleRemoveConnection}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Remove Connection
                    </button>
                    <button 
                      onClick={handleBlockUser}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors border-t border-gray-700"
                    >
                      Block User
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* MESSAGES */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map((msg, i) => {
          const msgDate = new Date(msg.createdAt);
          const prevDate = i > 0 ? new Date(messages[i - 1].createdAt) : null;
          const showDate = !prevDate || msgDate.toDateString() !== prevDate.toDateString();

          return (
            <div key={msg._id || i}>
              {showDate && (
                <div className="flex justify-center my-6">
                  <span className="bg-gray-800/80 text-gray-400 text-xs font-medium px-4 py-1.5 rounded-full border border-gray-700/50">
                    {msgDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.sender?.toString() === currentUserId || msg.senderId?.toString() === currentUserId}
              />
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 bg-gray-900"
      >
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 bg-gray-800 text-white p-3 rounded-lg resize-none outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-orange-600 p-3 rounded-lg"
        >
          <Send className="text-white" />
        </button>
      </form>

      {showVoiceCall && (
        <VoiceCall
          participant={participant}
          onEnd={() => setShowVoiceCall(false)}
          isIncoming={false}
        />
      )}

      {showVideoCall && (
        <VideoCall
          participant={participant}
          onEnd={() => setShowVideoCall(false)}
          isIncoming={false}
        />
      )}
      </div>
    </div>
  );
}

/* ---------------- MESSAGE BUBBLE ---------------- */
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} mt-2`}>
      <div
        className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-md ${
          isOwn
            ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-br-sm"
            : "bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
      <div className={`text-[10px] text-gray-500 font-medium mt-1 ${isOwn ? "pr-1" : "pl-1"}`}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
