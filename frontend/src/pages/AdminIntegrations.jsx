import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FaArrowLeft, FaCog, FaKey, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

function AdminIntegrations() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [editedKeys, setEditedKeys] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchIntegrations();
  }, [user, navigate]);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/admin/integrations');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowKey = (integrationName) => {
    setShowKeys(prev => ({
      ...prev,
      [integrationName]: !prev[integrationName]
    }));
  };

  const handleKeyChange = (integrationName, value) => {
    setEditedKeys(prev => ({
      ...prev,
      [integrationName]: value
    }));
  };

  const saveIntegration = async (integration) => {
    setSaving(prev => ({ ...prev, [integration.name]: true }));
    
    try {
      const updateData = {
        api_key: editedKeys[integration.name] || integration.api_key,
        enabled: integration.enabled
      };

      await api.put(`/admin/integrations/${integration.name}`, updateData);
      
      toast.success(`${integration.display_name} updated successfully!`);
      
      // Clear edited key
      setEditedKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[integration.name];
        return newKeys;
      });
      
      // Refresh integrations
      await fetchIntegrations();
    } catch (error) {
      console.error('Failed to update integration:', error);
      toast.error(`Failed to update ${integration.display_name}`);
    } finally {
      setSaving(prev => ({ ...prev, [integration.name]: false }));
    }
  };

  const toggleIntegration = async (integration) => {
    try {
      await api.put(`/admin/integrations/${integration.name}`, {
        enabled: !integration.enabled
      });
      
      toast.success(`${integration.display_name} ${!integration.enabled ? 'enabled' : 'disabled'}`);
      await fetchIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const getIntegrationIcon = (name) => {
    switch (name) {
      case 'giphy':
        return '🎬';
      default:
        return '🔌';
    }
  };

  const getIntegrationInstructions = (name) => {
    switch (name) {
      case 'giphy':
        return (
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            <p className="mb-1">To get a GIPHY API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">developers.giphy.com</a></li>
              <li>Create a free account or log in</li>
              <li>Create a new app and select "API" type</li>
              <li>Copy your API key and paste it above</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className={`mr-2 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition`}
              data-testid="back-button"
            >
              <FaArrowLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <FaCog className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Integration Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}
              data-testid={`integration-${integration.name}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-4xl">
                    {getIntegrationIcon(integration.name)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {integration.display_name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {integration.description}
                    </p>
                  </div>
                </div>
                
                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleIntegration(integration)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                    integration.enabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  data-testid={`toggle-${integration.name}`}
                >
                  {integration.enabled ? (
                    <>
                      <FaCheck />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      <span>Disabled</span>
                    </>
                  )}
                </button>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaKey className="inline mr-2" />
                  API Key
                </label>
                
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[integration.name] ? 'text' : 'password'}
                      value={editedKeys[integration.name] !== undefined 
                        ? editedKeys[integration.name] 
                        : integration.api_key || ''}
                      onChange={(e) => handleKeyChange(integration.name, e.target.value)}
                      placeholder="Enter API key..."
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                      }`}
                      data-testid={`api-key-input-${integration.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(integration.name)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      data-testid={`toggle-visibility-${integration.name}`}
                    >
                      {showKeys[integration.name] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => saveIntegration(integration)}
                    disabled={saving[integration.name] || (!editedKeys[integration.name] && integration.api_key)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    data-testid={`save-${integration.name}`}
                  >
                    <FaSave />
                    <span>{saving[integration.name] ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>

                {/* Current Status */}
                {integration.api_key && !editedKeys[integration.name] && (
                  <div className="flex items-center space-x-2">
                    <FaCheck className="text-green-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      API key configured: {integration.api_key_masked}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {getIntegrationInstructions(integration.name)}

              {/* Last Updated */}
              {integration.updated_at && (
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-4`}>
                  Last updated: {new Date(integration.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            <strong>Note:</strong> Integration settings are saved securely and will be used across the application. 
            Make sure to test the integration after updating the API key.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminIntegrations;
