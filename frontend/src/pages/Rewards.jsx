import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { FiGift, FiShoppingCart, FiCheckCircle, FiAlertCircle, FiStar, FiTrendingUp } from 'react-icons/fi';

function Rewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const mockRewards = [
        { id: '1', name: 'Coffee Voucher', description: 'Enjoy a free coffee from the office cafe', cost: 50, icon: '☕', category: 'Food & Drink', available: true, stock: 25 },
        { id: '2', name: 'Extra Day Off', description: 'Get an additional day off to recharge', cost: 500, icon: '🌴', category: 'Time Off', available: true, stock: 10 },
        { id: '3', name: 'Gift Card $25', description: 'Amazon gift card worth $25', cost: 250, icon: '🎁', category: 'Gift Cards', available: true, stock: 50 },
        { id: '4', name: 'Premium Parking Spot', description: 'Reserved parking spot for one month', cost: 150, icon: '🏎️', category: 'Perks', available: true, stock: 5 },
        { id: '5', name: 'Lunch with CEO', description: 'Exclusive lunch meeting with the CEO', cost: 1000, icon: '🍽️', category: 'Experiences', available: true, stock: 2 },
        { id: '6', name: 'Tech Gadget', description: 'Choose from a selection of tech accessories', cost: 400, icon: '🎧', category: 'Electronics', available: true, stock: 15 },
        { id: '7', name: 'Gym Membership', description: '3-month premium gym membership', cost: 300, icon: '🏋️', category: 'Health & Fitness', available: true, stock: 20 },
        { id: '8', name: 'Learning Course', description: 'Any online course of your choice', cost: 200, icon: '📚', category: 'Education', available: true, stock: 100 },
        { id: '9', name: 'Team Dinner', description: 'Dinner for you and 5 team members', cost: 350, icon: '🍕', category: 'Food & Drink', available: true, stock: 8 },
        { id: '10', name: 'Gift Card $50', description: 'Amazon gift card worth $50', cost: 450, icon: '💳', category: 'Gift Cards', available: true, stock: 30 },
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
    console.log('Redeeming reward:', selectedReward);
    setShowRedeemModal(false);
    setSelectedReward(null);
    alert('Reward redeemed successfully!');
  };

  const canAfford = (cost) => {
    return user?.points >= cost;
  };

  const categories = ['all', ...new Set(rewards.map(r => r.category))];

  const filteredRewards = rewards.filter(reward => 
    selectedCategory === 'all' || reward.category === selectedCategory
  );

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
              <FiGift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Rewards Store</h1>
              <p className="text-primary-600 dark:text-primary-400">Redeem your points for amazing rewards</p>
            </div>
          </div>
          
          {/* Points Balance */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl shadow-lg px-6 py-4">
            <div className="flex items-center space-x-3">
              <FiStar className="w-8 h-8 text-white" />
              <div>
                <p className="text-xs text-amber-100 font-medium">Your Points</p>
                <p className="text-2xl font-bold text-white">{user?.points || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 bg-gradient-to-r from-pink-500 to-purple-600 border-none text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">🎉 Redeem Your Points</h2>
            <p className="text-pink-100">Exchange your hard-earned points for amazing rewards. Keep earning to unlock premium items!</p>
          </div>
          <FiGift className="w-12 h-12 text-pink-200 flex-shrink-0" />
        </div>
      </Card>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white dark:bg-primary-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-700 border border-gray-200 dark:border-primary-700'
              }`}
            >
              {category === 'all' ? 'All Rewards' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading rewards...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const affordable = canAfford(reward.cost);
            
            return (
              <Card
                key={reward.id}
                className={`transition-all hover:shadow-lg hover:-translate-y-1 ${
                  !affordable ? 'opacity-75' : ''
                }`}
                data-testid={`reward-${reward.id}`}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">{reward.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{reward.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{reward.description}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-primary-700 pt-4 space-y-3">
                  {/* Stock & Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {reward.stock > 0 ? `${reward.stock} in stock` : 'Out of stock'}
                    </span>
                    <div className="flex items-center space-x-1 text-lg font-bold text-pink-600 dark:text-pink-400">
                      <FiStar className="w-5 h-5" />
                      <span>{reward.cost}</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div>
                    <Badge variant="secondary" size="sm">{reward.category}</Badge>
                  </div>
                  
                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!affordable || !reward.available || reward.stock === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      affordable && reward.available && reward.stock > 0
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-200 dark:bg-primary-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    data-testid={`redeem-button-${reward.id}`}
                  >
                    {reward.stock === 0 ? (
                      <span className="flex items-center justify-center space-x-2">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>Out of Stock</span>
                      </span>
                    ) : !affordable ? (
                      <span className="flex items-center justify-center space-x-2">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>Need {reward.cost - (user?.points || 0)} more points</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <FiShoppingCart className="w-4 h-4" />
                        <span>Redeem Now</span>
                      </span>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Earn More Points Section */}
      <Card title="How to Earn More Points" className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">💬</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Send Messages</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">+5 points per message</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📹</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Video Calls</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">+20 points per call</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Complete Challenges</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Up to +500 points</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🏆</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Unlock Achievements</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bonus points</p>
          </div>
        </div>
      </Card>

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="redeem-modal">
          <div className="bg-white dark:bg-primary-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
            <div className="text-center">
              <div className="text-7xl mb-4">{selectedReward.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Redemption</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to redeem:</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-6">{selectedReward.name}</p>
              
              <div className="bg-gray-50 dark:bg-primary-900 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="text-xl font-bold text-pink-600 dark:text-pink-400 flex items-center space-x-1">
                    <FiStar />
                    <span>{selectedReward.cost}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Balance after:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
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
                  <FiCheckCircle />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => {
                    setShowRedeemModal(false);
                    setSelectedReward(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-primary-700 text-gray-800 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-primary-600 transition"
                  data-testid="cancel-redeem-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Rewards;
