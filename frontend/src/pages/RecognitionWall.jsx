import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { FaHeart, FaComment, FaPlus, FaArrowLeft, FaTrophy, FaStar, FaHandsHelping, FaLightbulb, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

const categories = [
  { id: 'teamwork', label: 'Teamwork', icon: <FaHandsHelping />, color: 'text-blue-500' },
  { id: 'innovation', label: 'Innovation', icon: <FaLightbulb />, color: 'text-yellow-500' },
  { id: 'leadership', label: 'Leadership', icon: <FaCrown />, color: 'text-purple-500' },
  { id: 'excellence', label: 'Excellence', icon: <FaTrophy />, color: 'text-green-500' },
  { id: 'helpful', label: 'Helpful', icon: <FaStar />, color: 'text-pink-500' }
];

function RecognitionWall() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [recognitions, setRecognitions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [commentText, setCommentText] = useState({});
  const [newRecognition, setNewRecognition] = useState({
    recognized_user_id: '',
    category: 'teamwork',
    message: '',
    is_public: true
  });

  useEffect(() => {
    fetchRecognitions();
    fetchUsers();

    // Listen for real-time updates
    if (socket) {
      socket.on('new_recognition', handleNewRecognition);
      socket.on('recognition_liked', handleRecognitionLiked);
      socket.on('recognition_commented', handleRecognitionCommented);
    }

    return () => {
      if (socket) {
        socket.off('new_recognition', handleNewRecognition);
        socket.off('recognition_liked', handleRecognitionLiked);
        socket.off('recognition_commented', handleRecognitionCommented);
      }
    };
  }, [socket, selectedCategory]);

  const handleNewRecognition = (recognition) => {
    setRecognitions(prev => [recognition, ...prev]);
    toast.success('New recognition posted!', { icon: '🎉' });
  };

  const handleRecognitionLiked = (data) => {
    setRecognitions(prev => prev.map(r => 
      r.id === data.recognition_id 
        ? { ...r, like_count: data.like_count, liked_by_me: data.user_id === user?.id }
        : r
    ));
  };

  const handleRecognitionCommented = (data) => {
    setRecognitions(prev => prev.map(r => 
      r.id === data.recognition_id 
        ? { 
            ...r, 
            comments: [...(r.comments || []), data.comment],
            comment_count: (r.comment_count || 0) + 1
          }
        : r
    ));
  };

  const fetchRecognitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await axios.get(`${API_URL}/api/recognitions`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setRecognitions(response.data);
    } catch (error) {
      console.error('Error fetching recognitions:', error);
      toast.error('Failed to load recognitions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateRecognition = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/recognitions`,
        newRecognition,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecognitions([response.data, ...recognitions]);
      setShowCreateModal(false);
      setNewRecognition({
        recognized_user_id: '',
        category: 'teamwork',
        message: '',
        is_public: true
      });
      toast.success('Recognition posted! +5 points');
    } catch (error) {
      console.error('Error creating recognition:', error);
      toast.error('Failed to create recognition');
    }
  };

  const handleLike = async (recognitionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/recognitions/${recognitionId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error liking recognition:', error);
    }
  };

  const handleComment = async (recognitionId) => {
    const comment = commentText[recognitionId];
    if (!comment || !comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/recognitions/${recognitionId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText({ ...commentText, [recognitionId]: '' });
      toast.success('+2 points for commenting!');
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                data-testid="back-button"
              >
                <FaArrowLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🏆 Recognition Wall
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Celebrate team achievements
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              data-testid="create-recognition-button"
            >
              <FaPlus />
              <span>Recognize Someone</span>
            </button>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto py-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`py-2 px-4 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
                }`}
                data-testid={`filter-${category.id}`}
              >
                <span className={selectedCategory === category.id ? 'text-white' : category.color}>
                  {category.icon}
                </span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recognitions List */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {recognitions.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <FaTrophy className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No recognitions yet
            </h3>
            <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
              Be the first to recognize someone's great work!
            </p>
          </div>
        ) : (
          recognitions.map(recognition => {
            const categoryInfo = getCategoryInfo(recognition.category);
            return (
              <div
                key={recognition.id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition hover:shadow-xl`}
                data-testid={`recognition-${recognition.id}`}
              >
                {/* Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={recognition.recognizer?.avatar || `https://ui-avatars.com/api/?name=${recognition.recognizer?.full_name || 'User'}&background=random`}
                    alt={recognition.recognizer?.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-semibold">{recognition.recognizer?.full_name}</span>
                      {' recognized '}
                      <span className="font-semibold">{recognition.recognized_user?.full_name}</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`flex items-center space-x-1 text-sm ${categoryInfo.color}`}>
                        {categoryInfo.icon}
                        <span>{categoryInfo.label}</span>
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        • {new Date(recognition.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {recognition.message}
                </p>

                {/* Actions */}
                <div className={`flex items-center space-x-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => handleLike(recognition.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      recognition.liked_by_me
                        ? 'bg-pink-100 text-pink-600'
                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                    data-testid={`like-button-${recognition.id}`}
                  >
                    <FaHeart className={recognition.liked_by_me ? 'text-pink-600' : ''} />
                    <span>{recognition.like_count || 0}</span>
                  </button>
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaComment />
                    <span>{recognition.comment_count || 0}</span>
                  </button>
                </div>

                {/* Comments */}
                {recognition.comments && recognition.comments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {recognition.comments.map(comment => (
                      <div key={comment.id} className={`flex space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <img
                          src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.full_name || 'User'}&background=random`}
                          alt={comment.user?.full_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {comment.user?.full_name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={commentText[recognition.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [recognition.id]: e.target.value })}
                    placeholder="Add a comment..."
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(recognition.id)}
                    data-testid={`comment-input-${recognition.id}`}
                  />
                  <button
                    onClick={() => handleComment(recognition.id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                    data-testid={`submit-comment-${recognition.id}`}
                  >
                    Post
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Recognition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-lg w-full`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Recognize Someone
              </h2>
              <form onSubmit={handleCreateRecognition} className="space-y-4">
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Who do you want to recognize? *
                  </label>
                  <select
                    value={newRecognition.recognized_user_id}
                    onChange={(e) => setNewRecognition({...newRecognition, recognized_user_id: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                    data-testid="recognized-user-select"
                  >
                    <option value="">Select a team member</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewRecognition({...newRecognition, category: category.id})}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition ${
                          newRecognition.category === category.id
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900'
                            : `border-gray-300 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
                        }`}
                        data-testid={`category-${category.id}`}
                      >
                        <span className={category.color}>{category.icon}</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message *
                  </label>
                  <textarea
                    value={newRecognition.message}
                    onChange={(e) => setNewRecognition({...newRecognition, message: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Describe what they did that deserves recognition..."
                    required
                    data-testid="recognition-message-input"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition"
                    data-testid="submit-recognition-button"
                  >
                    Post Recognition
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-2 rounded-lg transition`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognitionWall;
