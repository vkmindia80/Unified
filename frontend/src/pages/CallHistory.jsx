import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaPhone, FaVideo, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function CallHistory() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await api.get('/calls/history');
      setCalls(response.data);
    } catch (error) {
      console.error('Failed to fetch call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = (call) => {
    return call.participants_data?.find(p => p.id !== user?.id);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FaPhone className={`text-3xl ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Call History</h1>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Review your call history
        </p>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading call history...</p>
          </div>
        ) : calls.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <FaPhone className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>No Call History</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Your call history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => {
              const otherParticipant = getOtherParticipant(call);
              return (
                <div
                  key={call.id}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition`}
                  data-testid={`call-item-${call.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Call Type Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        call.type === 'video' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {call.type === 'video' ? (
                          <FaVideo className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        ) : (
                          <FaPhone className={`text-2xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        )}
                      </div>

                      {/* Participant Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {otherParticipant?.full_name || 'Unknown'}
                          </h3>
                          {call.status === 'completed' && (
                            <FaCheckCircle className="text-green-500" title="Completed" />
                          )}
                          {(call.status === 'missed' || call.status === 'rejected') && (
                            <FaTimesCircle className="text-red-500" title={call.status} />
                          )}
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {call.type === 'video' ? 'Video Call' : 'Voice Call'}
                        </p>
                      </div>
                    </div>

                    {/* Call Details */}
                    <div className="text-right">
                      <div className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaClock />
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(call.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CallHistory;