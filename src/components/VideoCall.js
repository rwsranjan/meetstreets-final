// components/VideoCall.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Camera, 
  MoreVertical, Maximize2, Minimize2, User, MessageCircle
} from 'lucide-react';

export default function VideoCall({ participant, onEnd, isIncoming = false }) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connecting');
  const [showControls, setShowControls] = useState(true);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

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
      // Get user media (audio + video)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC
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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state
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
      console.error('Failed to initialize video call:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const switchCamera = async () => {
    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
      sender.replaceTrack(newVideoTrack);

      videoTrack.stop();
      localStreamRef.current.removeTrack(videoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (callStatus === 'connected') {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
    >
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Remote Video Placeholder */}
      {callStatus !== 'connected' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mx-auto mb-6">
              {participant.profilePicture ? (
                <img 
                  src={participant.profilePicture} 
                  alt={participant.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold">{participant.name?.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{participant.name}</h2>
            <p className="text-gray-400">
              {callStatus === 'incoming' && 'Incoming video call...'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'ringing' && 'Ringing...'}
            </p>
          </div>
        </div>
      )}

      {/* Local Video (Picture-in-Picture) */}
      <div className={`absolute top-4 right-4 w-40 h-56 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl transition-all ${
        isVideoOff ? 'bg-gray-900' : ''
      }`}>
        {isVideoOff ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <User className="text-gray-600" size={48} />
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        )}
      </div>

      {/* Header - Call Info */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
              {participant.name?.charAt(0)}
            </div>
            <div>
              <div className="text-white font-medium">{participant.name}</div>
              {callStatus === 'connected' && (
                <div className="text-green-400 text-sm font-mono">{formatDuration(callDuration)}</div>
              )}
            </div>
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      {callStatus === 'incoming' ? (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
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
              <Video size={28} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center items-center gap-4">
            {/* Mute Audio */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isVideoOff 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all shadow-lg hover:scale-105"
              title="End call"
            >
              <PhoneOff size={32} />
            </button>

            {/* Switch Camera */}
            <button
              onClick={switchCamera}
              className="w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all"
              title="Switch camera"
            >
              <Camera size={24} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center gap-3 mt-4">
            {isMuted && (
              <div className="px-3 py-1 bg-red-500/80 text-white text-xs rounded-full">
                Muted
              </div>
            )}
            {isVideoOff && (
              <div className="px-3 py-1 bg-red-500/80 text-white text-xs rounded-full">
                Camera off
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}