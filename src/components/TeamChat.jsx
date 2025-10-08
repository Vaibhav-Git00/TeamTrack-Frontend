import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Trash2, Edit3, Check, X, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const TeamChat = ({ teamId, teamName, teamMembers = [], mentors = [] }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState(new Map());
  const [onlineMentors, setOnlineMentors] = useState(new Map());
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const {
    isConnected,
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
    onOnlineStatusUpdate,
    onMessageRead,
    onMessageEdited,
    onMessageDeleted
  } = useSocket();

  useEffect(() => {
    if (teamId && isConnected) {
      fetchMessages();
      // Small delay to ensure socket is ready
      setTimeout(() => {
        joinTeam(teamId);
      }, 100);
    }

    return () => {
      if (teamId) {
        leaveTeam(teamId);
      }
    };
  }, [teamId, isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    // Listen for new messages
    const unsubscribeNewMessage = onNewMessage((message) => {
      console.log('📨 TeamChat: Received new message', message);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(m => m._id === message._id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        return [...prev, message];
      });

      // Auto-mark message as read if user is viewing the chat
      if (message.sender._id !== user?.id) {
        setTimeout(() => {
          markMessageAsRead(message._id, teamId);
        }, 1000);
      }

      scrollToBottom();
    });

    // Listen for typing indicators
    const unsubscribeTyping = onUserTyping(({ userId, userName, isTyping }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userName);
          } else {
            newSet.delete(userName);
          }
          return newSet;
        });
      }
    });

    // Listen for online status updates
    const unsubscribeOnlineStatus = onOnlineStatusUpdate((data) => {
      const { onlineMembers = [], onlineMentors = [] } = data;

      // Update online members
      const membersMap = new Map();
      onlineMembers.forEach(member => {
        membersMap.set(member._id, member);
      });
      setOnlineMembers(membersMap);

      // Update online mentors
      const mentorsMap = new Map();
      onlineMentors.forEach(mentor => {
        mentorsMap.set(mentor._id, mentor);
      });
      setOnlineMentors(mentorsMap);
    });

    // Listen for message read receipts
    const unsubscribeMessageRead = onMessageRead((data) => {
      const { messageId, readBy } = data;
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          const updatedReadBy = [...(msg.readBy || [])];
          if (!updatedReadBy.some(r => r.user === readBy.user)) {
            updatedReadBy.push(readBy);
          }
          return { ...msg, readBy: updatedReadBy };
        }
        return msg;
      }));
    });

    // Listen for message edits
    const unsubscribeMessageEdited = onMessageEdited((editedMessage) => {
      setMessages(prev => prev.map(msg =>
        msg._id === editedMessage._id ? editedMessage : msg
      ));
    });

    // Listen for message deletions
    const unsubscribeMessageDeleted = onMessageDeleted((data) => {
      const { messageId } = data;
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    // Listen for message errors
    const unsubscribeError = onMessageError((error) => {
      console.error('💥 TeamChat: Message error:', error);
      // You could show a toast notification here
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeOnlineStatus();
      unsubscribeMessageRead();
      unsubscribeMessageEdited();
      unsubscribeMessageDeleted();
      unsubscribeError();
    };
  }, [user?.id, isConnected, teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/team/${teamId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      const success = sendMessage(teamId, newMessage.trim());
      if (success) {
        setNewMessage('');
        handleStopTyping();
      } else {
        console.error('❌ Failed to send message - socket not connected');
        // You could show an error toast here
      }
    } else if (!isConnected) {
      console.warn('⚠️ Cannot send message: Not connected to server');
      // You could show a warning toast here
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message._id);
    setEditText(message.message);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editingMessage) {
      editMessage(editingMessage, editText.trim(), teamId);
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId, teamId);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(teamId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTyping(teamId, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{teamName} Chat</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>

            {/* Online Mentors Status */}
            {onlineMentors.size > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">
                  Mentor{onlineMentors.size > 1 ? 's' : ''} online
                </span>
              </div>
            )}

            {/* Online Members Count */}
            {onlineMembers.size > 0 && (
              <span className="text-gray-400">
                {onlineMembers.size} member{onlineMembers.size > 1 ? 's' : ''} online
              </span>
            )}
          </div>
        </div>

        {/* Online Users List */}
        <div className="flex items-center space-x-2">
          {Array.from(onlineMentors.values()).map(mentor => (
            <div key={mentor._id} className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">{mentor.name}</span>
            </div>
          ))}
          {Array.from(onlineMembers.values()).slice(0, 3).map(member => (
            <div key={member._id} className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">{member.name}</span>
            </div>
          ))}
          {onlineMembers.size > 3 && (
            <span className="text-xs text-gray-400">+{onlineMembers.size - 3} more</span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(date)}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.sender._id === user?.id ? 'ml-auto' : 'mr-auto'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg relative group ${
                      message.sender._id === user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {/* Message Actions (Edit/Delete) */}
                    {message.sender._id === user?.id && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          >
                            <Edit3 className="h-3 w-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}

                    {message.sender._id !== user?.id && (
                      <div className="text-xs font-medium mb-1 opacity-75">
                        {message.sender.name}
                      </div>
                    )}

                    {/* Message Content or Edit Input */}
                    {editingMessage === message._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded text-gray-900"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm">
                          {message.message}
                          {message.isEdited && (
                            <span className="text-xs opacity-60 ml-2">(edited)</span>
                          )}
                        </div>

                        {/* Message Footer */}
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.sender._id === user?.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.createdAt)}</span>

                          {/* Read Receipts */}
                          {message.sender._id === user?.id && message.readBy && message.readBy.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Check className="h-3 w-3" />
                              <span>{message.readBy.length}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!isConnected}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
