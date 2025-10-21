import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import { FiTrendingUp, FiAward, FiUsers, FiTarget } from 'react-icons/fi';
import { FaMedal, FaTrophy } from 'react-icons/fa';

function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'monthly', 'weekly'

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 w-6 h-6" />;
    if (rank === 2) return <FaMedal className="text-gray-400 w-6 h-6" />;
    if (rank === 3) return <FaMedal className="text-orange-500 w-6 h-6" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-corporate-400 to-corporate-600';
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <FaTrophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary-900 dark:text-white">Leaderboard</h1>
              <p className="text-lg text-primary-600 dark:text-primary-400">Top performers and achievers</p>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className="flex items-center space-x-2 bg-white dark:bg-primary-800 rounded-xl shadow-md border border-gray-200 dark:border-primary-700 p-1.5">
            {['all', 'monthly', 'weekly'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                  timeFilter === filter
                    ? 'bg-gradient-to-r from-corporate-600 to-corporate-700 text-white shadow-md scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700 hover:scale-105'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Time
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Your Rank</p>
              <p className="text-4xl font-bold text-amber-900 dark:text-amber-300">#{leaderboard.findIndex(p => p.id === user?.id) + 1 || '-'}</p>
            </div>
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FiTarget className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-corporate-50 to-corporate-100 dark:from-corporate-900/20 dark:to-corporate-800/20 border-corporate-200 dark:border-corporate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-corporate-700 dark:text-corporate-400 mb-2">Your Points</p>
              <p className="text-4xl font-bold text-corporate-900 dark:text-corporate-300">{user?.points || 0}</p>
            </div>
            <div className="w-16 h-16 bg-corporate-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FiAward className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border-accent-200 dark:border-accent-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-accent-700 dark:text-accent-400 mb-2">Total Players</p>
              <p className="text-4xl font-bold text-accent-900 dark:text-accent-300">{leaderboard.length}</p>
            </div>
            <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FiUsers className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-8 animate-scale-in">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-primary-800 dark:to-primary-900">
            <div className="flex items-end justify-center space-x-4 md:space-x-8 py-8 px-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300" data-testid="rank-2">
                <div className="relative mb-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-2xl ring-4 ring-gray-200 dark:ring-gray-700">
                    {leaderboard[1]?.full_name?.charAt(0) || '2'}
                  </div>
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-white dark:bg-primary-800 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                    <FaMedal className="text-gray-500 w-5 h-5" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 dark:text-white text-center mb-1 text-sm md:text-base">{leaderboard[1]?.full_name}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">{leaderboard[1]?.points} points</p>
                <div className="w-28 md:w-32 h-20 bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-xl flex items-start justify-center pt-3 shadow-lg">
                  <span className="text-white font-bold text-lg md:text-xl">2nd</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center -mt-4 md:-mt-6 transform hover:scale-110 transition-transform duration-300" data-testid="rank-1">
                <div className="relative mb-4 animate-float">
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-2xl ring-4 md:ring-6 ring-yellow-200 dark:ring-yellow-700 animate-pulse-slow">
                    {leaderboard[0]?.full_name?.charAt(0) || '1'}
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white dark:bg-primary-800 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <FaTrophy className="text-yellow-500 w-7 h-7" />
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-center mb-1 text-base md:text-xl">{leaderboard[0]?.full_name}</p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2 font-semibold">{leaderboard[0]?.points} points</p>
                <div className="w-32 md:w-40 h-28 md:h-32 bg-gradient-to-t from-yellow-500 to-yellow-600 rounded-t-xl flex items-start justify-center pt-3 shadow-2xl">
                  <span className="text-white font-bold text-2xl md:text-3xl">1st</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300" data-testid="rank-3">
                <div className="relative mb-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-2xl ring-4 ring-orange-200 dark:ring-orange-700">
                    {leaderboard[2]?.full_name?.charAt(0) || '3'}
                  </div>
                  <div className="absolute -top-2 -right-2 w-9 h-9 bg-white dark:bg-primary-800 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                    <FaMedal className="text-orange-500 w-5 h-5" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 dark:text-white text-center mb-1 text-sm md:text-base">{leaderboard[2]?.full_name}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">{leaderboard[2]?.points} points</p>
                <div className="w-28 md:w-32 h-16 bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-xl flex items-start justify-center pt-3 shadow-lg">
                  <span className="text-white font-bold text-lg md:text-xl">3rd</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card title="All Rankings" className="overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading leaderboard...</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-primary-800 border-b border-gray-200 dark:border-primary-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-primary-700">
                {leaderboard.map((player, index) => (
                  <tr
                    key={player.id}
                    className={`hover:bg-gray-50 dark:hover:bg-primary-800 transition ${
                      player.id === user?.id ? 'bg-corporate-50 dark:bg-corporate-900/20 border-l-4 border-corporate-600' : ''
                    }`}
                    data-testid={`leaderboard-item-${index}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(player.rank)}
                        <span className={`font-semibold ${
                          player.rank <= 3 ? 'text-lg' : ''
                        } text-gray-900 dark:text-white`}>
                          #{player.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getRankColor(player.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                          {player.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {player.full_name}
                            {player.id === user?.id && (
                              <span className="ml-2 text-xs bg-corporate-600 text-white px-2 py-1 rounded">You</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{player.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {player.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-corporate-100 text-corporate-800 dark:bg-corporate-900/30 dark:text-corporate-400">
                        Level {player.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{player.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}

export default Leaderboard;