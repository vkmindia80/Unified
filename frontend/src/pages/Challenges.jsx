import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { FiTarget, FiClock, FiCheckCircle, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('active'); // 'active', 'completed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const mockChallenges = [
        { id: '1', title: 'Communication Champion', description: 'Send 50 messages this week', reward: 100, progress: 35, goal: 50, deadline: '2025-08-25', difficulty: 'Medium', category: 'Communication', completed: false },
        { id: '2', title: 'Meeting Master', description: 'Attend 5 video meetings', reward: 75, progress: 5, goal: 5, deadline: '2025-08-22', difficulty: 'Easy', category: 'Collaboration', completed: true },
        { id: '3', title: 'File Sharing Pro', description: 'Share 10 useful files with your team', reward: 80, progress: 6, goal: 10, deadline: '2025-08-26', difficulty: 'Medium', category: 'Collaboration', completed: false },
        { id: '4', title: 'Early Bird Special', description: 'Login before 8 AM for 5 consecutive days', reward: 120, progress: 3, goal: 5, deadline: '2025-08-24', difficulty: 'Hard', category: 'Engagement', completed: false },
        { id: '5', title: 'Social Butterfly', description: 'Start conversations with 10 different colleagues', reward: 90, progress: 7, goal: 10, deadline: '2025-08-28', difficulty: 'Medium', category: 'Networking', completed: false },
        { id: '6', title: 'Team Builder', description: 'Create 3 group chats for projects', reward: 60, progress: 3, goal: 3, deadline: '2025-08-21', difficulty: 'Easy', category: 'Leadership', completed: true },
      ];
      
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'completed') return challenge.completed;
    if (filter === 'active') return !challenge.completed;
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalRewards = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0);
  const activeCount = challenges.length - completedCount;

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
            <FiTarget className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Challenges</h1>
            <p className="text-primary-600 dark:text-primary-400">Complete tasks and earn rewards</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300">{completedCount}/{challenges.length}</p>
            </div>
            <FiCheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">Rewards Earned</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">{totalRewards}</p>
            </div>
            <FiAward className="w-12 h-12 text-orange-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Active</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{activeCount}</p>
            </div>
            <FiFire className="w-12 h-12 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition ${
              filter === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700'
            }`}
            data-testid="filter-active"
          >
            <span className="flex items-center justify-center space-x-2">
              <FiFire className="w-4 h-4" />
              <span>Active ({activeCount})</span>
            </span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition ${
              filter === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700'
            }`}
            data-testid="filter-completed"
          >
            <span className="flex items-center justify-center space-x-2">
              <FiCheckCircle className="w-4 h-4" />
              <span>Completed ({completedCount})</span>
            </span>
          </button>
        </div>
      </Card>

      {/* Challenges Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading challenges...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="hover:shadow-lg transition-shadow"
              data-testid={`challenge-${challenge.id}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                  </div>
                  {challenge.completed && (
                    <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {challenge.progress}/{challenge.goal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        challenge.completed 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-200 dark:border-primary-700">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getDifficultyColor(challenge.difficulty)} size="sm">
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="primary" size="sm">
                      {challenge.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    {!challenge.completed && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>{getDaysRemaining(challenge.deadline)}d left</span>
                      </span>
                    )}
                    <span className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center space-x-1">
                      <FiTrendingUp className="w-5 h-5" />
                      <span>+{challenge.reward}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredChallenges.length === 0 && !loading && (
        <Card className="text-center py-12">
          <FiTarget className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No {filter} challenges found</p>
        </Card>
      )}
    </Layout>
  );
}

export default Challenges;