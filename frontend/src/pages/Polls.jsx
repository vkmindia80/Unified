import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import CreatePollModal from '../components/CreatePollModal';
import PollCard from '../components/PollCard';
import PollResults from '../components/PollResults';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

const Polls = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'closed'

  useEffect(() => {
    fetchPolls();
  }, [filter]);

  useEffect(() => {
    if (socket) {
      socket.on('new_poll', (poll) => {
        setPolls(prev => [poll, ...prev]);
      });

      socket.on('poll_voted', ({ poll_id, total_votes }) => {
        setPolls(prev => prev.map(p => 
          p.id === poll_id ? { ...p, total_votes } : p
        ));
      });

      socket.on('poll_closed', ({ poll_id }) => {
        setPolls(prev => prev.map(p => 
          p.id === poll_id ? { ...p, status: 'closed' } : p
        ));
      });

      return () => {
        socket.off('new_poll');
        socket.off('poll_voted');
        socket.off('poll_closed');
      };
    }
  }, [socket]);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/api/polls`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollCreated = (newPoll) => {
    setPolls([newPoll, ...polls]);
    setShowCreateModal(false);
  };

  const handleVoteSubmitted = (pollId) => {
    fetchPolls(); // Refresh polls to update vote status
  };

  const handleViewResults = (poll) => {
    setSelectedPoll(poll);
    setShowResults(true);
  };

  const handleClosePoll = async (pollId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/polls/${pollId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPolls();
    } catch (error) {
      console.error('Error closing poll:', error);
      alert(error.response?.data?.detail || 'Failed to close poll');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(polls.filter(p => p.id !== pollId));
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert(error.response?.data?.detail || 'Failed to delete poll');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Polls & Surveys
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Participate in team polls and see what others think
              </p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                data-testid="create-poll-btn"
              >
                + Create Poll
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="filter-all"
            >
              All Polls
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'active'
                  ? 'bg-green-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="filter-active"
            >
              Active
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'closed'
                  ? 'bg-gray-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="filter-closed"
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <div className="text-6xl mb-4">📊</div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No polls available
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {user?.role === 'admin' ? 'Create your first poll to get started!' : 'Check back later for new polls!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6" data-testid="polls-list">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVoteSubmitted={handleVoteSubmitted}
                onViewResults={handleViewResults}
                onClosePoll={handleClosePoll}
                onDeletePoll={handleDeletePoll}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onPollCreated={handlePollCreated}
        />
      )}

      {/* Results Modal */}
      {showResults && selectedPoll && (
        <PollResults
          poll={selectedPoll}
          onClose={() => {
            setShowResults(false);
            setSelectedPoll(null);
          }}
        />
      )}
    </div>
  );
};

export default Polls;
