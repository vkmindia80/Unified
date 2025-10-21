import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Sidebar from '../components/Layout/Sidebar';
import WebRTC from '../components/WebRTC';
import SpaceNavigation from '../components/SpaceNavigation';
import CreateSpaceModal from '../components/CreateSpaceModal';
import CreateSubspaceModal from '../components/CreateSubspaceModal';
import FileUpload from '../components/FileUpload';
import GifPicker from '../components/GifPicker';
import MessageFileAttachment from '../components/MessageFileAttachment';
import { FaComments, FaPlus, FaSearch, FaPaperPlane, FaPaperclip, FaSmile, FaVideo, FaPhone, FaCircle, FaCog } from 'react-icons/fa';

function ChatWithSpaces() {
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // Spaces & Subspaces
  const [spaces, setSpaces] = useState([]);
  const [subspaces, setSubspaces] = useState([]);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showCreateSubspace, setShowCreateSubspace] = useState(false);
  const [selectedSpaceForSubspace, setSelectedSpaceForSubspace] = useState(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelSpaceId, setChannelSpaceId] = useState(null);
  const [channelSubspaceId, setChannelSubspaceId] = useState(null);
  
  // Chats
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  
  // Calls
  const [inCall, setInCall] = useState(false);
  const [callTarget, setCallTarget] = useState(null);
  const [callType, setCallType] = useState('video');
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Channel creation form
  const [channelName, setChannelName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // File Upload & GIF
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchSpaces();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChat && socket && connected) {
      fetchMessages(selectedChat.id);
      socket.emit('join_chat', { chat_id: selectedChat.id });
      
      return () => {
        socket.emit('leave_chat', { chat_id: selectedChat.id });
      };
    }
  }, [selectedChat, socket, connected]);

  // Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      if (message.chat_id === selectedChat?.id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Update spaces with last message
      fetchSpaces();
    });

    socket.on('user_typing', (data) => {
      if (data.chat_id === selectedChat?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.user_id]: data.is_typing
        }));
        
        setTimeout(() => {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[data.user_id];
            return newState;
          });
        }, 3000);
      }
    });

    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_response', (data) => {
      if (data.accepted) {
        setInCall(true);
      } else {
        alert('Call was rejected');
        setCallTarget(null);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('incoming_call');
      socket.off('call_response');
    };
  }, [socket, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSpaces = async () => {
    try {
      const response = await api.get('/spaces');
      const spacesData = response.data;
      
      // Fetch chats and organize by space
      const chatsResponse = await api.get('/chats');
      const allChats = chatsResponse.data;
      
      // Organize chats by spaces
      const spacesWithChats = spacesData.map(space => ({
        ...space,
        chats: allChats.filter(chat => chat.space_id === space.id)
      }));
      
      setSpaces(spacesWithChats);
      
      // Fetch subspaces for each space
      const allSubspaces = [];
      for (const space of spacesData) {
        const subspacesResponse = await api.get(`/spaces/${space.id}/subspaces`);
        allSubspaces.push(...subspacesResponse.data);
      }
      setSubspaces(allSubspaces);
      
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const createSpace = async (spaceData) => {
    try {
      await api.post('/spaces', spaceData);
      fetchSpaces();
    } catch (error) {
      console.error('Failed to create space:', error);
      throw error;
    }
  };

  const createSubspace = async (spaceId, subspaceData) => {
    try {
      await api.post(`/spaces/${spaceId}/subspaces`, subspaceData);
      fetchSpaces();
    } catch (error) {
      console.error('Failed to create subspace:', error);
      throw error;
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();
    if (!channelName.trim() || selectedUsers.length === 0) return;

    try {
      const chatData = {
        name: channelName,
        type: 'group',
        participants: selectedUsers,
        space_id: channelSpaceId,
        subspace_id: channelSubspaceId
      };
      
      await api.post('/chats/with-space', chatData);
      setShowCreateChannel(false);
      setChannelName('');
      setSelectedUsers([]);
      fetchSpaces();
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    try {
      socket.emit('send_message', {
        chat_id: selectedChat.id,
        content: newMessage,
        type: 'text'
      });
      
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUploaded = (fileData) => {
    if (!socket || !selectedChat) return;
    
    // Send file message through socket
    socket.emit('send_message', {
      chat_id: selectedChat.id,
      content: fileData.filename,
      type: fileData.category, // 'image', 'document', or 'video'
      file_url: fileData.url,
      file_id: fileData.id
    });
    
    setShowFileUpload(false);
  };

  const handleGifSelected = (gifUrl) => {
    if (!socket || !selectedChat) return;
    
    // Send GIF as image message
    socket.emit('send_message', {
      chat_id: selectedChat.id,
      content: 'GIF',
      type: 'image',
      file_url: gifUrl
    });
    
    setShowGifPicker(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chat_id: selectedChat.id, is_typing: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { chat_id: selectedChat.id, is_typing: false });
    }, 2000);
  };

  const initiateCall = (type) => {
    if (!selectedChat || selectedChat.type !== 'direct') {
      alert('Calls are only available for direct chats');
      return;
    }

    const otherUser = selectedChat.participants_data?.find(p => p.id !== user?.id);
    if (!otherUser) return;

    setCallType(type);
    setCallTarget(otherUser.id);
    
    socket.emit('call_user', {
      target_user_id: otherUser.id,
      call_type: type
    });
    
    setInCall(true);
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    
    socket.emit('call_response', {
      target_user_id: incomingCall.from_user.id,
      accepted: true
    });
    
    setCallTarget(incomingCall.from_user.id);
    setCallType(incomingCall.call_type);
    setInCall(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    
    socket.emit('call_response', {
      target_user_id: incomingCall.from_user.id,
      accepted: false
    });
    
    setIncomingCall(null);
  };

  const endCall = async (callData) => {
    setInCall(false);
    setCallTarget(null);
    
    if (callData && callData.duration > 0) {
      try {
        await api.post('/calls/history', {
          type: callType,
          participants: [user.id, callTarget],
          duration: callData.duration,
          status: 'completed'
        });
      } catch (error) {
        console.error('Failed to save call history:', error);
      }
    }
  };

  const getChatName = (chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct') {
      const otherUser = chat.participants_data?.find(p => p.id !== user?.id);
      return otherUser?.full_name || 'Unknown';
    }
    return 'Group Chat';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingText = () => {
    const typingUserIds = Object.keys(typingUsers).filter(id => typingUsers[id]);
    if (typingUserIds.length === 0) return null;
    
    if (typingUserIds.length === 1) {
      const typingUser = selectedChat?.participants_data?.find(p => p.id === typingUserIds[0]);
      return `${typingUser?.full_name || 'Someone'} is typing...`;
    }
    
    return 'Multiple people are typing...';
  };

  if (inCall && callTarget) {
    return <WebRTC targetUserId={callTarget} callType={callType} onEnd={endCall} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`mr-2 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
            >
              <FaArrowLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <FaComments className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Spaces</h1>
            {connected && (
              <span className="flex items-center space-x-1 text-sm text-green-500">
                <FaCircle className="text-xs" />
                <span>Connected</span>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Spaces Navigation */}
        <div className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search spaces..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading spaces...</p>
            </div>
          ) : (
            <div className="p-4">
              <SpaceNavigation
                spaces={spaces}
                subspaces={subspaces}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onCreateSpace={() => setShowCreateSpace(true)}
                onCreateSubspace={(spaceId) => {
                  const space = spaces.find(s => s.id === spaceId);
                  setSelectedSpaceForSubspace(space);
                  setShowCreateSubspace(true);
                }}
                onCreateChannel={(spaceId, subspaceId) => {
                  setChannelSpaceId(spaceId);
                  setChannelSubspaceId(subspaceId);
                  setShowCreateChannel(true);
                }}
                darkMode={darkMode}
              />
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {getChatName(selectedChat).charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getChatName(selectedChat)}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedChat.space?.name && `${selectedChat.space.name}`}
                        {selectedChat.subspace?.name && ` → ${selectedChat.subspace.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => initiateCall('voice')}
                      className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                      title="Voice Call"
                    >
                      <FaPhone className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                    <button 
                      onClick={() => initiateCall('video')}
                      className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                      title="Video Call"
                    >
                      <FaVideo className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaComments className={`text-6xl mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No messages yet</p>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${
                          message.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        } rounded-lg px-4 py-2 shadow`}>
                          {message.sender_id !== user?.id && (
                            <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-300' : ''}`}>{message.sender?.full_name}</p>
                          )}
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
                
                {getTypingText() && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} text-sm italic`}>
                      {getTypingText()}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className={`p-3 rounded-lg transition ${
                      darkMode
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                    }`}
                    title="Attach file"
                  >
                    <FaPaperclip />
                  </button>
                  
                  {/* GIF Button */}
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(true)}
                    className={`p-3 rounded-lg transition ${
                      darkMode
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                    }`}
                    title="Send GIF"
                  >
                    <FaSmile />
                  </button>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  />
                  <button
                    type="submit"
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-center">
                <FaComments className={`text-8xl mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a channel to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Space Modal */}
      {showCreateSpace && (
        <CreateSpaceModal
          onClose={() => setShowCreateSpace(false)}
          onCreate={createSpace}
          darkMode={darkMode}
        />
      )}

      {/* Create Subspace Modal */}
      {showCreateSubspace && selectedSpaceForSubspace && (
        <CreateSubspaceModal
          spaceId={selectedSpaceForSubspace.id}
          spaceName={selectedSpaceForSubspace.name}
          onClose={() => {
            setShowCreateSubspace(false);
            setSelectedSpaceForSubspace(null);
          }}
          onCreate={createSubspace}
          darkMode={darkMode}
        />
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateChannel(false)}>
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Channel</h2>
            
            <form onSubmit={createChannel} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Channel Name</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g., general, random"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Add Members</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.map((u) => (
                    <label key={u.id} className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{u.full_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={!channelName.trim() || selectedUsers.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Channel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateChannel(false);
                    setChannelName('');
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center`}>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              {incomingCall.from_user.full_name?.charAt(0)}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {incomingCall.from_user.full_name}
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Incoming {incomingCall.call_type} call...
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={acceptCall}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && selectedChat && (
        <FileUpload
          chatId={selectedChat.id}
          onClose={() => setShowFileUpload(false)}
          onFileUploaded={handleFileUploaded}
        />
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && selectedChat && (
        <GifPicker
          chatId={selectedChat.id}
          onClose={() => setShowGifPicker(false)}
          onGifSelected={handleGifSelected}
        />
      )}
    </div>
  );
}

export default ChatWithSpaces;
