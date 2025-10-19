import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaTrophy, FaMedal, FaCrown, FaStar } from 'react-icons/fa';

function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 text-2xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-2xl" />;
    if (rank === 3) return <FaMedal className="text-orange-600 text-2xl" />;
    return <span className="text-gray-500 font-bold text-lg">{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
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
            <FaTrophy className="text-3xl text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-12">
            <div className="flex items-end justify-center space-x-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center" data-testid="rank-2">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-2 shadow-lg">
                  {leaderboard[1]?.full_name?.charAt(0) || '2'}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{leaderboard[1]?.full_name}</p>
                  <p className="text-sm text-gray-600">{leaderboard[1]?.points} points</p>
                  <FaMedal className="text-gray-400 text-3xl mx-auto mt-2" />
                </div>
                <div className="w-32 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg mt-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center" data-testid="rank-1">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-2 shadow-2xl ring-4 ring-yellow-300">
                  {leaderboard[0]?.full_name?.charAt(0) || '1'}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-lg">{leaderboard[0]?.full_name}</p>
                  <p className="text-sm text-gray-600">{leaderboard[0]?.points} points</p>
                  <FaCrown className="text-yellow-500 text-4xl mx-auto mt-2" />
                </div>
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-lg mt-4 flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center" data-testid="rank-3">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-2 shadow-lg">
                  {leaderboard[2]?.full_name?.charAt(0) || '3'}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{leaderboard[2]?.full_name}</p>
                  <p className="text-sm text-gray-600">{leaderboard[2]?.points} points</p>
                  <FaMedal className="text-orange-600 text-3xl mx-auto mt-2" />
                </div>
                <div className="w-32 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-lg mt-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">All Rankings</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition ${
                    player.id === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  data-testid={`leaderboard-item-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {player.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {player.full_name}
                          {player.id === user?.id && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">You</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {player.role} • {player.department || 'No department'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{player.points}</p>
                      <p className="text-sm text-gray-500">Level {player.level}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;