import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FaBell, FaExclamationCircle, FaCheckCircle, FaPlus, FaArrowLeft, FaClock, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Feed() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_audience: 'all',
    target_value: '',
    expires_at: '',
    requires_acknowledgement: true
  });

  useEffect(() => {
    fetchAnnouncements();

    // Listen for real-time updates
    if (socket) {
      socket.on('new_announcement', handleNewAnnouncement);
      socket.on('announcement_acknowledged', handleAnnouncementAcknowledged);
    }

    return () => {
      if (socket) {
        socket.off('new_announcement', handleNewAnnouncement);
        socket.off('announcement_acknowledged', handleAnnouncementAcknowledged);
      }
    };
  }, [socket, selectedPriority]);

  const handleNewAnnouncement = (announcement) => {
    setAnnouncements(prev => [announcement, ...prev]);
    toast.info('New announcement posted!', { icon: '📢' });
  };

  const handleAnnouncementAcknowledged = (data) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === data.announcement_id 
        ? { ...a, acknowledgement_count: data.acknowledgement_count }
        : a
    ));
  };

  const fetchAnnouncements = async () => {
    try {
      const params = selectedPriority !== 'all' ? { priority: selectedPriority } : {};
      const response = await api.get('/announcements', { params });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/announcements', newAnnouncement);
      setAnnouncements([response.data, ...announcements]);
      setShowCreateModal(false);
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal',
        target_audience: 'all',
        target_value: '',
        expires_at: '',
        requires_acknowledgement: true
      });
      toast.success('Announcement created successfully!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleAcknowledge = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/announcements/${announcementId}/acknowledge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId 
          ? { ...a, acknowledged: true, acknowledgement_count: (a.acknowledgement_count || 0) + 1 }
          : a
      ));
      
      toast.success(`+${response.data.points_awarded} points! Announcement acknowledged`);
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'normal': return 'from-blue-500 to-blue-600';
      case 'low': return 'from-gray-500 to-gray-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <FaExclamationCircle className="text-red-500" />;
      case 'high': return <FaExclamationCircle className="text-orange-500" />;
      default: return <FaBell className="text-blue-500" />;
    }
  };

  const canCreateAnnouncement = user?.role && ['admin', 'manager', 'department_head', 'team_lead'].includes(user.role);

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
                  📢 Company Feed
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stay updated with company announcements
                </p>
              </div>
            </div>
            {canCreateAnnouncement && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                data-testid="create-announcement-button"
              >
                <FaPlus />
                <span>New Announcement</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {['all', 'urgent', 'high', 'normal', 'low'].map(priority => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`py-3 px-4 font-medium border-b-2 transition whitespace-nowrap ${
                  selectedPriority === priority
                    ? `${darkMode ? 'border-blue-500 text-blue-500' : 'border-blue-600 text-blue-600'}`
                    : `${darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                }`}
                data-testid={`filter-${priority}`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {announcements.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <FaBell className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No announcements yet
            </h3>
            <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
              Check back later for company updates
            </p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition hover:shadow-xl`}
              data-testid={`announcement-${announcement.id}`}
            >
              {/* Priority Badge */}
              <div className={`h-2 bg-gradient-to-r ${getPriorityColor(announcement.priority)}`} />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {announcement.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <p className={`mb-4 whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {announcement.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <img
                        src={announcement.created_by_user?.avatar || `https://ui-avatars.com/api/?name=${announcement.created_by_user?.full_name || 'User'}&background=random`}
                        alt={announcement.created_by_user?.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {announcement.created_by_user?.full_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <FaClock />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                    {announcement.requires_acknowledgement && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <FaUsers />
                        <span>{announcement.acknowledgement_count || 0} acknowledged</span>
                      </div>
                    )}
                  </div>

                  {announcement.requires_acknowledgement && (
                    <button
                      onClick={() => handleAcknowledge(announcement.id)}
                      disabled={announcement.acknowledged}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        announcement.acknowledged
                          ? `${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'} cursor-not-allowed`
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      }`}
                      data-testid={`acknowledge-button-${announcement.id}`}
                    >
                      <FaCheckCircle />
                      <span>{announcement.acknowledged ? 'Acknowledged' : 'Got it!'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Create Announcement
              </h2>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    required
                    data-testid="announcement-title-input"
                  />
                </div>

                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message *
                  </label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    rows={6}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    required
                    data-testid="announcement-content-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      data-testid="announcement-priority-select"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Audience
                    </label>
                    <select
                      value={newAnnouncement.target_audience}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, target_audience: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">Everyone</option>
                      <option value="department">Department</option>
                      <option value="team">Team</option>
                      <option value="role">Role</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireAck"
                    checked={newAnnouncement.requires_acknowledgement}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, requires_acknowledgement: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="requireAck" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Require acknowledgement
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition"
                    data-testid="submit-announcement-button"
                  >
                    Post Announcement
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

export default Feed;
