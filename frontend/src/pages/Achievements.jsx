import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaMedal, FaTrophy, FaStar, FaLock } from 'react-icons/fa';

function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // For now, using mock data since backend achievements need to be seeded
      const mockAchievements = [
        {
          id: '1',
          name: 'First Message',
          description: 'Send your first message',
          icon: '💬',
          points: 10,
          unlocked: true,
          category: 'Communication'
        },
        {
          id: '2',
          name: 'Chat Master',
          description: 'Send 100 messages',
          icon: '🚀',
          points: 50,
          unlocked: false,
          category: 'Communication'
        },
        {
          id: '3',
          name: 'Team Player',
          description: 'Join 5 group chats',
          icon: '🤝',
          points: 25,
          unlocked: true,
          category: 'Collaboration'
        },
        {
          id: '4',
          name: 'Video Expert',
          description: 'Attend 10 video calls',
          icon: '🎥',
          points: 40,
          unlocked: false,
          category: 'Communication'
        },
        {
          id: '5',
          name: 'File Sharer',
          description: 'Share 20 files',
          icon: '📁',
          points: 30,
          unlocked: false,
          category: 'Collaboration'
        },
        {
          id: '6',
          name: 'Rising Star',
          description: 'Reach level 5',
          icon: '⭐',
          points: 100,
          unlocked: false,
          category: 'Progress'
        },
        {
          id: '7',
          name: 'Point Collector',
          description: 'Earn 500 points',
          icon: '💰',
          points: 50,
          unlocked: true,
          category: 'Progress'
        },
        {
          id: '8',
          name: 'Challenge Accepted',
          description: 'Complete 5 challenges',
          icon: '🎯',
          points: 60,
          unlocked: false,
          category: 'Challenges'
        },
        {
          id: '9',
          name: 'Early Bird',
          description: 'Login before 8 AM for 7 days',
          icon: '🌅',
          points: 35,
          unlocked: false,
          category: 'Engagement'
        },
        {
          id: '10',
          name: 'Social Butterfly',
          description: 'Connect with 20 colleagues',
          icon: '🦋',
          points: 45,
          unlocked: false,
          category: 'Collaboration'
        },
      ];
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
            data-testid="back-button"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <FaMedal className="text-3xl text-purple-500" />
            <h1 className="text-2xl font-bold text-gray-800">Achievements</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Unlocked</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{unlockedCount}/{achievements.length}</p>
              </div>
              <FaTrophy className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Achievement Points</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalPoints}</p>
              </div>
              <FaStar className="text-4xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completion</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </p>
              </div>
              <FaMedal className="text-4xl text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                filter === 'all'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="filter-all"
            >
              All ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                filter === 'unlocked'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="filter-unlocked"
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                filter === 'locked'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="filter-locked"
            >
              Locked ({achievements.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading achievements...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  !achievement.unlocked ? 'opacity-75' : ''
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`text-6xl ${
                    achievement.unlocked ? '' : 'grayscale opacity-50'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{achievement.name}</h3>
                      {achievement.unlocked ? (
                        <FaMedal className="text-xl text-purple-500" />
                      ) : (
                        <FaLock className="text-xl text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {achievement.category}
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Achievements;