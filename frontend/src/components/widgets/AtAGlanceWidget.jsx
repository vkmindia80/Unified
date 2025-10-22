import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { FaUsers, FaComments, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

function AtAGlanceWidget() {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: <FaUsers className="text-2xl" />,
      label: 'Online Users',
      value: stats?.online_users || 0,
      color: 'green',
      bgColor: darkMode ? 'bg-green-900' : 'bg-green-50',
      textColor: darkMode ? 'text-green-400' : 'text-green-600'
    },
    {
      icon: <FaComments className="text-2xl" />,
      label: 'Messages (24h)',
      value: stats?.recent_messages_24h || 0,
      color: 'blue',
      bgColor: darkMode ? 'bg-blue-900' : 'bg-blue-50',
      textColor: darkMode ? 'text-blue-400' : 'text-blue-600'
    },
    {
      icon: <FaUsers className="text-2xl" />,
      label: 'Total Users',
      value: stats?.total_users || 0,
      color: 'purple',
      bgColor: darkMode ? 'bg-purple-900' : 'bg-purple-50',
      textColor: darkMode ? 'text-purple-400' : 'text-purple-600'
    },
    {
      icon: <FaCheckCircle className="text-2xl" />,
      label: 'Total Points',
      value: stats?.total_points?.toLocaleString() || 0,
      color: 'yellow',
      bgColor: darkMode ? 'bg-yellow-900' : 'bg-yellow-50',
      textColor: darkMode ? 'text-yellow-400' : 'text-yellow-600'
    }
  ];

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        📊 At a Glance
      </h3>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-4`}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`${stat.textColor} mb-2`}>
                  {stat.icon}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AtAGlanceWidget;