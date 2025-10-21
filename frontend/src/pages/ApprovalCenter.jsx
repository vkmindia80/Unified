import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import { 
  FaCheck, FaTimes, FaFilter, FaClock, 
  FaCheckCircle, FaTimesCircle, FaUsers, FaGift, FaFileAlt,
  FaUserPlus, FaLayerGroup
} from 'react-icons/fa';

function ApprovalCenter() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchApprovals();
  }, [filter, statusFilter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/api/approvals?${params.toString()}`);
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await api.put(`/api/approvals/${approvalId}/approve`, {
        status: 'approved',
        notes: 'Approved'
      });
      fetchApprovals();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (approvalId) => {
    const notes = prompt('Reason for rejection (optional):');
    try {
      await api.put(`/api/approvals/${approvalId}/reject`, {
        status: 'rejected',
        notes: notes || 'Rejected'
      });
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const getApprovalIcon = (type) => {
    switch (type) {
      case 'space_join':
        return <FaLayerGroup className="text-cyan-500" />;
      case 'user_registration':
        return <FaUserPlus className="text-green-500" />;
      case 'reward_redemption':
        return <FaGift className="text-pink-500" />;
      case 'content_approval':
        return <FaFileAlt className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getApprovalTitle = (approval) => {
    switch (approval.type) {
      case 'space_join':
        return `Join Request: ${approval.reference?.name || 'Space'}`;
      case 'user_registration':
        return `New User Registration: ${approval.reference?.full_name || 'User'}`;
      case 'reward_redemption':
        return `Reward Redemption: ${approval.details?.reward_name || 'Reward'}`;
      case 'content_approval':
        return `Content Approval: ${approval.reference_type}`;
      default:
        return 'Approval Request';
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
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center">
            <FaCheckCircle className="mr-1" /> Approved
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

  const canApproveReject = user?.role && ['admin', 'manager', 'department_head', 'team_lead'].includes(user.role);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
          Approval Center
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Review and manage approval requests
        </p>
      </div>

      <div>
        {/* Filters */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FaFilter className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Filters</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Approval Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Types</option>
                <option value="space_join">Space Join Requests</option>
                <option value="user_registration">User Registrations</option>
                <option value="reward_redemption">Reward Redemptions</option>
                <option value="content_approval">Content Approvals</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading approvals...</div>
          </div>
        ) : approvals.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <FaCheckCircle className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              No approvals found
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              There are no approval requests matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition`}
                data-testid={`approval-card-${approval.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getApprovalIcon(approval.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {getApprovalTitle(approval)}
                        </h3>
                        {getStatusBadge(approval.status)}
                      </div>

                      <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-sm" />
                          <span className="text-sm">
                            Requested by: <strong>{approval.requester?.full_name || 'Unknown'}</strong>
                          </span>
                        </div>

                        {approval.details && (
                          <div className="text-sm">
                            {approval.type === 'reward_redemption' && (
                              <div>
                                <span className="font-medium">Quantity:</span> {approval.details.quantity} × {approval.details.reward_cost} points
                                <span className="ml-2 font-bold">= {approval.details.total_cost} points</span>
                              </div>
                            )}
                          </div>
                        )}

                        {approval.notes && (
                          <div className="text-sm italic">
                            <span className="font-medium">Notes:</span> {approval.notes}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          {new Date(approval.created_at).toLocaleString()}
                        </div>

                        {approval.status !== 'pending' && approval.approver && (
                          <div className="text-sm mt-2 pt-2 border-t border-gray-700">
                            <span className="font-medium">
                              {approval.status === 'approved' ? 'Approved' : 'Rejected'} by:
                            </span>{' '}
                            {approval.approver.full_name}
                            {approval.approver_notes && (
                              <div className="italic text-xs mt-1">"{approval.approver_notes}"</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {approval.status === 'pending' && canApproveReject && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        data-testid={`approve-button-${approval.id}`}
                      >
                        <FaCheck />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        data-testid={`reject-button-${approval.id}`}
                      >
                        <FaTimes />
                        <span>Reject</span>
                      </button>
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

export default ApprovalCenter;
