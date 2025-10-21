import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSearch, FaUpload, FaFire } from 'react-icons/fa';
import api from '../services/api';

const GifPicker = ({ onGifSelect, onClose, darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' or 'search'
  const [giphyAvailable, setGiphyAvailable] = useState(true);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrendingGifs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery.trim() && activeTab === 'search') {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchGifs(searchQuery);
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadTrendingGifs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/giphy/trending', {
        params: { limit: 30 }
      });
      
      if (response.data.success) {
        setGifs(response.data.gifs);
        setGiphyAvailable(true);
      }
    } catch (err) {
      console.error('Failed to load trending GIFs:', err);
      if (err.response?.status === 503) {
        setGiphyAvailable(false);
        setError('GIPHY integration not configured. Upload your own GIFs instead!');
      } else {
        setError('Failed to load trending GIFs');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/giphy/search', {
        params: { q: query, limit: 30 }
      });
      
      if (response.data.success) {
        setGifs(response.data.gifs);
        setGiphyAvailable(true);
      }
    } catch (err) {
      console.error('Failed to search GIFs:', err);
      if (err.response?.status === 503) {
        setGiphyAvailable(false);
        setError('GIPHY integration not configured. Upload your own GIFs instead!');
      } else {
        setError('Failed to search GIFs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGifClick = (gif) => {
    onGifSelect({
      url: gif.url,
      preview_url: gif.preview_url,
      title: gif.title,
      width: gif.width,
      height: gif.height,
      source: 'giphy',
      id: gif.id
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's a GIF
    if (!file.type.includes('gif')) {
      setError('Please select a GIF file');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('GIF size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const uploadedFile = response.data.file;
        onGifSelect({
          url: uploadedFile.url,
          filename: uploadedFile.filename,
          source: 'upload',
          id: uploadedFile.id
        });
      }
    } catch (err) {
      console.error('Failed to upload GIF:', err);
      setError('Failed to upload GIF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Choose a GIF
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}
            data-testid="close-gif-picker"
          >
            <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Tabs and Upload Button */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'trending'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!giphyAvailable}
              data-testid="trending-tab"
            >
              <FaFire className="inline mr-2" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'search'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!giphyAvailable}
              data-testid="search-tab"
            >
              <FaSearch className="inline mr-2" />
              Search
            </button>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".gif,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="upload-gif-button"
            >
              <FaUpload className="inline mr-2" />
              Upload GIF
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'search' && giphyAvailable && (
          <div className="p-4">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for GIFs..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
                autoFocus
                data-testid="gif-search-input"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading GIFs...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-500 text-center">
                <p className="text-lg font-medium">{error}</p>
              </div>
              {!giphyAvailable && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  <FaUpload className="inline mr-2" />
                  Upload Your GIF
                </button>
              )}
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-lg">No GIFs found</p>
                {activeTab === 'search' && (
                  <p className="text-sm mt-2">Try a different search term</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" data-testid="gif-grid">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleGifClick(gif)}
                  className={`relative aspect-square overflow-hidden rounded-lg hover:opacity-80 transition group ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                  data-testid="gif-item"
                >
                  <img
                    src={gif.preview_url || gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Powered by GIPHY */}
        {giphyAvailable && (
          <div className={`p-3 text-center text-xs ${darkMode ? 'text-gray-500 bg-gray-750' : 'text-gray-500 bg-gray-50'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            Powered by GIPHY
          </div>
        )}
      </div>
    </div>
  );
};

export default GifPicker;
