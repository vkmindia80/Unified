import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

function CreateSubspaceModal({ spaceId, spaceName, onClose, onCreate, darkMode }) {
  const [subspaceName, setSubspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📂');
  const [loading, setLoading] = useState(false);

  const emojiOptions = ['📂', '📋', '🎯', '💼', '🔧', '📊', '🎨', '🌟', '⚡', '🔥', '💡', '🚀'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subspaceName.trim()) return;

    setLoading(true);
    try {
      await onCreate(spaceId, {
        name: subspaceName,
        description,
        icon
      });
      onClose();
    } catch (error) {
      console.error('Failed to create subspace:', error);
      alert('Failed to create subspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Create Subspace
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              in {spaceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subspace Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Subspace Name *
            </label>
            <input
              type="text"
              value={subspaceName}
              onChange={(e) => setSubspaceName(e.target.value)}
              placeholder="e.g., Frontend Team, Backend Team"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
              }`}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this subspace about?"
              rows={2}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded-lg border-2 transition ${
                    icon === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !subspaceName.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Subspace'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition ${
                darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSubspaceModal;
