import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import WebRTC from '../components/WebRTC';
import FileUpload from '../components/FileUpload';
import GifPicker from '../components/GifPicker';
import ImageGallery from '../components/ImageGallery';
import MessageFileAttachment from '../components/MessageFileAttachment';
import { 
  FiMessageSquare, FiPlus, FiSearch, FiSend, FiVideo, FiPhone, 
  FiPaperclip, FiSmile, FiMoreVertical, FiCheck, FiCheckCircle
} from 'react-icons/fi';

function Chat() {
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
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
  const [searchQuery, setSearchQuery] = useState('');
  
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

    if (gif.source === 'upload') {
      setPendingFiles([{
        id: gif.id,
        url: gif.url,
        filename: gif.filename,
        category: 'image',
        mime_type: 'image/gif'
      }]);
    } else {
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

  const filteredChats = chats.filter(chat => 
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (inCall && callTarget) {
    return <WebRTC targetUserId={callTarget} callType={callType} onEnd={endCall} />;
  }

  return (
    <Layout>
      <div className=\"bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-gray-200 dark:border-primary-700 h-[calc(100vh-7rem)] flex\">
        {/* Sidebar - Chat List */}
        <div className=\"w-80 border-r border-gray-200 dark:border-primary-700 flex flex-col\">
          {/* Header */}
          <div className=\"p-4 border-b border-gray-200 dark:border-primary-700\">
            <div className=\"flex items-center justify-between mb-4\">
              <h2 className=\"text-xl font-bold text-primary-900 dark:text-white\">Messages</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className=\"p-2 bg-corporate-600 text-white rounded-lg hover:bg-corporate-700 transition\"
                data-testid=\"new-chat-button\"
              >
                <FiPlus className=\"w-5 h-5\" />
              </button>
            </div>
            <div className=\"relative\">
              <FiSearch className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4\" />
              <input
                type=\"text\"
                placeholder=\"Search conversations...\"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=\"w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-primary-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-corporate-500 dark:bg-primary-700 dark:text-white\"
                data-testid=\"search-chat-input\"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className=\"flex-1 overflow-y-auto\">
            {loading ? (
              <div className=\"p-4 text-center text-gray-500 dark:text-gray-400\">Loading...</div>
            ) : filteredChats.length === 0 ? (
              <div className=\"p-8 text-center\">
                <FiMessageSquare className=\"text-5xl mx-auto mb-3 text-gray-300 dark:text-gray-600\" />
                <p className=\"text-gray-500 dark:text-gray-400\">No chats yet</p>
                <p className=\"text-sm mt-2 text-gray-400 dark:text-gray-500\">Start a conversation!</p>
              </div>
            ) : (
              <div className=\"divide-y divide-gray-200 dark:divide-primary-700\">
                {filteredChats.map((chat) => {
                  const otherUser = chat.participants_data?.find(p => p.id !== user?.id);
                  const isOnline = chat.type === 'direct' && otherUser && isUserOnline(otherUser.id);
                  
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-primary-700 transition ${
                        selectedChat?.id === chat.id 
                          ? 'bg-corporate-50 dark:bg-primary-700 border-l-4 border-corporate-600'
                          : ''
                      }`}
                      data-testid={`chat-item-${chat.id}`}
                    >
                      <div className=\"flex items-center space-x-3\">
                        <div className=\"relative flex-shrink-0\">
                          <div className=\"w-12 h-12 bg-gradient-to-br from-corporate-400 to-corporate-600 rounded-full flex items-center justify-center text-white font-semibold\">
                            {getChatName(chat).charAt(0)}
                          </div>
                          {isOnline && (
                            <div className=\"absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-primary-800 rounded-full\"></div>
                          )}
                        </div>
                        <div className=\"flex-1 min-w-0\">
                          <div className=\"flex items-center justify-between mb-1\">
                            <p className=\"font-semibold text-primary-900 dark:text-white truncate\">{getChatName(chat)}</p>
                            {chat.last_message_at && (
                              <span className=\"text-xs text-gray-500 dark:text-gray-400\">
                                {formatTime(chat.last_message_at)}
                              </span>
                            )}
                          </div>
                          <p className=\"text-sm text-gray-500 dark:text-gray-400 truncate\">
                            {chat.last_message || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Connection Status */}
          {connected && (
            <div className=\"p-3 border-t border-gray-200 dark:border-primary-700 bg-green-50 dark:bg-green-900/20\">
              <div className=\"flex items-center space-x-2 text-sm text-green-700 dark:text-green-400\">
                <div className=\"w-2 h-2 bg-green-500 rounded-full animate-pulse\"></div>
                <span>Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className=\"flex-1 flex flex-col\">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className=\"px-6 py-4 border-b border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800\">
                <div className=\"flex items-center justify-between\">
                  <div className=\"flex items-center space-x-3\">
                    <div className=\"w-10 h-10 bg-gradient-to-br from-corporate-400 to-corporate-600 rounded-full flex items-center justify-center text-white font-semibold\">
                      {getChatName(selectedChat).charAt(0)}
                    </div>
                    <div>
                      <p className=\"font-semibold text-primary-900 dark:text-white\">{getChatName(selectedChat)}</p>
                      <p className=\"text-sm text-gray-500 dark:text-gray-400\">
                        {selectedChat.participants?.length || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className=\"flex items-center space-x-2\">
                    <button 
                      onClick={() => initiateCall('voice')}
                      className=\"p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition\" 
                      title=\"Voice Call\"
                      data-testid=\"voice-call-button\"
                    >
                      <FiPhone className=\"w-5 h-5 text-gray-600 dark:text-gray-300\" />
                    </button>
                    <button 
                      onClick={() => initiateCall('video')}
                      className=\"p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition\" 
                      title=\"Video Call\"
                      data-testid=\"video-call-button\"
                    >
                      <FiVideo className=\"w-5 h-5 text-gray-600 dark:text-gray-300\" />
                    </button>
                    <button className=\"p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition\">
                      <FiMoreVertical className=\"w-5 h-5 text-gray-600 dark:text-gray-300\" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className=\"flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-primary-900\" data-testid=\"messages-container\">
                {messages.length === 0 ? (
                  <div className=\"flex items-center justify-center h-full\">
                    <div className=\"text-center\">
                      <FiMessageSquare className=\"text-6xl mx-auto mb-3 text-gray-300 dark:text-gray-600\" />
                      <p className=\"text-gray-500 dark:text-gray-400\">No messages yet</p>
                      <p className=\"text-sm mt-2 text-gray-400 dark:text-gray-500\">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const messageImages = (message.files || []).filter(f => 
                        f.category === 'image' || f.mime_type?.startsWith('image/')
                      );

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          data-testid=\"message-item\"
                        >
                          <div className={`max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            {!isOwnMessage && (
                              <p className=\"text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 ml-3\">{message.sender?.full_name}</p>
                            )}
                            <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                              isOwnMessage
                                ? 'bg-corporate-600 text-white'
                                : 'bg-white dark:bg-primary-800 text-gray-900 dark:text-white'
                            }`}>
                              {message.content && <p className=\"break-words\">{message.content}</p>}
                              
                              {message.files && message.files.length > 0 && (
                                <div className=\"space-y-2 mt-2\">
                                  {message.files.map((file, index) => (
                                    <MessageFileAttachment
                                      key={file.id || index}
                                      file={file}
                                      darkMode={false}
                                      onImageClick={(imageFile) => openImageGallery(imageFile, messageImages)}
                                    />
                                  ))}
                                </div>
                              )}
                              
                              <div className=\"flex items-center justify-end space-x-1 mt-1\">
                                <p className={`text-xs ${
                                  isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {formatTime(message.created_at)}
                                </p>
                                {isOwnMessage && (
                                  <FiCheckCircle className=\"w-3 h-3 text-white/70\" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
                
                {/* Typing Indicator */}
                {getTypingText() && (
                  <div className=\"flex justify-start\">
                    <div className=\"bg-white dark:bg-primary-800 rounded-2xl px-4 py-2 shadow-sm\">
                      <p className=\"text-sm text-gray-500 dark:text-gray-400 italic\">{getTypingText()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className=\"px-6 py-4 border-t border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800\">
                {/* Pending Files Preview */}
                {pendingFiles.length > 0 && (
                  <div className=\"mb-3 flex flex-wrap gap-2\">
                    {pendingFiles.map((file) => (
                      <div
                        key={file.id}
                        className=\"relative group bg-gray-100 dark:bg-primary-700 rounded-lg p-2 flex items-center space-x-2\"
                      >
                        {file.category === 'image' ? (
                          <img src={file.url} alt={file.filename} className=\"w-12 h-12 object-cover rounded\" />
                        ) : (
                          <div className=\"w-12 h-12 flex items-center justify-center bg-corporate-600 text-white rounded\">
                            <FiPaperclip />
                          </div>
                        )}
                        <span className=\"text-sm truncate max-w-[100px] text-gray-700 dark:text-gray-300\">
                          {file.filename}
                        </span>
                        <button
                          onClick={() => removePendingFile(file.id)}
                          className=\"absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition\"
                        >
                          <FiX className=\"w-3 h-3\" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={sendMessage} className=\"flex items-center space-x-2\">
                  <button
                    type=\"button\"
                    onClick={() => setShowFileUpload(true)}
                    className=\"p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition\"
                    title=\"Attach file\"
                    data-testid=\"attach-file-button\"
                  >
                    <FiPaperclip className=\"w-5 h-5 text-gray-600 dark:text-gray-400\" />
                  </button>
                  <button
                    type=\"button\"
                    onClick={() => setShowGifPicker(true)}
                    className=\"p-2 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition\"
                    title=\"Send GIF\"
                    data-testid=\"gif-picker-button\"
                  >
                    <FiSmile className=\"w-5 h-5 text-gray-600 dark:text-gray-400\" />
                  </button>
                  <input
                    type=\"text\"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder=\"Type a message...\"
                    className=\"flex-1 px-4 py-2.5 border border-gray-300 dark:border-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporate-500 dark:bg-primary-700 dark:text-white\"
                    data-testid=\"message-input\"
                  />
                  <button
                    type=\"submit\"
                    disabled={!newMessage.trim() && pendingFiles.length === 0}
                    className=\"p-2.5 bg-corporate-600 text-white rounded-lg hover:bg-corporate-700 transition disabled:opacity-50 disabled:cursor-not-allowed\"
                    data-testid=\"send-message-button\"
                  >
                    <FiSend className=\"w-5 h-5\" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className=\"flex items-center justify-center h-full bg-gray-50 dark:bg-primary-900\">
              <div className=\"text-center\">
                <FiMessageSquare className=\"text-8xl mx-auto mb-4 text-gray-300 dark:text-gray-600\" />
                <p className=\"text-xl text-gray-500 dark:text-gray-400\">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\" data-testid=\"new-chat-modal\">
          <div className=\"bg-white dark:bg-primary-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6\">
            <h2 className=\"text-2xl font-bold mb-4 text-primary-900 dark:text-white\">New Chat</h2>
            
            <div className=\"mb-4\">
              <label className=\"block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300\">Select Users</label>
              <div className=\"space-y-2 max-h-60 overflow-y-auto\">
                {users.map((u) => (
                  <label key={u.id} className=\"flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-primary-700\">
                    <input
                      type=\"checkbox\"
                      checked={selectedUsers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, u.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                        }
                      }}
                      className=\"w-4 h-4 text-corporate-600\"
                    />
                    <div className=\"w-8 h-8 bg-gradient-to-br from-corporate-400 to-corporate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm\">
                      {u.full_name?.charAt(0)}
                    </div>
                    <span className=\"text-primary-900 dark:text-white\">{u.full_name}</span>
                    {isUserOnline(u.id) && (
                      <div className=\"w-2 h-2 bg-green-500 rounded-full ml-auto\"></div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {selectedUsers.length > 1 && (
              <div className=\"mb-4\">
                <label className=\"block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300\">Group Name</label>
                <input
                  type=\"text\"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder=\"Enter group name\"
                  className=\"w-full px-4 py-2 border border-gray-300 dark:border-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-corporate-500 dark:bg-primary-700 dark:text-white\"
                />
              </div>
            )}

            <div className=\"flex items-center space-x-3\">
              <button
                onClick={createChat}
                disabled={selectedUsers.length === 0}
                className=\"flex-1 px-4 py-2 bg-corporate-600 text-white rounded-lg hover:bg-corporate-700 transition disabled:opacity-50 disabled:cursor-not-allowed\"
                data-testid=\"create-chat-button\"
              >
                Create Chat
              </button>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedUsers([]);
                  setChatName('');
                }}
                className=\"flex-1 px-4 py-2 bg-gray-200 dark:bg-primary-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-primary-600 transition\"
                data-testid=\"cancel-chat-button\"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\" data-testid=\"incoming-call-modal\">
          <div className=\"bg-white dark:bg-primary-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center\">
            <div className=\"w-24 h-24 bg-gradient-to-br from-corporate-400 to-corporate-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4\">
              {incomingCall.from_user.full_name?.charAt(0)}
            </div>
            <h2 className=\"text-2xl font-bold mb-2 text-primary-900 dark:text-white\">
              {incomingCall.from_user.full_name}
            </h2>
            <p className=\"mb-6 text-gray-600 dark:text-gray-400\">
              Incoming {incomingCall.call_type} call...
            </p>
            <div className=\"flex items-center space-x-3\">
              <button
                onClick={acceptCall}
                className=\"flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold\"
                data-testid=\"accept-call-button\"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className=\"flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold\"
                data-testid=\"reject-call-button\"
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
          darkMode={false}
        />
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker
          onGifSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
          darkMode={false}
        />
      )}

      {/* Image Gallery */}
      {imageGallery && (
        <ImageGallery
          images={imageGallery.images}
          initialIndex={imageGallery.initialIndex}
          onClose={() => setImageGallery(null)}
          darkMode={false}
        />
      )}
    </Layout>
  );
}

export default Chat;
