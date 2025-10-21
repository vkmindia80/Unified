import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FaArrowLeft, FaUsers, FaEdit, FaTrash, FaPlus, FaChartLine, FaComments, FaMedal, FaCog } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminPanel() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [view, setView] = useState('users'); // users, analytics

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`mr-2 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
              data-testid="back-button"
            >
              <FaArrowLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <FaUsers className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('users')}
              className={`px-4 py-2 rounded-lg transition ${view === 'users' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
              data-testid="users-view-button"
            >
              Users
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-lg transition ${view === 'analytics' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}
              data-testid="analytics-view-button"
            >
              Analytics
            </button>
            <button
              onClick={() => navigate('/admin/integrations')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              data-testid="integrations-button"
            >
              <FaCog />
              <span>Integrations</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'analytics' && analytics && (
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>System Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Total Users</p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{analytics.total_users}</p>
                  </div>
                  <FaUsers className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-green-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Online Users</p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{analytics.online_users}</p>
                  </div>
                  <FaChartLine className={`text-2xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-purple-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Total Messages</p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{analytics.total_messages}</p>
                  </div>
                  <FaComments className={`text-2xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-yellow-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Total Points</p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{analytics.total_points}</p>
                  </div>
                  <FaMedal className={`text-2xl ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
              </div>
            </div>

            <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Top Users</h3>
              <div className="space-y-3">
                {analytics.top_users.map((u, idx) => (
                  <div key={u.id} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>#{idx + 1}</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{u.full_name}</span>
                    </div>
                    <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{u.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading users...</p>
              </div>
            ) : (
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
                              onClick={() => setEditingUser(u)}
                              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
                              data-testid={`edit-user-${u.id}`}
                            >
                              <FaEdit className="inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
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
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="edit-user-modal">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit User</h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
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
                  value={editingUser.points}
                  onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => handleUpdateUser(editingUser.id, editingUser)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                data-testid="save-user-button"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                data-testid="cancel-edit-button"
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

export default AdminPanel;