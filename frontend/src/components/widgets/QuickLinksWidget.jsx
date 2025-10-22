import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { FaPlus, FaExternalLinkAlt, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

function QuickLinksWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: '🔗',
    description: '',
    category: 'general',
    is_external: false
  });

  const canManage = user?.role && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/quick-links');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching quick links:', error);
      toast.error('Failed to load quick links');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLink) {
        await api.put(`/quick-links/${editingLink.id}`, formData);
        toast.success('Quick link updated successfully!');
      } else {
        await api.post('/quick-links', formData);
        toast.success('Quick link created successfully!');
      }
      await fetchLinks();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving quick link:', error);
      toast.error(error.response?.data?.detail || 'Failed to save quick link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this quick link?')) return;
    
    try {
      await api.delete(`/quick-links/${linkId}`);
      toast.success('Quick link deleted successfully!');
      await fetchLinks();
    } catch (error) {
      console.error('Error deleting quick link:', error);
      toast.error('Failed to delete quick link');
    }
  };

  const handleLinkClick = (link) => {
    if (link.is_external) {
      window.open(link.url, '_blank');
    } else {
      navigate(link.url);
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      icon: link.icon || '🔗',
      description: link.description || '',
      category: link.category || 'general',
      is_external: link.is_external || false
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLink(null);
    setFormData({
      title: '',
      url: '',
      icon: '🔗',
      description: '',
      category: 'general',
      is_external: false
    });
  };

  const emojiOptions = ['🔗', '📄', '🏠', '💼', '📊', '⚙️', '📱', '🌐', '📚', '🎯', '💡', '🚀', '📝', '📧', '📞'];

  return (
    <div className={`h-full ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🔗</div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Quick Links
          </h3>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            data-testid="add-quick-link-button"
            title="Add Quick Link"
          >
            <FaPlus className="text-sm" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {links.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 opacity-50">🔗</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No quick links yet</p>
            {canManage && (
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click the + button to add one</p>
            )}
          </div>
        ) : (
          links.map(link => (
            <div
              key={link.id}
              className={`group p-4 rounded-lg transition-all duration-200 cursor-pointer border transform hover:scale-102 hover:shadow-md ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                  : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleLinkClick(link)}
              data-testid={`quick-link-${link.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">{link.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {link.title}
                      </h4>
                      {link.is_external && (
                        <FaExternalLinkAlt className="text-xs text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    {link.description && (
                      <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(link);
                      }}
                      className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                      data-testid={`edit-link-${link.id}`}
                      title="Edit link"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(link.id);
                      }}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
                      data-testid={`delete-link-${link.id}`}
                      title="Delete link"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={handleCloseModal}>
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-modal-appear`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingLink ? '✏️ Edit Quick Link' : '➕ Add Quick Link'}
              </h3>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., Company Wiki"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  URL *
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="/dashboard or https://example.com"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        formData.icon === emoji
                          ? 'bg-blue-500 scale-110 shadow-md'
                          : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Or enter custom emoji"
                  maxLength={4}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Brief description (optional)"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }">
                <input
                  type="checkbox"
                  id="is_external"
                  checked={formData.is_external}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_external" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  External link (opens in new tab)
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="submit-link-button"
                >
                  {loading ? 'Saving...' : (editingLink ? 'Update Link' : 'Create Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#D1D5DB'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#9CA3AF'};
        }
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default QuickLinksWidget;
