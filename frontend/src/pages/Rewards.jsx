import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaArrowLeft, FaGift, FaCoins, FaStar, FaCheckCircle } from 'react-icons/fa';

function Rewards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      // Mock data for now
      const mockRewards = [
        {
          id: '1',
          name: 'Coffee Voucher',
          description: 'Enjoy a free coffee from the office cafe',
          cost: 50,
          icon: '☕',
          category: 'Food & Drink',
          available: true,
          stock: 25
        },
        {
          id: '2',
          name: 'Extra Day Off',
          description: 'Get an additional day off to recharge',
          cost: 500,
          icon: '🌴',
          category: 'Time Off',
          available: true,
          stock: 10
        },
        {
          id: '3',
          name: 'Gift Card $25',
          description: 'Amazon gift card worth $25',
          cost: 250,
          icon: '🎁',
          category: 'Gift Cards',
          available: true,
          stock: 50
        },
        {
          id: '4',
          name: 'Premium Parking Spot',
          description: 'Reserved parking spot for one month',
          cost: 150,
          icon: '🏎️',
          category: 'Perks',
          available: true,
          stock: 5
        },
        {
          id: '5',
          name: 'Lunch with CEO',
          description: 'Exclusive lunch meeting with the CEO',
          cost: 1000,
          icon: '🍽️',
          category: 'Experiences',
          available: true,
          stock: 2
        },
        {
          id: '6',
          name: 'Tech Gadget',
          description: 'Choose from a selection of tech accessories',
          cost: 400,
          icon: '🎧',
          category: 'Electronics',
          available: true,
          stock: 15
        },
        {
          id: '7',
          name: 'Gym Membership',
          description: '3-month premium gym membership',
          cost: 300,
          icon: '🏋️',
          category: 'Health & Fitness',
          available: true,
          stock: 20
        },
        {
          id: '8',
          name: 'Learning Course',
          description: 'Any online course of your choice',
          cost: 200,
          icon: '📚',
          category: 'Education',
          available: true,
          stock: 100
        },
        {
          id: '9',
          name: 'Team Dinner',
          description: 'Dinner for you and 5 team members',
          cost: 350,
          icon: '🍕',
          category: 'Food & Drink',
          available: true,
          stock: 8
        },
        {
          id: '10',
          name: 'Gift Card $50',
          description: 'Amazon gift card worth $50',
          cost: 450,
          icon: '💳',
          category: 'Gift Cards',
          available: true,
          stock: 30
        },
      ];
      
      setRewards(mockRewards);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    // In a real app, this would make an API call
    console.log('Redeeming reward:', selectedReward);
    setShowRedeemModal(false);
    setSelectedReward(null);
    // Show success message
    alert('Reward redeemed successfully!');
  };

  const canAfford = (cost) => {
    return user?.points >= cost;
  };

  const categories = [...new Set(rewards.map(r => r.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              data-testid="back-button"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <FaGift className="text-3xl text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-800">Rewards Store</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <FaCoins className="text-2xl" />
            <div>
              <p className="text-xs opacity-90">Your Points</p>
              <p className="text-xl font-bold">{user?.points || 0}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Redeem Your Points</h2>
          <p className="text-pink-100">Exchange your hard-earned points for amazing rewards. Keep earning to unlock premium items!</p>
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading rewards...</div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaStar className="text-yellow-500" />
                  <span>{category}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards
                    .filter(reward => reward.category === category)
                    .map((reward) => (
                      <div
                        key={reward.id}
                        className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                          !canAfford(reward.cost) ? 'opacity-60' : ''
                        }`}
                        data-testid={`reward-${reward.id}`}
                      >
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-3">{reward.icon}</div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{reward.name}</h3>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500">Stock: {reward.stock} left</span>
                            <div className="flex items-center space-x-1 text-lg font-bold text-purple-600">
                              <FaCoins />
                              <span>{reward.cost}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford(reward.cost) || !reward.available}
                            className={`w-full py-3 rounded-lg font-semibold transition ${
                              canAfford(reward.cost) && reward.available
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            data-testid={`redeem-button-${reward.id}`}
                          >
                            {!canAfford(reward.cost)
                              ? 'Not Enough Points'
                              : !reward.available
                              ? 'Out of Stock'
                              : 'Redeem Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Earn More Points Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Earn More Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold text-gray-800">Send Messages</h4>
                <p className="text-sm text-gray-600">+5 points per message</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📹</span>
              <div>
                <h4 className="font-semibold text-gray-800">Video Calls</h4>
                <p className="text-sm text-gray-600">+20 points per call</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-gray-800">Complete Challenges</h4>
                <p className="text-sm text-gray-600">Up to +500 points</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-semibold text-gray-800">Unlock Achievements</h4>
                <p className="text-sm text-gray-600">Bonus points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="redeem-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
            <div className="text-center">
              <div className="text-7xl mb-4">{selectedReward.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Redemption</h2>
              <p className="text-gray-600 mb-4">Are you sure you want to redeem:</p>
              <p className="text-xl font-bold text-gray-800 mb-4">{selectedReward.name}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Cost:</span>
                  <span className="text-xl font-bold text-purple-600 flex items-center space-x-1">
                    <FaCoins />
                    <span>{selectedReward.cost}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Balance after:</span>
                  <span className="text-xl font-bold text-gray-800">
                    {(user?.points || 0) - selectedReward.cost}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={confirmRedeem}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition flex items-center justify-center space-x-2"
                  data-testid="confirm-redeem-button"
                >
                  <FaCheckCircle />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => {
                    setShowRedeemModal(false);
                    setSelectedReward(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                  data-testid="cancel-redeem-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rewards;