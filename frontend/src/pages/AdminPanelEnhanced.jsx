import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import { 
  FaUsers, FaEdit, FaTrash, FaPlus, FaChartLine, FaComments, 
  FaMedal, FaCog, FaTrophy, FaFire, FaGift, FaCoins, FaBullhorn 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminPanelEnhanced() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [view, setView] = useState('dashboard'); // dashboard, users, achievements, challenges, rewards, announcements
  const [users, setUsers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [importingUsers, setImportingUsers] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(null);
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchAchievements(),
      fetchChallenges(),
      fetchRewards(),
      fetchAnalytics(),
      fetchDetailedStats()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/admin/achievements');
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      toast.error('Failed to fetch achievements');
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/admin/challenges');
      setChallenges(response.data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      toast.error('Failed to fetch challenges');
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await api.get('/admin/rewards');
      setRewards(response.data);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      toast.error('Failed to fetch rewards');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchDetailedStats = async () => {
    try {
      const response = await api.get('/admin/stats/detailed');
      setDetailedStats(response.data);
    } catch (error) {
      console.error('Failed to fetch detailed stats:', error);
    }
  };

  // User Management
  const handleCreateUser = async (userData) => {
    try {
      await api.post('/admin/users/create', userData);
      toast.success('User created successfully');
      fetchUsers();
      fetchAnalytics();
      setCreatingUser(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await api.put(`/admin/users/${userId}`, updates);
      toast.success('User updated successfully');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleImportCSV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/admin/users/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`Imported ${response.data.imported} users successfully!`);
      
      if (response.data.failed > 0) {
        toast.warning(`${response.data.failed} users failed to import. Check console for details.`);
        console.log('Failed imports:', response.data.details.failed);
      }
      
      fetchUsers();
      fetchAnalytics();
      setImportingUsers(false);
    } catch (error) {
      console.error('Failed to import users:', error);
      toast.error(error.response?.data?.detail || 'Failed to import users');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/admin/users/csv-template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleAdjustPoints = async (userId, points, reason) => {
    try {
      await api.post('/admin/points/adjust', { user_id: userId, points, reason });
      toast.success(`Points ${points > 0 ? 'awarded' : 'deducted'} successfully`);
      fetchUsers();
      fetchAnalytics();
      setShowPointsModal(null);
    } catch (error) {
      console.error('Failed to adjust points:', error);
      toast.error('Failed to adjust points');
    }
  };

  // Achievement Management
  const handleCreateAchievement = async (data) => {
    try {
      await api.post('/admin/achievements', data);
      toast.success('Achievement created successfully');
      fetchAchievements();
      setEditingAchievement(null);
    } catch (error) {
      console.error('Failed to create achievement:', error);
      toast.error('Failed to create achievement');
    }
  };

  const handleUpdateAchievement = async (achievementId, updates) => {
    try {
      await api.put(`/admin/achievements/${achievementId}`, updates);
      toast.success('Achievement updated successfully');
      fetchAchievements();
      setEditingAchievement(null);
    } catch (error) {
      console.error('Failed to update achievement:', error);
      toast.error('Failed to update achievement');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await api.delete(`/admin/achievements/${achievementId}`);
      toast.success('Achievement deleted successfully');
      fetchAchievements();
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  // Challenge Management
  const handleCreateChallenge = async (data) => {
    try {
      await api.post('/admin/challenges', data);
      toast.success('Challenge created successfully');
      fetchChallenges();
      setEditingChallenge(null);
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast.error('Failed to create challenge');
    }
  };

  const handleUpdateChallenge = async (challengeId, updates) => {
    try {
      await api.put(`/admin/challenges/${challengeId}`, updates);
      toast.success('Challenge updated successfully');
      fetchChallenges();
      setEditingChallenge(null);
    } catch (error) {
      console.error('Failed to update challenge:', error);
      toast.error('Failed to update challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      await api.delete(`/admin/challenges/${challengeId}`);
      toast.success('Challenge deleted successfully');
      fetchChallenges();
    } catch (error) {
      console.error('Failed to delete challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  // Reward Management
  const handleCreateReward = async (data) => {
    try {
      await api.post('/admin/rewards', data);
      toast.success('Reward created successfully');
      fetchRewards();
      setEditingReward(null);
    } catch (error) {
      console.error('Failed to create reward:', error);
      toast.error('Failed to create reward');
    }
  };

  const handleUpdateReward = async (rewardId, updates) => {
    try {
      await api.put(`/admin/rewards/${rewardId}`, updates);
      toast.success('Reward updated successfully');
      fetchRewards();
      setEditingReward(null);
    } catch (error) {
      console.error('Failed to update reward:', error);
      toast.error('Failed to update reward');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await api.delete(`/admin/rewards/${rewardId}`);
      toast.success('Reward deleted successfully');
      fetchRewards();
    } catch (error) {
      console.error('Failed to delete reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 mb-2">
            <FaCog className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Control Panel</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
          { id: 'users', label: 'Users', icon: FaUsers },
          { id: 'achievements', label: 'Achievements', icon: FaTrophy },
          { id: 'challenges', label: 'Challenges', icon: FaFire },
          { id: 'rewards', label: 'Rewards', icon: FaGift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              view === tab.id 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            data-testid={`${tab.id}-tab`}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => navigate('/admin/integrations')}
          className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ml-auto ${
            darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          data-testid="integrations-button"
        >
          <FaCog />
          <span>Integrations</span>
        </button>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && detailedStats && analytics && (
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>System Overview</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={detailedStats.total_users}
              icon={FaUsers}
              color="blue"
              darkMode={darkMode}
            />
            <StatCard
              title="Online Now"
              value={analytics.online_users}
              icon={FaChartLine}
              color="green"
              darkMode={darkMode}
            />
            <StatCard
              title="Total Messages"
              value={detailedStats.total_messages}
              icon={FaComments}
              color="purple"
              darkMode={darkMode}
            />
            <StatCard
              title="Total Points"
              value={analytics.total_points}
              icon={FaMedal}
              color="yellow"
              darkMode={darkMode}
            />
          </div>

          {/* Gamification Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Achievements"
              value={`${detailedStats.total_achievement_unlocks} / ${detailedStats.total_achievements}`}
              subtitle="Unlocks / Total"
              icon={FaTrophy}
              color="orange"
              darkMode={darkMode}
            />
            <StatCard
              title="Active Challenges"
              value={`${detailedStats.active_challenges} / ${detailedStats.total_challenges}`}
              subtitle="Active / Total"
              icon={FaFire}
              color="red"
              darkMode={darkMode}
            />
            <StatCard
              title="Rewards Redeemed"
              value={detailedStats.total_reward_redemptions}
              icon={FaGift}
              color="pink"
              darkMode={darkMode}
            />
          </div>

          {/* Users by Role */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Users by Role</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(detailedStats.users_by_role).map(([role, count]) => (
                <div key={role} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{role.replace('_', ' ')}</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Top Performers</h3>
            <div className="space-y-3">
              {analytics.top_users.map((u, idx) => (
                <div key={u.id} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>#{idx + 1}</span>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{u.full_name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{u.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users View */}
      {view === 'users' && <UsersView users={users} darkMode={darkMode} onEdit={setEditingUser} onDelete={handleDeleteUser} onAdjustPoints={setShowPointsModal} onCreate={() => setCreatingUser(true)} onImport={() => setImportingUsers(true)} />}

      {/* Achievements View */}
      {view === 'achievements' && <AchievementsView achievements={achievements} darkMode={darkMode} onEdit={setEditingAchievement} onDelete={handleDeleteAchievement} onCreate={() => setEditingAchievement({})} />}

      {/* Challenges View */}
      {view === 'challenges' && <ChallengesView challenges={challenges} darkMode={darkMode} onEdit={setEditingChallenge} onDelete={handleDeleteChallenge} onCreate={() => setEditingChallenge({})} />}

      {/* Rewards View */}
      {view === 'rewards' && <RewardsView rewards={rewards} darkMode={darkMode} onEdit={setEditingReward} onDelete={handleDeleteReward} onCreate={() => setEditingReward({})} />}

      {/* Modals */}
      {creatingUser && <CreateUserModal darkMode={darkMode} onSave={handleCreateUser} onClose={() => setCreatingUser(false)} />}
      {importingUsers && <ImportUsersModal darkMode={darkMode} onImport={handleImportCSV} onDownloadTemplate={handleDownloadTemplate} onClose={() => setImportingUsers(false)} />}
      {editingUser && <EditUserModal user={editingUser} darkMode={darkMode} onSave={handleUpdateUser} onClose={() => setEditingUser(null)} />}
      {editingAchievement !== null && <EditAchievementModal achievement={editingAchievement} darkMode={darkMode} onSave={editingAchievement.id ? handleUpdateAchievement : handleCreateAchievement} onClose={() => setEditingAchievement(null)} />}
      {editingChallenge !== null && <EditChallengeModal challenge={editingChallenge} darkMode={darkMode} onSave={editingChallenge.id ? handleUpdateChallenge : handleCreateChallenge} onClose={() => setEditingChallenge(null)} />}
      {editingReward !== null && <EditRewardModal reward={editingReward} darkMode={darkMode} onSave={editingReward.id ? handleUpdateReward : handleCreateReward} onClose={() => setEditingReward(null)} />}
      {showPointsModal && <PointsAdjustmentModal user={showPointsModal} darkMode={darkMode} onSave={handleAdjustPoints} onClose={() => setShowPointsModal(null)} />}
    </Layout>
  );
}

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, darkMode }) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-400',
    green: 'border-green-500 text-green-400',
    purple: 'border-purple-500 text-purple-400',
    yellow: 'border-yellow-500 text-yellow-400',
    orange: 'border-orange-500 text-orange-400',
    red: 'border-red-500 text-red-400',
    pink: 'border-pink-500 text-pink-400',
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
        </div>
        <Icon className={`text-3xl ${colorClasses[color].split(' ')[1]}`} />
      </div>
    </div>
  );
};

// Users View Component
const UsersView = ({ users, darkMode, onEdit, onDelete, onAdjustPoints, onCreate, onImport }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
      <div className="flex items-center space-x-3">
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{users.length} total users</span>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
          data-testid="create-user-button"
        >
          <FaPlus />
          <span>Create User</span>
        </button>
        <button
          onClick={onImport}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
          data-testid="import-users-button"
        >
          <FaUsers />
          <span>Import Users</span>
        </button>
      </div>
    </div>

    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Role</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Points</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {users.map((u) => (
              <tr key={u.id} data-testid={`user-row-${u.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {u.full_name?.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.full_name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    u.status === 'online' ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : 
                    (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.points}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => onEdit(u)}
                    className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
                    data-testid={`edit-user-${u.id}`}
                  >
                    <FaEdit className="inline" />
                  </button>
                  <button
                    onClick={() => onAdjustPoints(u)}
                    className={`${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'}`}
                    title="Adjust Points"
                  >
                    <FaCoins className="inline" />
                  </button>
                  <button
                    onClick={() => onDelete(u.id)}
                    className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                    data-testid={`delete-user-${u.id}`}
                  >
                    <FaTrash className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Achievements View Component
const AchievementsView = ({ achievements, darkMode, onEdit, onDelete, onCreate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Achievement Management</h2>
      <button
        onClick={onCreate}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
        data-testid="create-achievement-button"
      >
        <FaPlus />
        <span>Create Achievement</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement) => (
        <div key={achievement.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{achievement.icon}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(achievement)}
                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(achievement.id)}
                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{achievement.name}</h3>
          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.description}</p>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
              {achievement.points} pts
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {achievement.unlock_count || 0} unlocks
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Challenges View Component
const ChallengesView = ({ challenges, darkMode, onEdit, onDelete, onCreate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Challenge Management</h2>
      <button
        onClick={onCreate}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
        data-testid="create-challenge-button"
      >
        <FaPlus />
        <span>Create Challenge</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {challenges.map((challenge) => (
        <div key={challenge.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{challenge.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                challenge.active 
                  ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                  : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
              }`}>
                {challenge.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(challenge)}
                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(challenge.id)}
                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{challenge.description}</p>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Target: <strong>{challenge.target}</strong>
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
              {challenge.points} pts
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Rewards View Component
const RewardsView = ({ rewards, darkMode, onEdit, onDelete, onCreate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Reward Management</h2>
      <button
        onClick={onCreate}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
        data-testid="create-reward-button"
      >
        <FaPlus />
        <span>Create Reward</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map((reward) => (
        <div key={reward.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{reward.icon}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(reward)}
                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDelete(reward.id)}
                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reward.name}</h3>
          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{reward.description}</p>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
              {reward.cost} pts
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Stock: {reward.stock}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              reward.active 
                ? (darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
            }`}>
              {reward.active ? 'Active' : 'Inactive'}
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {reward.redemption_count || 0} redeemed
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Edit User Modal
const EditUserModal = ({ user, darkMode, onSave, onClose }) => {
  const [formData, setFormData] = useState(user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="edit-user-modal">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit User</h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="employee">Employee</option>
              <option value="team_lead">Team Lead</option>
              <option value="manager">Manager</option>
              <option value="department_head">Department Head</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => onSave(formData.id, formData)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            data-testid="save-user-button"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            data-testid="cancel-edit-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Points Adjustment Modal
const PointsAdjustmentModal = ({ user, darkMode, onSave, onClose }) => {
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Adjust Points</h2>
        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          User: <strong>{user.full_name}</strong> (Current: {user.points} pts)
        </p>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              placeholder="Enter positive to add, negative to deduct"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Bonus for excellent work"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => onSave(user.id, points, reason)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            disabled={!reason || points === 0}
          >
            Adjust Points
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Achievement Modal
const EditAchievementModal = ({ achievement, darkMode, onSave, onClose }) => {
  const [formData, setFormData] = useState(achievement.id ? achievement : {
    name: '',
    description: '',
    icon: '🏆',
    points: 100,
    type: 'milestone'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {achievement.id ? 'Edit Achievement' : 'Create Achievement'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              rows="3"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="milestone">Milestone</option>
              <option value="social">Social</option>
              <option value="activity">Activity</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => achievement.id ? onSave(formData.id, formData) : onSave(formData)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {achievement.id ? 'Save Changes' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Challenge Modal
const EditChallengeModal = ({ challenge, darkMode, onSave, onClose }) => {
  const [formData, setFormData] = useState(challenge.id ? challenge : {
    name: '',
    description: '',
    points: 100,
    target: 10,
    type: 'messages',
    active: true
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {challenge.id ? 'Edit Challenge' : 'Create Challenge'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              rows="3"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Target</label>
            <input
              type="number"
              value={formData.target}
              onChange={(e) => setFormData({...formData, target: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points Reward</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="messages">Messages</option>
              <option value="participation">Participation</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active</label>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => challenge.id ? onSave(formData.id, formData) : onSave(formData)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {challenge.id ? 'Save Changes' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Reward Modal
const EditRewardModal = ({ reward, darkMode, onSave, onClose }) => {
  const [formData, setFormData] = useState(reward.id ? reward : {
    name: '',
    description: '',
    cost: 100,
    icon: '🎁',
    category: 'merchandise',
    active: true,
    stock: 100
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {reward.id ? 'Edit Reward' : 'Create Reward'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              rows="3"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cost (Points)</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            >
              <option value="food">Food</option>
              <option value="time-off">Time Off</option>
              <option value="perks">Perks</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active</label>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-6">
          <button
            onClick={() => reward.id ? onSave(formData.id, formData) : onSave(formData)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {reward.id ? 'Save Changes' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelEnhanced;
