import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { FiAward, FiStar, FiLock, FiUnlock, FiTarget } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const mockAchievements = [
        { id: '1', name: 'First Message', description: 'Send your first message', icon: '💬', points: 10, unlocked: true, category: 'Communication', progress: 100 },
        { id: '2', name: 'Chat Master', description: 'Send 100 messages', icon: '🚀', points: 50, unlocked: false, category: 'Communication', progress: 35 },
        { id: '3', name: 'Team Player', description: 'Join 5 group chats', icon: '🤝', points: 25, unlocked: true, category: 'Collaboration', progress: 100 },
        { id: '4', name: 'Video Expert', description: 'Attend 10 video calls', icon: '🎥', points: 40, unlocked: false, category: 'Communication', progress: 60 },
        { id: '5', name: 'File Sharer', description: 'Share 20 files', icon: '📁', points: 30, unlocked: false, category: 'Collaboration', progress: 30 },
        { id: '6', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', points: 100, unlocked: false, category: 'Progress', progress: 40 },
        { id: '7', name: 'Point Collector', description: 'Earn 500 points', icon: '💰', points: 50, unlocked: true, category: 'Progress', progress: 100 },
        { id: '8', name: 'Challenge Accepted', description: 'Complete 5 challenges', icon: '🎯', points: 60, unlocked: false, category: 'Challenges', progress: 20 },
        { id: '9', name: 'Early Bird', description: 'Login before 8 AM for 7 days', icon: '🌅', points: 35, unlocked: false, category: 'Engagement', progress: 57 },
        { id: '10', name: 'Social Butterfly', description: 'Connect with 20 colleagues', icon: '🦋', points: 45, unlocked: false, category: 'Collaboration', progress: 75 },
      ];
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unlocked' && achievement.unlocked) || 
                         (filter === 'locked' && !achievement.unlocked);
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    return matchesFilter && matchesCategory;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <FiAward className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Achievements</h1>
            <p className="text-primary-600 dark:text-primary-400">Unlock badges and earn rewards</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Unlocked</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-300">{unlockedCount}/{achievements.length}</p>
            </div>
            <FaTrophy className="w-12 h-12 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Total Points</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">{totalPoints}</p>
            </div>
            <FiStar className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Completion</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </p>
            </div>
            <FiTarget className="w-12 h-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <Card className="flex-1">
          <div className="flex space-x-2">
            {['all', 'unlocked', 'locked'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700'
                }`}
                data-testid={`filter-${f}`}
              >
                {f === 'all' && `All (${achievements.length})`}
                {f === 'unlocked' && (
                  <span className="flex items-center justify-center space-x-1">
                    <FiUnlock className="w-4 h-4" />
                    <span>Unlocked ({unlockedCount})</span>
                  </span>
                )}
                {f === 'locked' && (
                  <span className="flex items-center justify-center space-x-1">
                    <FiLock className="w-4 h-4" />
                    <span>Locked ({achievements.length - unlockedCount})</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Category Filter */}
        <Card className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-primary-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-primary-700 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </Card>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading achievements...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all hover:shadow-lg hover:-translate-y-1 ${
                !achievement.unlocked ? 'opacity-75' : ''
              }`}
              data-testid={`achievement-${achievement.id}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-5xl flex-shrink-0 ${
                  achievement.unlocked ? '' : 'grayscale opacity-50'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{achievement.name}</h3>
                    {achievement.unlocked ? (
                      <FiUnlock className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <FiLock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                  
                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={achievement.unlocked ? 'success' : 'secondary'} size="sm">
                      {achievement.category}
                    </Badge>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredAchievements.length === 0 && !loading && (
        <Card className="text-center py-12">
          <FiAward className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No achievements found</p>
        </Card>
      )}
    </Layout>
  );
}

export default Achievements;