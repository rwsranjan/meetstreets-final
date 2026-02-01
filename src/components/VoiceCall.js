// components/VoiceCall.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  User, Clock, Signal 
} from 'lucide-react';

export default function VoiceCall({ participant, onEnd, isIncoming = false }) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connecting');
  const [signalStrength, setSignalStrength] = useState(3); // 0-3 bars
  const audioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        if (state === 'connected') {
          setCallStatus('connected');
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          handleEndCall();
        }
      };

      // Simulate connection (replace with actual signaling)
      if (!isIncoming) {
        setTimeout(() => setCallStatus('ringing'), 500);
        setTimeout(() => setCallStatus('connected'), 2000);
      }

    } catch (error) {
      console.error('Failed to initialize call:', error);
      alert('Failed to access microphone. Please check permissions.');
      onEnd();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEnd();
  };

  const handleAccept = () => {
    setCallStatus('connected');
  };

  const handleReject = () => {
    handleEndCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 z-50 flex items-center justify-center p-4">
      <audio ref={audioRef} autoPlay />
      
      <div className="w-full max-w-md">
        {/* Signal Strength */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(bar => (
              <div
                key={bar}
                className={`w-1 rounded-full transition-all ${
                  bar <= signalStrength ? 'bg-green-400 h-3' : 'bg-gray-700 h-2'
                } ${bar === 2 && 'h-4'} ${bar === 3 && 'h-5'}`}
              />
            ))}
          </div>
        </div>

        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mx-auto mb-6 relative">
            {participant.profilePicture ? (
              <img 
                src={participant.profilePicture} 
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-5xl font-bold">{participant.name?.charAt(0)}</span>
            )}
            
            {/* Animated ring */}
            {callStatus === 'ringing' && (
              <div className="absolute inset-0 rounded-full border-4 border-orange-400 animate-ping"></div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">{participant.name}</h2>
          
          <div className="flex items-center justify-center gap-2 text-gray-400">
            {callStatus === 'incoming' && (
              <>
                <Phone className="animate-bounce" size={18} />
                <span>Incoming call...</span>
              </>
            )}
            {callStatus === 'connecting' && (
              <>
                <Signal size={18} className="animate-pulse" />
                <span>Connecting...</span>
              </>
            )}
            {callStatus === 'ringing' && (
              <>
                <Phone size={18} className="animate-pulse" />
                <span>Ringing...</span>
              </>
            )}
            {callStatus === 'connected' && (
              <>
                <Clock size={18} />
                <span className="font-mono text-lg text-green-400">
                  {formatDuration(callDuration)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Call Controls */}
        {callStatus === 'incoming' ? (
          <div className="flex justify-center gap-6">
            <button
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all shadow-lg"
            >
              <PhoneOff size={28} />
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white transition-all shadow-lg animate-pulse"
            >
              <Phone size={28} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isMuted 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isSpeakerOn 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleEndCall}
                className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105"
              >
                <PhoneOff size={32} />
              </button>
            </div>
          </>
        )}

        {/* Status Indicators */}
        <div className="mt-6 flex justify-center gap-4 text-sm">
          {isMuted && (
            <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
              Microphone muted
            </div>
          )}
          {isSpeakerOn && (
            <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">
              Speaker on
            </div>
          )}
        </div>
      </div>
    </div>
  );
}