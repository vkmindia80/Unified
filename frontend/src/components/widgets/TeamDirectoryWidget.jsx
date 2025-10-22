import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { FaSearch, FaPhone, FaComments, FaCircle } from 'react-icons/fa';

function TeamDirectoryWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [directory, setDirectory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectory();
  }, [search]);

  const fetchDirectory = async () => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/team-directory', { params });
      setDirectory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team directory:', error);
      setLoading(false);
    }
  };

  const handleChat = (userId) => {
    // Navigate to chat with this user
    navigate('/chat', { state: { userId } });
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        👥 Team Directory
      </h3>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            data-testid="team-search-input"
          />
        </div>
      </div>

      {/* Directory List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : directory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No team members found</p>
          </div>
        ) : (
          directory.map(member => (
            <div
              key={member.id}
              className={`p-3 rounded-lg transition ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              data-testid={`team-member-${member.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      member.id === user?.id ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'
                    }`}>
                      {member.full_name?.charAt(0) || 'U'}
                    </div>
                    {member.is_online && (
                      <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {member.full_name}
                        {member.id === user?.id && <span className="text-xs text-blue-500"> (You)</span>}
                      </h4>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                      {member.role} • {member.department || 'No department'}
                    </p>
                    {member.team && (
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Team {member.team}
                      </p>
                    )}
                  </div>
                </div>
                {member.id !== user?.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleChat(member.id)}
                      className={`p-2 rounded-lg transition ${
                        darkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title="Send message"
                    >
                      <FaComments />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TeamDirectoryWidget;