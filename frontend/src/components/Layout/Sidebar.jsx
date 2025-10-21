import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiMessageSquare, FiUsers, FiAward, FiGift, 
  FiLogOut, FiMenu, FiX, FiChevronDown,
  FiTrendingUp, FiTarget, FiFileText,
  FiCheckSquare, FiMail, FiGrid, FiSettings, FiPhone, FiStar
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    gamification: true,
    admin: true
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = {
    main: [
      { path: '/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/digital-hq', label: 'Digital HQ', icon: FiGrid },
    ],
    features: [
      { path: '/chat', label: 'Chat', icon: FiMessageSquare },
      { path: '/spaces', label: 'Spaces', icon: FiUsers },
      { path: '/feed', label: 'Feed', icon: FiFileText },
      { path: '/recognition', label: 'Recognition', icon: FiStar },
      { path: '/polls', label: 'Polls', icon: FiCheckSquare },
      { path: '/calls', label: 'Call History', icon: FiPhone },
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

  const NavItem = ({ item, onClick }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all group ${
        isActive(item.path)
          ? 'bg-corporate-600 text-white shadow-md'
          : 'text-primary-600 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-primary-800'
      }`}
      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
    >
      <item.icon className={`w-5 h-5 ${
        isActive(item.path) ? 'text-white' : 'text-primary-500 group-hover:text-corporate-600'
      }`} />
      {!isCollapsed && (
        <span className="font-medium text-sm">{item.label}</span>
      )}
    </Link>
  );

  const SectionTitle = ({ title, section, hasItems }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wide hover:text-corporate-600 transition"
    >
      {!isCollapsed && <span>{title}</span>}
      {!isCollapsed && hasItems && (
        <FiChevronDown className={`w-4 h-4 transition-transform ${
          expandedSections[section] ? 'rotate-0' : '-rotate-90'
        }`} />
      )}
    </button>
  );

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-gray-200 dark:border-primary-700">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-corporate-600 to-corporate-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">EC</span>
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-primary-900 dark:text-white block leading-tight">
                Enterprise
              </span>
              <span className="text-xs text-primary-500 dark:text-primary-400">Comms</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main Links */}
        {navigationItems.main.map((item) => (
          <NavItem key={item.path} item={item} onClick={() => isMobile && setIsMobileOpen(false)} />
        ))}

        {/* Features Section */}
        <div className="pt-4">
          <SectionTitle title="Features" section="features" hasItems={true} />
          {expandedSections.features && (
            <div className="space-y-1 mt-1">
              {navigationItems.features.map((item) => (
                <NavItem key={item.path} item={item} onClick={() => isMobile && setIsMobileOpen(false)} />
              ))}
            </div>
          )}
        </div>

        {/* Gamification Section */}
        <div className="pt-4">
          <SectionTitle title="Gamification" section="gamification" hasItems={true} />
          {expandedSections.gamification && (
            <div className="space-y-1 mt-1">
              {navigationItems.gamification.map((item) => (
                <NavItem key={item.path} item={item} onClick={() => isMobile && setIsMobileOpen(false)} />
              ))}
            </div>
          )}
        </div>

        {/* Admin Section */}
        {user && ['admin', 'manager', 'department_head'].includes(user.role) && (
          <div className="pt-4">
            <SectionTitle title="Admin" section="admin" hasItems={true} />
            {expandedSections.admin && (
              <div className="space-y-1 mt-1">
                {navigationItems.admin.map((item) => (
                  <NavItem key={item.path} item={item} onClick={() => isMobile && setIsMobileOpen(false)} />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-primary-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-corporate-500 to-corporate-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-900 dark:text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-primary-600 dark:text-primary-400">Lvl {user?.level || 1}</span>
                <span className="text-xs text-primary-400">•</span>
                <span className="text-xs font-medium text-accent-600 dark:text-accent-400">{user?.points || 0} pts</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          data-testid="logout-button"
        >
          <FiLogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-primary-900 border-r border-gray-200 dark:border-primary-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-gray-200 dark:border-primary-700"
        data-testid="mobile-menu-button"
      >
        {isMobileOpen ? (
          <FiX className="w-6 h-6 text-primary-900 dark:text-white" />
        ) : (
          <FiMenu className="w-6 h-6 text-primary-900 dark:text-white" />
        )}
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-primary-900 z-50 shadow-xl">
            <SidebarContent isMobile={true} />
          </aside>
        </>
      )}

      {/* Desktop Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block fixed left-64 top-6 -ml-4 p-2 bg-white dark:bg-primary-800 rounded-full shadow-lg border border-gray-200 dark:border-primary-700 z-30 transition-all hover:shadow-xl"
        style={{ left: isCollapsed ? '5rem' : '16rem' }}
        data-testid="collapse-button"
      >
        <FiChevronDown className={`w-4 h-4 text-primary-900 dark:text-white transition-transform ${
          isCollapsed ? 'rotate-90' : '-rotate-90'
        }`} />
      </button>
    </>
  );
};

export default Sidebar;