import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaTasks, FaFire, FaClock, FaCheckCircle } from 'react-icons/fa';

function Challenges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('active'); // 'active', 'completed'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      // Mock data for now
      const mockChallenges = [
        {
          id: '1',
          title: 'Communication Champion',
          description: 'Send 50 messages this week',
          reward: 100,
          progress: 35,
          goal: 50,
          deadline: '2025-08-25',
          difficulty: 'Medium',
          category: 'Communication',
          completed: false
        },
        {
          id: '2',
          title: 'Meeting Master',
          description: 'Attend 5 video meetings',
          reward: 75,
          progress: 5,
          goal: 5,
          deadline: '2025-08-22',
          difficulty: 'Easy',
          category: 'Collaboration',
          completed: true
        },
        {
          id: '3',
          title: 'File Sharing Pro',
          description: 'Share 10 useful files with your team',
          reward: 80,
          progress: 6,
          goal: 10,
          deadline: '2025-08-26',
          difficulty: 'Medium',
          category: 'Collaboration',
          completed: false
        },
        {
          id: '4',
          title: 'Early Bird Special',
          description: 'Login before 8 AM for 5 consecutive days',
          reward: 120,
          progress: 3,
          goal: 5,
          deadline: '2025-08-24',
          difficulty: 'Hard',
          category: 'Engagement',
          completed: false
        },
        {
          id: '5',
          title: 'Social Butterfly',
          description: 'Start conversations with 10 different colleagues',
          reward: 90,
          progress: 7,
          goal: 10,
          deadline: '2025-08-28',
          difficulty: 'Medium',
          category: 'Networking',
          completed: false
        },
        {
          id: '6',
          title: 'Team Builder',
          description: 'Create 3 group chats for projects',
          reward: 60,
          progress: 3,
          goal: 3,
          deadline: '2025-08-21',
          difficulty: 'Easy',
          category: 'Leadership',
          completed: true
        },
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
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
            <FaTasks className="text-3xl text-green-500" />
            <h1 className="text-2xl font-bold text-gray-800">Challenges</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{completedCount}/{challenges.length}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rewards Earned</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalRewards} pts</p>
              </div>
              <FaFire className="text-4xl text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{challenges.length - completedCount}</p>
              </div>
              <FaClock className="text-4xl text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                filter === 'active'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="filter-active"
            >
              Active ({challenges.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                filter === 'completed'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="filter-completed"
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading challenges...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
                data-testid={`challenge-${challenge.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 text-sm">{challenge.description}</p>
                  </div>
                  {challenge.completed && (
                    <FaCheckCircle className="text-2xl text-green-500 ml-4" />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">
                      {challenge.progress}/{challenge.goal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Challenge Info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      getDifficultyColor(challenge.difficulty)
                    }`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {challenge.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {!challenge.completed && (
                      <span className="text-sm text-gray-600 flex items-center space-x-1">
                        <FaClock />
                        <span>{getDaysRemaining(challenge.deadline)} days left</span>
                      </span>
                    )}
                    <span className="text-lg font-bold text-green-600">
                      +{challenge.reward} pts
                    </span>
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

export default Challenges;