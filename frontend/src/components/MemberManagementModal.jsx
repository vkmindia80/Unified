import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FaTimes, FaUsers, FaUserPlus, FaUserMinus, FaUserShield, FaUser,
  FaEnvelope, FaSearch
} from 'react-icons/fa';

function MemberManagementModal({ spaceId, spaceName, isOpen, onClose, onUpdate }) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'add'

  useEffect(() => {
    if (isOpen && spaceId) {
      fetchMembers();
      fetchAllUsers();
    }
  }, [isOpen, spaceId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/spaces/${spaceId}/members`);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.post(`/api/spaces/${spaceId}/members/${userId}`);
      await fetchMembers();
      if (onUpdate) onUpdate();
      alert('Member added successfully!');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await api.delete(`/api/spaces/${spaceId}/members/${userId}`);
        await fetchMembers();
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member');
      }
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'member' : 'admin';
      await api.put(`/api/spaces/${spaceId}/members/${userId}/role`, { role: newRole });
      await fetchMembers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Failed to update member role');
    }
  };

  const handleInviteMember = async (userId) => {
    try {
      await api.post('/api/invitations', {
        type: 'space',
        invitee_user_id: userId,
        reference_id: spaceId,
        message: `You've been invited to join ${spaceName}`
      });
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = allUsers.filter(
    (u) =>
      !members.some((m) => m.id === u.id) &&
      (u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUsers className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Member Management
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{spaceName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-4 font-medium transition ${
              activeTab === 'members'
                ? `border-b-2 ${darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'}`
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 font-medium transition ${
              activeTab === 'add'
                ? `border-b-2 ${darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'}`
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Add Members
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading...</div>
            </div>
          ) : activeTab === 'members' ? (
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No members found</p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {member.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {member.full_name}
                          {member.space_role === 'admin' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded">Admin</span>
                          )}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {member.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(member.id, member.space_role)}
                            className={`p-2 rounded-lg transition ${
                              darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title={member.space_role === 'admin' ? 'Demote to member' : 'Promote to admin'}
                          >
                            {member.space_role === 'admin' ? <FaUserShield /> : <FaUser />}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 rounded-lg transition text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                            title="Remove member"
                          >
                            <FaUserMinus />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No users available to add</p>
                </div>
              ) : (
                availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {user.full_name}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddMember(user.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        <FaUserPlus />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => handleInviteMember(user.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                      >
                        <FaEnvelope />
                        <span>Invite</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberManagementModal;
