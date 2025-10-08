import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> user info
  const [onlineMentors, setOnlineMentors] = useState(new Map()); // mentorId -> mentor info
  const [joinedTeams, setJoinedTeams] = useState(new Set());
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection with better configuration
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://teamtrack-backend-wwo6.onrender.com', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'], // Ensure both transports are available
        timeout: 20000,
        forceNew: true // Force new connection to avoid stale connections
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        setIsConnected(true);

        // Auto-join user's teams for notifications with delay to ensure connection is stable
        setTimeout(() => {
          if (user?.teams) {
            user.teams.forEach(team => {
              const teamId = typeof team === 'string' ? team : team._id;
              console.log(`🔗 Joining team: ${teamId}`);
              newSocket.emit('join-team', teamId);
              setJoinedTeams(prev => new Set([...prev, teamId]));
            });
          }
        }, 100);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        setJoinedTeams(new Set()); // Clear joined teams on disconnect
      });

      newSocket.on('connect_error', (error) => {
        console.error('🚫 Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
      });

      setSocket(newSocket);

      return () => {
        console.log('🧹 Cleaning up socket connection');
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        console.log('👋 User logged out, closing socket');
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setJoinedTeams(new Set());
      }
    }
  }, [user, token]);

  // Socket event handlers with improved error handling
  const joinTeam = (teamId) => {
    if (socket && isConnected && !joinedTeams.has(teamId)) {
      console.log(`🔗 Attempting to join team: ${teamId}`);
      socket.emit('join-team', teamId);
      setJoinedTeams(prev => new Set([...prev, teamId]));
    } else if (!socket) {
      console.warn('⚠️ Cannot join team: Socket not available');
    } else if (!isConnected) {
      console.warn('⚠️ Cannot join team: Socket not connected');
    } else {
      console.log(`ℹ️ Already joined team: ${teamId}`);
    }
  };

  const leaveTeam = (teamId) => {
    if (socket && isConnected) {
      console.log(`🚪 Leaving team: ${teamId}`);
      socket.emit('leave-team', teamId);
      setJoinedTeams(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamId);
        return newSet;
      });
    }
  };

  const sendMessage = (teamId, message) => {
    if (socket && isConnected) {
      console.log(`💬 Sending message to team ${teamId}:`, message.substring(0, 50) + '...');
      socket.emit('send-message', { teamId, message });
      return true; // Indicate success
    } else {
      console.error('❌ Cannot send message: Socket not connected');
      return false; // Indicate failure
    }
  };

  const sendTyping = (teamId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { teamId, isTyping });
    }
  };

  const markMessageAsRead = (messageId, teamId) => {
    if (socket && isConnected) {
      socket.emit('mark-message-read', { messageId, teamId });
    }
  };

  const editMessage = (messageId, newMessage, teamId) => {
    if (socket && isConnected) {
      socket.emit('edit-message', { messageId, newMessage, teamId });
    }
  };

  const deleteMessage = (messageId, teamId) => {
    if (socket && isConnected) {
      socket.emit('delete-message', { messageId, teamId });
    }
  };

  // Event listeners with improved handling
  const onNewMessage = (callback) => {
    if (socket) {
      const wrappedCallback = (message) => {
        console.log('📨 New message received:', message);
        callback(message);
      };
      socket.on('new-message', wrappedCallback);
      return () => socket.off('new-message', wrappedCallback);
    }
    return () => {}; // Return empty function if no socket
  };

  const onUserTyping = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('⌨️ User typing:', data);
        callback(data);
      };
      socket.on('user-typing', wrappedCallback);
      return () => socket.off('user-typing', wrappedCallback);
    }
    return () => {};
  };

  const onMessageError = (callback) => {
    if (socket) {
      const wrappedCallback = (error) => {
        console.error('💥 Message error:', error);
        callback(error);
      };
      socket.on('message-error', wrappedCallback);
      return () => socket.off('message-error', wrappedCallback);
    }
    return () => {};
  };

  const onNewSuggestion = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('🔔 New suggestion received:', data);
        callback(data);
      };
      socket.on('new-suggestion', wrappedCallback);
      return () => socket.off('new-suggestion', wrappedCallback);
    }
    return () => {};
  };

  const onMentorMonitoringStarted = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('👁️ Mentor monitoring started:', data);
        callback(data);
      };
      socket.on('mentor-monitoring-started', wrappedCallback);
      return () => socket.off('mentor-monitoring-started', wrappedCallback);
    }
    return () => {};
  };

  const onOnlineStatusUpdate = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('🟢 Online status update:', data);
        callback(data);
      };
      socket.on('online-status-update', wrappedCallback);
      return () => socket.off('online-status-update', wrappedCallback);
    }
    return () => {};
  };

  const onMessageRead = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('✅ Message read:', data);
        callback(data);
      };
      socket.on('message-read', wrappedCallback);
      return () => socket.off('message-read', wrappedCallback);
    }
    return () => {};
  };

  const onMessageEdited = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('✏️ Message edited:', data);
        callback(data);
      };
      socket.on('message-edited', wrappedCallback);
      return () => socket.off('message-edited', wrappedCallback);
    }
    return () => {};
  };

  const onMessageDeleted = (callback) => {
    if (socket) {
      const wrappedCallback = (data) => {
        console.log('🗑️ Message deleted:', data);
        callback(data);
      };
      socket.on('message-deleted', wrappedCallback);
      return () => socket.off('message-deleted', wrappedCallback);
    }
    return () => {};
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    onlineMentors,
    joinedTeams,
    joinTeam,
    leaveTeam,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    editMessage,
    deleteMessage,
    onNewMessage,
    onUserTyping,
    onMessageError,
    onNewSuggestion,
    onMentorMonitoringStarted,
    onOnlineStatusUpdate,
    onMessageRead,
    onMessageEdited,
    onMessageDeleted
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
