// hooks/useSocket.js - Create this file
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://meetstreet.in');

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinRoom = (roomId) => {
    socketRef.current?.emit('join', roomId);
  };

  const sendMessage = (data) => {
    socketRef.current?.emit('send_message', data);
  };

  const onMessage = (callback) => {
    socketRef.current?.on('new_message', callback);
  };

  const startCall = (callData) => {
    socketRef.current?.emit('start_call', callData);
  };

  const onIncomingCall = (callback) => {
    socketRef.current?.on('incoming_call', callback);
  };

  return {
    joinRoom,
    sendMessage,
    onMessage,
    startCall,
    onIncomingCall
  };
}