import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaComments, FaTrophy, FaMedal, FaTasks, FaGift, FaSignOutAlt, FaChartLine, FaUsers, FaMoon, FaSun, FaUserShield, FaPhone, FaBell, FaLayerGroup } from 'react-icons/fa';

function Dashboard() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      icon: <FaComments className="text-4xl text-blue-600" />,
      title: 'Chat & Communication',
      description: 'Real-time messaging, video calls, file sharing',
      path: '/chat',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <FaLayerGroup className="text-4xl text-cyan-600" />,
      title: 'Spaces & Channels',
      description: 'Organized workspaces with subspaces and channels',
      path: '/spaces',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: <FaBell className="text-4xl text-indigo-600" />,
      title: 'Company Feed',
      description: 'Announcements and company updates',
      path: '/feed',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: <FaTrophy className="text-4xl text-pink-600" />,
      title: 'Recognition Wall',
      description: 'Celebrate team achievements and shout-outs',
      path: '/recognition',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: <FaTrophy className="text-4xl text-yellow-600" />,
      title: 'Leaderboard',
      description: 'See top performers and rankings',
      path: '/leaderboard',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <FaMedal className="text-4xl text-purple-600" />,
      title: 'Achievements',
      description: 'Unlock badges and earn rewards',
      path: '/achievements',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <FaTasks className="text-4xl text-green-600" />,
      title: 'Challenges',
      description: 'Complete quests and earn points',
      path: '/challenges',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FaGift className="text-4xl text-pink-600" />,
      title: 'Rewards',
      description: 'Redeem your points for rewards',
      path: '/rewards',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: <FaUserShield className="text-4xl text-indigo-600" />,
      title: 'Admin Panel',
      description: 'Manage users and system analytics',
      path: '/admin',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: <FaPhone className="text-4xl text-teal-600" />,
      title: 'Call History',
      description: 'View your call logs and history',
      path: '/calls',
      color: 'from-teal-500 to-teal-600'
    },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome, {user?.full_name}!</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role} • {user?.department || 'No department'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              data-testid="theme-toggle-button"
            >
              {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              data-testid="logout-button"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Total Points</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.points || 0}</p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                <FaChartLine className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Current Level</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.level || 1}</p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                <FaMedal className={`text-2xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Status</p>
                <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'} capitalize`}>{user?.status || 'Active'}</p>
              </div>
              <div className={`w-12 h-12 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                <FaUsers className={`text-2xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Explore Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.path)}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200`}
                data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold mb-1">Start Chatting</h4>
                <p className="text-blue-100 text-sm">Connect with team members and earn +5 points per message</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-semibold mb-1">Climb the Leaderboard</h4>
                <p className="text-blue-100 text-sm">Complete activities to earn points and rank higher</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold mb-1">Complete Challenges</h4>
                <p className="text-blue-100 text-sm">Take on quests to earn bonus rewards and badges</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎁</span>
              <div>
                <h4 className="font-semibold mb-1">Redeem Rewards</h4>
                <p className="text-blue-100 text-sm">Exchange your points for exciting rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;