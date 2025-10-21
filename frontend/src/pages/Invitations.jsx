import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import {
  FaEnvelope, FaCheck, FaTimes, FaClock,
  FaCheckCircle, FaTimesCircle, FaLayerGroup, FaCalendarAlt, FaUsers
} from 'react-icons/fa';

function Invitations() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

  useEffect(() => {
    fetchInvitations();
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      if (activeTab === 'received') {
        const response = await api.get('/api/invitations?sent=false');
        setInvitations(response.data);
      } else {
        const response = await api.get('/api/invitations?sent=true');
        setSentInvitations(response.data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      await api.post(`/api/invitations/${invitationId}/accept`);
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation');
    }
  };

  const handleReject = async (invitationId) => {
    try {
      await api.post(`/api/invitations/${invitationId}/reject`);
      fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation');
    }
  };

  const handleCancel = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await api.delete(`/api/invitations/${invitationId}`);
        fetchInvitations();
      } catch (error) {
        console.error('Error cancelling invitation:', error);
        alert('Failed to cancel invitation');
      }
    }
  };

  const getInvitationIcon = (type) => {
    switch (type) {
      case 'space':
        return <FaLayerGroup className="text-cyan-500" />;
      case 'event':
        return <FaCalendarAlt className="text-purple-500" />;
      case 'organization':
        return <FaUsers className="text-green-500" />;
      default:
        return <FaEnvelope className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center">
            <FaCheckCircle className="mr-1" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const currentInvitations = activeTab === 'received' ? invitations : sentInvitations;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
          Invitations
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage your invitations
        </p>
      </div>

      <div>
        {/* Tabs */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-2 mb-6`}>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                activeTab === 'received'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="received-tab"
            >
              Received Invitations
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                activeTab === 'sent'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              data-testid="sent-tab"
            >
              Sent Invitations
            </button>
          </div>
        </div>

        {/* Invitations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading invitations...</div>
          </div>
        ) : currentInvitations.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <FaEnvelope className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              No invitations found
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {activeTab === 'received' 
                ? "You don't have any pending invitations."
                : "You haven't sent any invitations yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition`}
                data-testid={`invitation-card-${invitation.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getInvitationIcon(invitation.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {invitation.type === 'space' && `Space Invitation: ${invitation.reference?.name || 'Space'}`}
                          {invitation.type === 'event' && 'Event Invitation'}
                          {invitation.type === 'organization' && 'Organization Invitation'}
                        </h3>
                        {getStatusBadge(invitation.status)}
                      </div>

                      <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-sm" />
                          <span className="text-sm">
                            {activeTab === 'received' ? 'From: ' : 'To: '}
                            <strong>
                              {activeTab === 'received' 
                                ? (invitation.inviter?.full_name || 'Unknown')
                                : (invitation.invitee?.full_name || invitation.invitee_email || 'Unknown')}
                            </strong>
                          </span>
                        </div>

                        {invitation.message && (
                          <div className="text-sm italic">
                            <span className="font-medium">Message:</span> {invitation.message}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Sent {new Date(invitation.created_at).toLocaleString()}
                        </div>

                        {invitation.expires_at && (
                          <div className="text-xs text-gray-500">
                            Expires {new Date(invitation.expires_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {invitation.status === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      {activeTab === 'received' ? (
                        <>
                          <button
                            onClick={() => handleAccept(invitation.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            data-testid={`accept-button-${invitation.id}`}
                          >
                            <FaCheck />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(invitation.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            data-testid={`reject-button-${invitation.id}`}
                          >
                            <FaTimes />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancel(invitation.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                          data-testid={`cancel-button-${invitation.id}`}
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Invitations;
