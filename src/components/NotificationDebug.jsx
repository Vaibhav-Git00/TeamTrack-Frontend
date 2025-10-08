import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const NotificationDebug = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user?.role === 'student') {
      console.log('🔔 NotificationDebug: Setting up listeners');
      
      const handleNewSuggestion = (data) => {
        console.log('🔔 NotificationDebug: Received new suggestion:', data);
      };

      socket.on('new-suggestion', handleNewSuggestion);

      return () => {
        socket.off('new-suggestion', handleNewSuggestion);
      };
    }
  }, [socket, user]);

  if (user?.role !== 'student') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs">
      Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      <br />
      User: {user?.name} ({user?.role})
    </div>
  );
};

export default NotificationDebug;
