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

  const messagesEndRef = useRef(null);

  const currentUserId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")._id
      : null;

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  /* ---------------- SOCKET ROOM ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    joinRoom(conversationId);

    const handleIncomingMessage = (message) => {
      setMessages((prev) => [...prev, message]);
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
    loadMessages();
  }, [conversationId]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const text = newMessage;
    setNewMessage("");

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
          content: text,
          recipientId: participant?._id,
        }),
      });

      if (res.ok) {
        const { message } = await res.json();

        // 🔥 realtime emit
        sendMessage({
          conversationId,
          content: message.content,
          sender: currentUserId,
          createdAt: message.createdAt,
        });

        setMessages((prev) => [...prev, message]);
      }
    } catch (err) {
      console.error("Send failed:", err);
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  /* ---------------- CALLS ---------------- */
  const startVoiceCall = () => {
    startCall({
      type: "voice",
      to: participant._id,
      from: currentUserId,
    });
    setShowVoiceCall(true);
  };

  const startVideoCall = () => {
    startCall({
      type: "video",
      to: participant._id,
      from: currentUserId,
    });
    setShowVideoCall(true);
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* HEADER */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="text-gray-400" />
          </button>
          <div>
            <h2 className="text-white font-semibold">
              {participant?.profileName}
            </h2>
            <p className="text-xs text-gray-400">
              {participant?.isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={startVoiceCall}>
            <Phone className="text-gray-400" />
          </button>
          <button onClick={startVideoCall}>
            <Video className="text-gray-400" />
          </button>
          <MoreVertical className="text-gray-400" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id || i}
            message={msg}
            isOwn={msg.sender === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 bg-gray-900"
      >
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 bg-gray-800 text-white p-3 rounded-lg resize-none"
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
  );
}

/* ---------------- MESSAGE BUBBLE ---------------- */
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
          isOwn
            ? "bg-orange-600 text-white"
            : "bg-gray-800 text-white"
        }`}
      >
        {message.content}
        <div className="text-xs text-gray-300 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
