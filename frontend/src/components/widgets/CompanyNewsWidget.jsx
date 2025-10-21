import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaBullhorn } from 'react-icons/fa';

function CompanyNewsWidget() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/api/announcements');
      setAnnouncements(response.data.slice(0, 5)); // Show latest 5
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📌';
      case 'low': return '📝';
      default: return '📌';
    }
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          📢 Company News
        </h3>
        <button
          onClick={() => navigate('/feed')}
          className={`text-xs px-3 py-1 rounded-lg transition ${
            darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📢</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No announcements yet</p>
          </div>
        ) : (
          announcements.map(announcement => {
            const color = getPriorityColor(announcement.priority);
            return (
              <div
                key={announcement.id}
                className={`p-3 rounded-lg border-l-4 border-${color}-500 cursor-pointer transition ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => navigate('/feed')}
                data-testid={`announcement-${announcement.id}`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-xl">{getPriorityIcon(announcement.priority)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                      {announcement.title}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mt-1`}>
                      {announcement.content}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {formatDistanceToNow(parseISO(announcement.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CompanyNewsWidget;