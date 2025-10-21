import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiMessageSquare, FiUsers, FiAward, FiGift, 
  FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiSearch,
  FiChevronDown, FiTrendingUp, FiTarget, FiFileText,
  FiCheckSquare, FiMail, FiGrid
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [gamificationOpen, setGamificationOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = {
    main: [
      { path: '/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/digital-hq', label: 'Digital HQ', icon: FiGrid },
    ],
    features: [
      { path: '/chat', label: 'Chat', icon: FiMessageSquare },
      { path: '/spaces', label: 'Spaces', icon: FiUsers },
      { path: '/feed', label: 'Feed', icon: FiFileText },
      { path: '/recognition', label: 'Recognition', icon: FiAward },
      { path: '/polls', label: 'Polls', icon: FiCheckSquare },
      { path: '/calls', label: 'Call History', icon: FiMessageSquare },
    ],
    gamification: [
      { path: '/leaderboard', label: 'Leaderboard', icon: FiTrendingUp },
      { path: '/achievements', label: 'Achievements', icon: FiAward },
      { path: '/challenges', label: 'Challenges', icon: FiTarget },
      { path: '/rewards', label: 'Rewards', icon: FiGift },
    ],
    admin: [
      { path: '/approvals', label: 'Approvals', icon: FiCheckSquare },
      { path: '/invitations', label: 'Invitations', icon: FiMail },
      { path: '/admin', label: 'Admin Panel', icon: FiSettings },
    ],
  };

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-primary-900 dark:border-primary-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-corporate-600 to-corporate-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">EC</span>
              </div>
              <span className="hidden sm:block text-xl font-semibold text-primary-900 dark:text-white">
                Enterprise Comms
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main Links */}
            {navigationItems.main.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                    : 'text-primary-600 hover:bg-gray-50 dark:text-primary-300 dark:hover:bg-primary-800'
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}

            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-gray-50 dark:text-primary-300 dark:hover:bg-primary-800 transition-colors flex items-center space-x-1"
                data-testid="nav-features-dropdown"
              >
                <span>Features</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-primary-800 rounded-lg shadow-large border border-gray-200 dark:border-primary-700 py-2">
                  {navigationItems.features.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setFeaturesOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-700 dark:text-corporate-400'
                          : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-700'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Gamification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setGamificationOpen(!gamificationOpen)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-gray-50 dark:text-primary-300 dark:hover:bg-primary-800 transition-colors flex items-center space-x-1"
                data-testid="nav-gamification-dropdown"
              >
                <span>Gamification</span>
                <FiChevronDown className="w-4 h-4" />
              </button>
              {gamificationOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-primary-800 rounded-lg shadow-large border border-gray-200 dark:border-primary-700 py-2">
                  {navigationItems.gamification.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setGamificationOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-700 dark:text-corporate-400'
                          : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-700'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Links (if admin/manager) */}
            {user && ['admin', 'manager', 'department_head'].includes(user.role) && (
              <div className="relative">
                <button
                  onClick={() => navigate('/admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') || isActive('/approvals') || isActive('/invitations')
                      ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                      : 'text-primary-600 hover:bg-gray-50 dark:text-primary-300 dark:hover:bg-primary-800'
                  }`}
                  data-testid="nav-admin"
                >
                  <div className="flex items-center space-x-2">
                    <FiSettings className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search (Desktop) */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-primary-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-corporate-500 dark:bg-primary-800 dark:text-white w-64"
                  data-testid="search-input"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-primary-600 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-primary-800 rounded-lg transition-colors" data-testid="notifications-button">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-primary-800 rounded-lg transition-colors"
                data-testid="user-profile-button"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-corporate-500 to-corporate-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-primary-900 dark:text-white">
                  {user?.full_name || 'User'}
                </span>
                <FiChevronDown className="hidden md:block w-4 h-4 text-primary-600 dark:text-primary-300" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-primary-800 rounded-lg shadow-large border border-gray-200 dark:border-primary-700 py-2">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-primary-700">
                    <p className="text-sm font-medium text-primary-900 dark:text-white">{user?.full_name}</p>
                    <p className="text-xs text-primary-500 dark:text-primary-400">{user?.email}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-primary-600 dark:text-primary-300">Level {user?.level || 1}</span>
                      <span className="text-xs text-primary-400">•</span>
                      <span className="text-xs font-medium text-accent-600 dark:text-accent-400">{user?.points || 0} pts</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    data-testid="logout-button"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-primary-600 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-primary-800 rounded-lg"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-primary-800 bg-white dark:bg-primary-900">
          <div className="px-4 py-3 space-y-1">
            {/* Search (Mobile) */}
            <div className="pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-primary-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-corporate-500 dark:bg-primary-800 dark:text-white"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Main Links */}
            {navigationItems.main.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                    : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Features Section */}
            <div className="pt-3 border-t border-gray-200 dark:border-primary-800">
              <p className="px-4 py-2 text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase">Features</p>
              {navigationItems.features.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                      : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Gamification Section */}
            <div className="pt-3 border-t border-gray-200 dark:border-primary-800">
              <p className="px-4 py-2 text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase">Gamification</p>
              {navigationItems.gamification.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                      : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Admin Section */}
            {user && ['admin', 'manager', 'department_head'].includes(user.role) && (
              <div className="pt-3 border-t border-gray-200 dark:border-primary-800">
                <p className="px-4 py-2 text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase">Admin</p>
                {navigationItems.admin.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-corporate-50 text-corporate-700 dark:bg-primary-800 dark:text-corporate-400'
                        : 'text-primary-700 hover:bg-gray-50 dark:text-primary-200 dark:hover:bg-primary-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
