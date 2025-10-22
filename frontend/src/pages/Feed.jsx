import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { FiBell, FiAlertCircle, FiCheckCircle, FiPlus, FiClock, FiUsers, FiFileText } from 'react-icons/fi';
import { FaBell, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Feed() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    
    try {
      console.log('Submitting announcement:', newAnnouncement);
      const response = await api.post('/announcements', newAnnouncement);
      console.log('Announcement created:', response.data);
      
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
      toast.success('📢 Announcement posted successfully!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.detail || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (announcementId) => {
    try {
      const response = await api.post(`/announcements/${announcementId}/acknowledge`, {});
      
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'low': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FiFileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Company Feed</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stay updated with company announcements</p>
            </div>
          </div>
          {canCreateAnnouncement && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              data-testid="create-announcement-button"
            >
              <FiPlus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <div className="flex space-x-2 flex-wrap">
          {['all', 'urgent', 'high', 'normal', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedPriority === priority
                  ? 'bg-corporate-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700'
              }`}
              data-testid={`filter-${priority}`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="text-center py-12">
            <FiBell className="text-6xl mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">
              No announcements yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Check back later for company updates
            </p>
          </Card>
        ) : (
          announcements.map(announcement => (
            <Card
              key={announcement.id}
              className="hover:shadow-lg transition-shadow"
              data-testid={`announcement-${announcement.id}`}
            >
              {/* Priority Badge & Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPriorityIcon(announcement.priority)}
                    <Badge variant={getPriorityBadge(announcement.priority)} size="sm">
                      {announcement.priority}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
                    {announcement.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <p className="mb-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {announcement.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-primary-700 flex-wrap gap-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-corporate-400 to-corporate-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {announcement.created_by_user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {announcement.created_by_user?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <FiClock className="w-4 h-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                  {announcement.requires_acknowledgement && (
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <FiUsers className="w-4 h-4" />
                      <span>{announcement.acknowledgement_count || 0} ✓</span>
                    </div>
                  )}
                </div>

                {announcement.requires_acknowledgement && (
                  <button
                    onClick={() => handleAcknowledge(announcement.id)}
                    disabled={announcement.acknowledged}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      announcement.acknowledged
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-corporate-600 to-corporate-700 text-white hover:shadow-lg'
                    }`}
                    data-testid={`acknowledge-button-${announcement.id}`}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>{announcement.acknowledged ? 'Acknowledged' : 'Got it!'}</span>
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="text-3xl">📢</div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Create Announcement
                </h2>
              </div>
              
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="e.g., Important Update"
                    required
                    disabled={submitting}
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
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Write your announcement message..."
                    required
                    disabled={submitting}
                    data-testid="announcement-content-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      disabled={submitting}
                      data-testid="announcement-priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Target Audience
                    </label>
                    <select
                      value={newAnnouncement.target_audience}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, target_audience: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      disabled={submitting}
                    >
                      <option value="all">Everyone</option>
                      <option value="department">Department</option>
                      <option value="team">Team</option>
                      <option value="role">Role</option>
                    </select>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    id="requireAck"
                    checked={newAnnouncement.requires_acknowledgement}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, requires_acknowledgement: e.target.checked})}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <label htmlFor="requireAck" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Require acknowledgement from team members
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="submit-announcement-button"
                  >
                    {submitting ? 'Posting...' : '📢 Post Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Feed;
