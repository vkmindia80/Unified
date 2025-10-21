import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { FaPlus, FaExternalLinkAlt, FaEdit, FaTrash } from 'react-icons/fa';

function QuickLinksWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
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
      const response = await api.get('/api/quick-links');
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching quick links:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await api.put(`/api/quick-links/${editingLink.id}`, formData);
      } else {
        await api.post('/api/quick-links', formData);
      }
      fetchLinks();
      setShowModal(false);
      setEditingLink(null);
      setFormData({ title: '', url: '', icon: '🔗', description: '', category: 'general', is_external: false });
    } catch (error) {
      console.error('Error saving quick link:', error);
    }
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Delete this quick link?')) {
      try {
        await api.delete(`/api/quick-links/${linkId}`);
        fetchLinks();
      } catch (error) {
        console.error('Error deleting quick link:', error);
      }
    }
  };

  const handleLinkClick = (link) => {
    if (link.is_external) {
      window.open(link.url, '_blank');
    } else {
      navigate(link.url);
    }
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          🔗 Quick Links
        </h3>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            data-testid="add-quick-link-button"
          >
            <FaPlus />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {links.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔗</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No quick links yet</p>
          </div>
        ) : (
          links.map(link => (
            <div
              key={link.id}
              className={`group p-3 rounded-lg transition cursor-pointer ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => handleLinkClick(link)}
              data-testid={`quick-link-${link.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{link.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {link.title}
                      </h4>
                      {link.is_external && <FaExternalLinkAlt className="text-xs text-blue-500" />}
                    </div>
                    {link.description && (
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLink(link);
                        setFormData(link);
                        setShowModal(true);
                      }}
                      className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(link.id);
                      }}
                      className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingLink ? 'Edit Quick Link' : 'Add Quick Link'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  URL
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="/dashboard or https://example.com"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  maxLength={2}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_external}
                  onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                  className="rounded"
                />
                <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  External link (opens in new tab)
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLink(null);
                    setFormData({ title: '', url: '', icon: '🔗', description: '', category: 'general', is_external: false });
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {editingLink ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickLinksWidget;