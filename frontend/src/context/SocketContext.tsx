'use client';

import React, { createContext, useContext, useRef, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io('http://127.0.0.1:5000');
    console.log('socketRef.current:', socketRef.current);
  }

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected:', socketRef.current?.id);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
    };

    const socket = socketRef.current;

    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
    }

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
