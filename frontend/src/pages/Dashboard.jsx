import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { 
  FiMessageSquare, FiTrendingUp, FiAward, FiTarget, FiGift, 
  FiUsers, FiFileText, FiCheckSquare, FiMail, FiPhone,
  FiGrid, FiChevronRight, FiStar
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalCalls: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch pending approvals (admin/manager only)
      if (user?.role && ['admin', 'manager', 'department_head', 'team_lead'].includes(user.role)) {
        try {
          const approvalsRes = await api.get('/api/approvals/pending');
          setPendingApprovals(approvalsRes.data.count || 0);
        } catch (error) {
          console.log('No pending approvals or error:', error);
        }
      }
      
      // Fetch pending invitations
      try {
        const invitationsRes = await api.get('/api/invitations/pending');
        setPendingInvitations(invitationsRes.data.count || 0);
      } catch (error) {
        console.log('No pending invitations or error:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const features = [
    {
      id: 'digital-hq',
      icon: FiGrid,
      title: 'Digital HQ',
      description: 'Central command center with customizable widgets',
      path: '/digital-hq',
      color: 'bg-corporate-100 text-corporate-700',
      iconBg: 'bg-corporate-600'
    },
    {
      id: 'chat',
      icon: FiMessageSquare,
      title: 'Chat & Communication',
      description: 'Real-time messaging and video calls',
      path: '/chat',
      color: 'bg-blue-100 text-blue-700',
      iconBg: 'bg-blue-600'
    },
    {
      id: 'spaces',
      icon: FiUsers,
      title: 'Spaces & Channels',
      description: 'Organized workspaces and team channels',
      path: '/spaces',
      color: 'bg-cyan-100 text-cyan-700',
      iconBg: 'bg-cyan-600'
    },
    {
      id: 'feed',
      icon: FiFileText,
      title: 'Company Feed',
      description: 'Announcements and company updates',
      path: '/feed',
      color: 'bg-purple-100 text-purple-700',
      iconBg: 'bg-purple-600'
    },
    {
      id: 'recognition',
      icon: FiStar,
      title: 'Recognition Wall',
      description: 'Celebrate team achievements',
      path: '/recognition',
      color: 'bg-pink-100 text-pink-700',
      iconBg: 'bg-pink-600'
    },
    {
      id: 'polls',
      icon: FiCheckSquare,
      title: 'Polls & Surveys',
      description: 'Participate in polls and surveys',
      path: '/polls',
      color: 'bg-teal-100 text-teal-700',
      iconBg: 'bg-teal-600'
    },
  ];

  const gamificationFeatures = [
    {
      id: 'leaderboard',
      icon: FiTrendingUp,
      title: 'Leaderboard',
      description: 'See top performers',
      path: '/leaderboard',
      color: 'bg-amber-100 text-amber-700',
      iconBg: 'bg-amber-600'
    },
    {
      id: 'achievements',
      icon: FiAward,
      title: 'Achievements',
      description: 'Unlock badges',
      path: '/achievements',
      color: 'bg-indigo-100 text-indigo-700',
      iconBg: 'bg-indigo-600'
    },
    {
      id: 'challenges',
      icon: FiTarget,
      title: 'Challenges',
      description: 'Complete quests',
      path: '/challenges',
      color: 'bg-green-100 text-green-700',
      iconBg: 'bg-green-600'
    },
    {
      id: 'rewards',
      icon: FiGift,
      title: 'Rewards',
      description: 'Redeem points',
      path: '/rewards',
      color: 'bg-red-100 text-red-700',
      iconBg: 'bg-red-600'
    },
  ];

  const adminFeatures = [
    {
      id: 'approvals',
      icon: FiCheckSquare,
      title: 'Approval Center',
      description: 'Review and manage requests',
      path: '/approvals',
      badge: pendingApprovals,
      color: 'bg-orange-100 text-orange-700',
      iconBg: 'bg-orange-600'
    },
    {
      id: 'invitations',
      icon: FiMail,
      title: 'Invitations',
      description: 'Manage invitations',
      path: '/invitations',
      badge: pendingInvitations,
      color: 'bg-violet-100 text-violet-700',
      iconBg: 'bg-violet-600'
    },
  ];

  const quickStats = [
    {
      label: 'Your Points',
      value: user?.points || 0,
      icon: FiStar,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Current Level',
      value: user?.level || 1,
      icon: FiTrendingUp,
      color: 'text-corporate-600',
      bgColor: 'bg-corporate-50'
    },
    {
      label: 'Department',
      value: user?.department || 'N/A',
      icon: FiUsers,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50'
    },
    {
      label: 'Team',
      value: user?.team || 'N/A',
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  const FeatureCard = ({ feature }) => (
    <button
      onClick={() => navigate(feature.path)}
      className="group relative bg-white dark:bg-primary-800 rounded-xl p-6 border border-gray-200 dark:border-primary-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left w-full overflow-hidden"
      data-testid={`feature-${feature.id}`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          {feature.badge > 0 && (
            <Badge variant="danger" size="sm" rounded>
              {feature.badge}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-2 group-hover:text-corporate-600 dark:group-hover:text-corporate-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
          {feature.description}
        </p>
        <div className="flex items-center text-sm font-medium text-corporate-600 dark:text-corporate-400">
          <span>Open</span>
          <FiChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </button>
  );

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-lg text-primary-600 dark:text-primary-400">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} padding={false} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }} hover>
            <div className="p-5 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 dark:to-primary-900 rounded-bl-full opacity-50"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-primary-900 dark:text-white mb-1 relative z-10">
                {stat.value}
              </p>
              <p className="text-sm text-primary-600 dark:text-primary-400 relative z-10">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Features */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
          Main Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>

      {/* Gamification */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
          Gamification & Rewards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gamificationFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>

      {/* Admin Features (if applicable) */}
      {user?.role && ['admin', 'manager', 'department_head', 'team_lead'].includes(user.role) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
            Management Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
            {user.role === 'admin' && (
              <FeatureCard
                feature={{
                  id: 'admin',
                  icon: FiUsers,
                  title: 'Admin Panel',
                  description: 'System management',
                  path: '/admin',
                  color: 'bg-slate-100 text-slate-700',
                  iconBg: 'bg-slate-600'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="p-4 text-center bg-gray-50 dark:bg-primary-900 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
            data-testid="quick-start-chat"
          >
            <FiMessageSquare className="w-6 h-6 mx-auto mb-2 text-corporate-600" />
            <p className="text-sm font-medium text-primary-900 dark:text-white">Start Chat</p>
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="p-4 text-center bg-gray-50 dark:bg-primary-900 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
            data-testid="quick-view-leaderboard"
          >
            <FiTrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-sm font-medium text-primary-900 dark:text-white">Leaderboard</p>
          </button>
          <button
            onClick={() => navigate('/challenges')}
            className="p-4 text-center bg-gray-50 dark:bg-primary-900 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
            data-testid="quick-view-challenges"
          >
            <FiTarget className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-primary-900 dark:text-white">Challenges</p>
          </button>
          <button
            onClick={() => navigate('/rewards')}
            className="p-4 text-center bg-gray-50 dark:bg-primary-900 hover:bg-gray-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
            data-testid="quick-redeem-rewards"
          >
            <FiGift className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <p className="text-sm font-medium text-primary-900 dark:text-white">Rewards</p>
          </button>
        </div>
      </Card>
    </Layout>
  );
};

export default Dashboard;
