import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Sidebar from '../components/Layout/Sidebar';
import WebRTC from '../components/WebRTC';
import FileUpload from '../components/FileUpload';
import GifPicker from '../components/GifPicker';
import ImageGallery from '../components/ImageGallery';
import MessageFileAttachment from '../components/MessageFileAttachment';
import { FaComments, FaPlus, FaSearch, FaPaperPlane, FaVideo, FaPhone, FaCircle, FaPaperclip, FaSmile } from 'react-icons/fa';

function Chat() {
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatName, setChatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callTarget, setCallTarget] = useState(null);
  const [callType, setCallType] = useState('video');
  const [incomingCall, setIncomingCall] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [imageGallery, setImageGallery] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChats();
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
      // Update chat list with last message
      setChats(prev => prev.map(chat => 
        chat.id === message.chat_id 
          ? { ...chat, last_message: message.content, last_message_at: message.created_at }
          : chat
      ));
    });

    socket.on('user_typing', (data) => {
      if (data.chat_id === selectedChat?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.user_id]: data.is_typing
        }));
        
        // Clear typing indicator after 3 seconds
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

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
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

  const createChat = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const chatData = {
        name: selectedUsers.length > 1 ? chatName : null,
        type: selectedUsers.length > 1 ? 'group' : 'direct',
        participants: selectedUsers
      };
      
      const response = await api.post('/chats', chatData);
      setChats([...chats, response.data]);
      setShowNewChat(false);
      setSelectedUsers([]);
      setChatName('');
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && pendingFiles.length === 0) || !selectedChat || !socket) return;

    try {
      socket.emit('send_message', {
        chat_id: selectedChat.id,
        content: newMessage,
        type: pendingFiles.length > 0 ? 'file' : 'text',
        files: pendingFiles
      });
      
      setNewMessage('');
      setPendingFiles([]);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFilesUploaded = (files) => {
    setPendingFiles([...pendingFiles, ...files]);
    setShowFileUpload(false);
  };

  const handleGifSelect = (gif) => {
    if (!selectedChat || !socket) return;

    // For uploaded GIFs
    if (gif.source === 'upload') {
      setPendingFiles([{
        id: gif.id,
        url: gif.url,
        filename: gif.filename,
        category: 'image',
        mime_type: 'image/gif'
      }]);
    } else {
      // For GIPHY GIFs, we'll send the URL directly
      socket.emit('send_message', {
        chat_id: selectedChat.id,
        content: `GIF: ${gif.title || 'Shared a GIF'}`,
        type: 'gif',
        files: [{
          url: gif.url,
          filename: gif.title || 'gif',
          category: 'image',
          mime_type: 'image/gif',
          source: 'giphy'
        }]
      });
    }
    
    setShowGifPicker(false);
  };

  const removePendingFile = (fileId) => {
    setPendingFiles(pendingFiles.filter(f => f.id !== fileId));
  };

  const openImageGallery = (imageFile, allImages) => {
    const imageIndex = allImages.findIndex(img => img.id === imageFile.id);
    setImageGallery({
      images: allImages,
      initialIndex: imageIndex >= 0 ? imageIndex : 0
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chat_id: selectedChat.id, is_typing: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
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
    
    // Notify the other user
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
    
    // Save call history
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

  const isUserOnline = (userId) => {
    return onlineUsers[userId] === 'online';
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-primary-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaComments className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Chat</h1>
              {connected && (
                <span className="flex items-center space-x-1 text-sm text-green-500">
                  <FaCircle className="text-xs" />
                  <span>Connected</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              data-testid="new-chat-button"
            >
              <FaPlus />
              <span>New Chat</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 h-[calc(100vh-80px)]">
        {/* Sidebar - Chat List */}
        <div className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search chats..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                data-testid="search-chat-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center">
              <FaComments className={`text-5xl mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No chats yet</p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Start a new conversation!</p>
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {chats.map((chat) => {
                const otherUser = chat.participants_data?.find(p => p.id !== user?.id);
                const isOnline = chat.type === 'direct' && otherUser && isUserOnline(otherUser.id);
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer transition ${
                      selectedChat?.id === chat.id 
                        ? (darkMode ? 'bg-gray-700 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500')
                        : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                    }`}
                    data-testid={`chat-item-${chat.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getChatName(chat).charAt(0)}
                        </div>
                        {isOnline && (
                          <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getChatName(chat)}</p>
                        <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {chat.last_message || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                        {selectedChat.participants?.length || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => initiateCall('voice')}
                      className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`} 
                      title="Voice Call"
                      data-testid="voice-call-button"
                    >
                      <FaPhone className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                    <button 
                      onClick={() => initiateCall('video')}
                      className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`} 
                      title="Video Call"
                      data-testid="video-call-button"
                    >
                      <FaVideo className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} data-testid="messages-container">
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
                    {messages.map((message) => {
                      // Get all images from message files for gallery
                      const messageImages = (message.files || []).filter(f => 
                        f.category === 'image' || f.mime_type?.startsWith('image/')
                      );

                      return (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          data-testid="message-item"
                        >
                          <div className={`max-w-md ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                          } rounded-lg px-4 py-2 shadow`}>
                            {message.sender_id !== user?.id && (
                              <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-gray-300' : ''}`}>{message.sender?.full_name}</p>
                            )}
                            {message.content && <p>{message.content}</p>}
                            
                            {/* File Attachments */}
                            {message.files && message.files.length > 0 && (
                              <div className="space-y-2">
                                {message.files.map((file, index) => (
                                  <MessageFileAttachment
                                    key={file.id || index}
                                    file={file}
                                    darkMode={darkMode}
                                    onImageClick={(imageFile) => openImageGallery(imageFile, messageImages)}
                                  />
                                ))}
                              </div>
                            )}
                            
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? 'text-blue-100' : darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
                
                {/* Typing Indicator */}
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
                {/* Pending Files Preview */}
                {pendingFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {pendingFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`relative group ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2 flex items-center space-x-2`}
                      >
                        {file.category === 'image' ? (
                          <img src={file.url} alt={file.filename} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded">
                            <FaPaperclip />
                          </div>
                        )}
                        <span className={`text-sm truncate max-w-[100px] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {file.filename}
                        </span>
                        <button
                          onClick={() => removePendingFile(file.id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(true)}
                    className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                    title="Attach file"
                    data-testid="attach-file-button"
                  >
                    <FaPaperclip className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(true)}
                    className={`p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
                    title="Send GIF"
                    data-testid="gif-picker-button"
                  >
                    <FaSmile className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    data-testid="message-input"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && pendingFiles.length === 0}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="send-message-button"
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
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="new-chat-modal">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Chat</h2>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Users</label>
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
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {u.full_name?.charAt(0)}
                    </div>
                    <span className={darkMode ? 'text-white' : 'text-gray-800'}>{u.full_name}</span>
                    {isUserOnline(u.id) && (
                      <FaCircle className="text-green-500 text-xs ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {selectedUsers.length > 1 && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Group Name</label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Enter group name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={createChat}
                disabled={selectedUsers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="create-chat-button"
              >
                Create Chat
              </button>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedUsers([]);
                  setChatName('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                data-testid="cancel-chat-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="incoming-call-modal">
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
                data-testid="accept-call-button"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                data-testid="reject-call-button"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          onClose={() => setShowFileUpload(false)}
          chatId={selectedChat?.id}
          darkMode={darkMode}
        />
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker
          onGifSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
          darkMode={darkMode}
        />
      )}

      {/* Image Gallery */}
      {imageGallery && (
        <ImageGallery
          images={imageGallery.images}
          initialIndex={imageGallery.initialIndex}
          onClose={() => setImageGallery(null)}
          darkMode={darkMode}
        />
        )}
      </div>
    </div>
  );
}

export default Chat;
