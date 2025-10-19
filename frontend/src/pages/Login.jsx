import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaRocket, FaDatabase } from 'react-icons/fa';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingData, setGeneratingData] = useState(false);
  const [demoDataMessage, setDemoDataMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [autoFillMessage, setAutoFillMessage] = useState('');

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    console.log('fillDemoCredentials called with:', demoEmail, demoPassword);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setDemoDataMessage('');
    setAutoFillMessage(`✅ Credentials filled: ${demoEmail}`);
    setTimeout(() => setAutoFillMessage(''), 3000);
    console.log('Credentials filled successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDemoDataMessage('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const generateDemoData = async () => {
    setGeneratingData(true);
    setError('');
    setDemoDataMessage('');
    
    try {
      const response = await api.post('/generate-demo-data');
      const { stats } = response.data;
      
      setDemoDataMessage(
        `✅ Demo data generated! Created ${stats.users} users, ${stats.chats} chats, ` +
        `${stats.messages} messages, ${stats.achievements} achievements, ${stats.challenges} challenges, ` +
        `and ${stats.rewards} rewards. Points awarded: ${stats.points_awarded}`
      );
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate demo data');
    } finally {
      setGeneratingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <FaRocket className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Enterprise Hub</h1>
          <p className="text-blue-100">Communication & Gamification Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {demoDataMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {demoDataMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Try with demo account</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {/* Employee Demo */}
              <button
                type="button"
                onClick={() => fillDemoCredentials('test@company.com', 'Test123!')}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all group"
                data-testid="demo-employee"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    E
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Employee Demo</p>
                    <p className="text-xs text-gray-600">test@company.com</p>
                  </div>
                </div>
                <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">Click to use →</span>
              </button>

              {/* Admin Demo */}
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@company.com', 'Admin123!')}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all group"
                data-testid="demo-admin"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Admin Demo</p>
                    <p className="text-xs text-gray-600">admin@company.com</p>
                  </div>
                </div>
                <span className="text-xs text-purple-600 group-hover:text-purple-700 font-medium">Click to use →</span>
              </button>

              {/* Manager Demo */}
              <button
                type="button"
                onClick={() => fillDemoCredentials('manager@company.com', 'Manager123!')}
                className="w-full flex items-center justify-between px-4 py-3 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-lg transition-all group"
                data-testid="demo-manager"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Manager Demo</p>
                    <p className="text-xs text-gray-600">manager@company.com</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 group-hover:text-green-700 font-medium">Click to use →</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                💡 Click any demo account to auto-fill credentials
              </p>
            </div>
          </div>

          {/* Generate Demo Data Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={generateDemoData}
              disabled={generatingData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              data-testid="generate-demo-data-btn"
            >
              <FaDatabase className="text-lg" />
              <span>{generatingData ? 'Generating Demo Data...' : 'Generate Demo Data'}</span>
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              🎲 Creates users, chats, messages, achievements & more for testing
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;