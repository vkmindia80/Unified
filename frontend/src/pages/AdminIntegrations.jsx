import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Layout from '../components/Layout/Layout';
import { FaCog, FaKey, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSave, FaSync, FaPlug, FaUsers, FaBriefcase } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminIntegrations() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [syncing, setSyncing] = useState({});
  const [testing, setTesting] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [editedData, setEditedData] = useState({});
  const [filterType, setFilterType] = useState('all'); // 'all', 'hr_system', 'communication'

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

  const toggleShowKey = (integrationName, fieldName) => {
    const key = `${integrationName}_${fieldName}`;
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFieldChange = (integrationName, fieldName, value) => {
    setEditedData(prev => ({
      ...prev,
      [integrationName]: {
        ...prev[integrationName],
        [fieldName]: value
      }
    }));
  };

  const saveIntegration = async (integration) => {
    setSaving(prev => ({ ...prev, [integration.name]: true }));
    
    try {
      const edited = editedData[integration.name] || {};
      const updateData = {
        enabled: integration.enabled
      };

      // Handle api_key separately
      if (edited.api_key !== undefined) {
        updateData.api_key = edited.api_key;
      }

      // Handle other config fields
      const configFields = {};
      Object.keys(edited).forEach(key => {
        if (key !== 'api_key') {
          configFields[key] = edited[key];
        }
      });

      if (Object.keys(configFields).length > 0) {
        updateData.config = configFields;
      }

      await api.put(`/admin/integrations/${integration.name}`, updateData);
      
      toast.success(`${integration.display_name} updated successfully!`);
      
      // Clear edited data
      setEditedData(prev => {
        const newData = { ...prev };
        delete newData[integration.name];
        return newData;
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

  const testConnection = async (integration) => {
    setTesting(prev => ({ ...prev, [integration.name]: true }));
    
    try {
      const response = await api.post(`/integrations/${integration.name}/test-connection`);
      
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      toast.error('Connection test failed');
    } finally {
      setTesting(prev => ({ ...prev, [integration.name]: false }));
    }
  };

  const syncEmployees = async (integration) => {
    setSyncing(prev => ({ ...prev, [integration.name]: true }));
    
    try {
      const response = await api.post(`/integrations/${integration.name}/sync-employees`);
      
      if (response.data.success) {
        toast.success(
          `${response.data.message}. Synced: ${response.data.synced}, Updated: ${response.data.updated}`
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to sync employees:', error);
      toast.error('Employee sync failed');
    } finally {
      setSyncing(prev => ({ ...prev, [integration.name]: false }));
    }
  };

  const syncFinancials = async (integration) => {
    setSyncing(prev => ({ ...prev, [integration.name]: true }));
    
    try {
      const response = await api.post(`/integrations/${integration.name}/sync-financials`);
      
      if (response.data.success) {
        toast.success(
          `${response.data.message}. Synced: ${response.data.synced}, Updated: ${response.data.updated}`
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to sync financials:', error);
      toast.error('Financial sync failed');
    } finally {
      setSyncing(prev => ({ ...prev, [integration.name]: false }));
    }
  };

  const getIntegrationIcon = (name, type) => {
    // HR System specific icons
    const hrIcons = {
      'bamboohr': '🎋',
      'workday': '💼',
      'adp': '📊',
      'gusto': '💰',
      'namely': '👥',
      'sap_successfactors': '🏢',
      'oracle_hcm': '🏛️',
      'rippling': '🌊',
      'zenefits': '⚡',
      'paycor': '💳'
    };

    // Accounting System specific icons
    const accountingIcons = {
      'quickbooks': '📗',
      'xero': '💙',
      'freshbooks': '📘',
      'sage': '🌿',
      'netsuite': '🔷'
    };

    // Communication icons
    const commIcons = {
      'giphy': '🎬'
    };

    return hrIcons[name] || accountingIcons[name] || commIcons[name] || '🔌';
  };

  const getIntegrationInstructions = (name) => {
    const instructions = {
      'giphy': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get a GIPHY API key:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">developers.giphy.com</a></li>
            <li>Create a free account or log in</li>
            <li>Create a new app and select "API" type</li>
            <li>Copy your API key and paste it above</li>
          </ol>
        </div>
      ),
      'bamboohr': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get BambooHR API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Log in to your BambooHR account</li>
            <li>Go to Account {'>'} API Keys</li>
            <li>Generate a new API key</li>
            <li>Your subdomain is the part before .bamboohr.com in your URL</li>
          </ol>
        </div>
      ),
      'workday': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get Workday API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Contact your Workday administrator</li>
            <li>Request API Client ID and Secret</li>
            <li>Get your tenant name from your Workday URL</li>
          </ol>
        </div>
      ),
      'gusto': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get Gusto API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://dev.gusto.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">dev.gusto.com</a></li>
            <li>Create an application</li>
            <li>Get your API token and Company ID</li>
          </ol>
        </div>
      ),
      'rippling': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get Rippling API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Log in to Rippling as admin</li>
            <li>Go to Settings {'>'} Integrations {'>'} API</li>
            <li>Generate an API key</li>
          </ol>
        </div>
      ),
      'quickbooks': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1 font-semibold">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://developer.intuit.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">developer.intuit.com</a></li>
            <li>Create an app and get OAuth 2.0 Client ID and Client Secret</li>
            <li>Find your Company ID (Realm ID) in QuickBooks settings</li>
            <li>Use OAuth Playground or Postman to obtain Access Token and Refresh Token</li>
            <li>Paste tokens below to enable sync functionality</li>
          </ol>
          <p className="mt-2 text-xs italic">💡 Tip: Access tokens expire in 1 hour. Provide a refresh token for automatic renewal.</p>
        </div>
      ),
      'xero': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get Xero API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://developer.xero.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">developer.xero.com</a></li>
            <li>Create a new app in the Developer Portal</li>
            <li>Get your Client ID and Secret</li>
            <li>Find Tenant ID after OAuth connection</li>
          </ol>
        </div>
      ),
      'freshbooks': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get FreshBooks API credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Visit <a href="https://www.freshbooks.com/api/start" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FreshBooks API</a></li>
            <li>Create an application</li>
            <li>Get your Client ID and Secret</li>
            <li>Find your Account ID in FreshBooks settings</li>
          </ol>
        </div>
      ),
      'sage': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get Sage Business Cloud credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Log in to Sage Business Cloud</li>
            <li>Go to Settings {'>'} API Integration</li>
            <li>Generate API credentials</li>
            <li>Note your company ID and region</li>
          </ol>
        </div>
      ),
      'netsuite': (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          <p className="mb-1">To get NetSuite credentials:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Log in to NetSuite as administrator</li>
            <li>Enable Token-Based Authentication (TBA)</li>
            <li>Create integration record and get Consumer Key/Secret</li>
            <li>Create access token and get Token ID/Secret</li>
          </ol>
        </div>
      )
    };

    return instructions[name] || null;
  };

  const getFieldValue = (integration, fieldName) => {
    // Check if there's edited data
    const edited = editedData[integration.name];
    if (edited && edited[fieldName] !== undefined) {
      return edited[fieldName];
    }

    // Return stored value
    if (fieldName === 'api_key') {
      return integration.api_key || '';
    }
    return integration.config?.[fieldName] || integration.config_masked?.[fieldName] || '';
  };

  const filteredIntegrations = integrations.filter(int => {
    if (filterType === 'all') return true;
    return int.type === filterType;
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? 'dark' : 'light'} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FaCog className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Integration Settings
          </h1>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Configure third-party integrations and HR systems
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaPlug className="inline mr-2" />
            All Integrations
          </button>
          <button
            onClick={() => setFilterType('hr_system')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'hr_system'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaBriefcase className="inline mr-2" />
            HR Systems ({integrations.filter(i => i.type === 'hr_system').length})
          </button>
          <button
            onClick={() => setFilterType('accounting_system')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'accounting_system'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaUsers className="inline mr-2" />
            Accounting ({integrations.filter(i => i.type === 'accounting_system').length})
          </button>
          <button
            onClick={() => setFilterType('communication')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'communication'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaPlug className="inline mr-2" />
            Communication
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 hover:shadow-lg transition`}
              data-testid={`integration-${integration.name}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-4xl">
                    {getIntegrationIcon(integration.name, integration.type)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {integration.display_name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {integration.description}
                    </p>
                    {integration.type === 'hr_system' && (
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                      }`}>
                        HR System
                      </span>
                    )}
                    {integration.type === 'accounting_system' && (
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        Accounting
                      </span>
                    )}
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

              {/* Dynamic Configuration Fields */}
              <div className="space-y-3">
                {integration.fields && integration.fields.map((field) => (
                  <div key={field.name}>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys[`${integration.name}_${field.name}`] ? 'text' : field.type}
                        value={getFieldValue(integration, field.name)}
                        onChange={(e) => handleFieldChange(integration.name, field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                        }`}
                        data-testid={`${field.name}-input-${integration.name}`}
                      />
                      {(field.type === 'password' || field.name.includes('secret') || field.name.includes('token')) && (
                        <button
                          type="button"
                          onClick={() => toggleShowKey(integration.name, field.name)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                          data-testid={`toggle-visibility-${integration.name}-${field.name}`}
                        >
                          {showKeys[`${integration.name}_${field.name}`] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => saveIntegration(integration)}
                  disabled={saving[integration.name]}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  data-testid={`save-${integration.name}`}
                >
                  <FaSave />
                  <span>{saving[integration.name] ? 'Saving...' : 'Save'}</span>
                </button>

                {(integration.type === 'hr_system' || integration.type === 'accounting_system') && integration.enabled && (
                  <>
                    <button
                      onClick={() => testConnection(integration)}
                      disabled={testing[integration.name]}
                      className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50`}
                      data-testid={`test-${integration.name}`}
                    >
                      <FaPlug />
                      <span>{testing[integration.name] ? 'Testing...' : 'Test'}</span>
                    </button>

                    {integration.type === 'hr_system' && (
                      <button
                        onClick={() => syncEmployees(integration)}
                        disabled={syncing[integration.name]}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center space-x-2"
                        data-testid={`sync-${integration.name}`}
                      >
                        <FaSync className={syncing[integration.name] ? 'animate-spin' : ''} />
                        <span>{syncing[integration.name] ? 'Syncing...' : 'Sync Employees'}</span>
                      </button>
                    )}

                    {integration.type === 'accounting_system' && (
                      <button
                        onClick={() => syncFinancials(integration)}
                        disabled={syncing[integration.name]}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center space-x-2"
                        data-testid={`sync-${integration.name}`}
                      >
                        <FaSync className={syncing[integration.name] ? 'animate-spin' : ''} />
                        <span>{syncing[integration.name] ? 'Syncing...' : 'Sync Data'}</span>
                      </button>
                    )}
                  </>
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

        {filteredIntegrations.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FaPlug className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No integrations found for this filter</p>
          </div>
        )}

        {/* Help Text */}
        <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            <strong>Note:</strong> Integration settings are saved securely and encrypted. 
            For <strong>HR systems</strong>, use "Sync Employees" to import employee data. 
            For <strong>Accounting systems</strong>, use "Sync Data" to import financial information and expense categories.
            All data is synchronized safely and can be used for gamification and reporting.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default AdminIntegrations;
