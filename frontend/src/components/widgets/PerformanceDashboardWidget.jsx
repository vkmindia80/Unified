import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaTrophy, FaComments, FaMedal, FaChartLine } from 'react-icons/fa';

function PerformanceDashboardWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [myPerformance, setMyPerformance] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const [myRes, teamRes] = await Promise.all([
        api.get('/api/performance/me'),
        api.get('/api/performance/team')
      ]);
      setMyPerformance(myRes.data);
      setTeamPerformance(teamRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading performance data...</p>
        </div>
      </div>
    );
  }

  const chartData = teamPerformance?.members?.slice(0, 5).map(member => ({
    name: member.full_name.split(' ')[0],
    points: member.points,
    messages: member.messages_sent,
    achievements: member.achievements
  })) || [];

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        📊 Performance Dashboard
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* My Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <FaTrophy className={`text-lg ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Points</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {myPerformance?.total_points || 0}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <FaChartLine className={`text-lg ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rank</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              #{myPerformance?.rank || '-'}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <FaComments className={`text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Messages</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {myPerformance?.messages_sent || 0}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-pink-50'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <FaMedal className={`text-lg ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Achievements</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {myPerformance?.achievements_unlocked || 0}
            </p>
          </div>
        </div>

        {/* Team Comparison Chart */}
        <div className="mt-4">
          <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Team Comparison - {teamPerformance?.team || 'All Users'}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Bar dataKey="points" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Last 30 Days */}
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
          <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
            Points Earned (Last 30 Days)
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            +{myPerformance?.points_last_30_days || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboardWidget;