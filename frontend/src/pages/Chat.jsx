import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaComments, FaPlus, FaSearch, FaPaperPlane, FaVideo, FaPhone } from 'react-icons/fa';

function Chat() {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchChats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/api/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/api/chats/${chatId}/messages`);
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
      
      const response = await api.post('/api/chats', chatData);
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
    if (!newMessage.trim() || !selectedChat) return;

    try {
      // In a real app, this would use Socket.IO
      // For now, we'll just add it locally
      const tempMessage = {
        id: Date.now().toString(),
        chat_id: selectedChat.id,
        sender_id: user.id,
        content: newMessage,
        type: 'text',
        created_at: new Date().toISOString(),
        sender: user
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-2 p-2 hover:bg-gray-100 rounded-lg transition"
              data-testid="back-button"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <FaComments className="text-3xl text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Chat List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                data-testid="search-chat-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaComments className="text-5xl mx-auto mb-3 text-gray-300" />
              <p>No chats yet</p>
              <p className="text-sm mt-2">Start a new conversation!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  data-testid={`chat-item-${chat.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {getChatName(chat).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{getChatName(chat)}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-direction="column">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {getChatName(selectedChat).charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{getChatName(selectedChat)}</p>
                      <p className="text-sm text-gray-500">
                        {selectedChat.participants?.length || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-3 hover:bg-gray-100 rounded-lg transition" title="Voice Call">
                      <FaPhone className="text-gray-600" />
                    </button>
                    <button className="p-3 hover:bg-gray-100 rounded-lg transition" title="Video Call">
                      <FaVideo className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="messages-container">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FaComments className="text-6xl mx-auto mb-3 text-gray-300" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      data-testid="message-item"
                    >
                      <div className={`max-w-md ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800'
                      } rounded-lg px-4 py-2 shadow`}>
                        {message.sender_id !== user?.id && (
                          <p className="text-xs font-semibold mb-1">{message.sender?.full_name}</p>
                        )}
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    data-testid="message-input"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    data-testid="send-message-button"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center text-gray-500">
                <FaComments className="text-8xl mx-auto mb-4 text-gray-300" />
                <p className="text-xl">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="new-chat-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">New Chat</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                    <span className="text-gray-800">{u.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedUsers.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                data-testid="cancel-chat-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;