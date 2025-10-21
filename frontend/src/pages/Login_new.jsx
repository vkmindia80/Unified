import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Prefill for demo
  const handleDemoLogin = (role) => {
    if (role === 'employee') {
      setEmail('test@company.com');
      setPassword('Test123!');
    } else if (role === 'admin') {
      setEmail('admin@company.com');
      setPassword('Admin123!');
    } else if (role === 'manager') {
      setEmail('manager@company.com');
      setPassword('Manager123!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-corporate-300 dark:bg-corporate-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-300 dark:bg-accent-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-corporate-600 to-corporate-800 rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-3xl">EC</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-primary-600 dark:text-primary-400">Sign in to your Enterprise Communications account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-primary-700/50 animate-scale-in">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 animate-slide-up" data-testid="login-error">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon={FiMail}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              data-testid="email-input"
            />

            <Input
              label="Password"
              type="password"
              icon={FiLock}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              data-testid="password-input"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-corporate-600 border-gray-300 rounded focus:ring-corporate-500 transition-all"
                />
                <span className="ml-2 text-primary-700 dark:text-primary-300 group-hover:text-corporate-600 dark:group-hover:text-corporate-400 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-corporate-600 hover:text-corporate-700 dark:text-corporate-400 dark:hover:text-corporate-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              data-testid="login-button"
              icon={FiArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-primary-700">
            <p className="text-xs text-primary-500 dark:text-primary-400 text-center mb-3 font-medium uppercase tracking-wide">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                className="px-3 py-2.5 text-xs font-medium text-corporate-700 dark:text-corporate-300 bg-corporate-50 dark:bg-corporate-900/20 hover:bg-corporate-100 dark:hover:bg-corporate-900/40 rounded-lg transition-all transform hover:scale-105"
                data-testid="demo-employee"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                className="px-3 py-2.5 text-xs font-medium text-corporate-700 dark:text-corporate-300 bg-corporate-50 dark:bg-corporate-900/20 hover:bg-corporate-100 dark:hover:bg-corporate-900/40 rounded-lg transition-all transform hover:scale-105"
                data-testid="demo-manager"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2.5 text-xs font-medium text-corporate-700 dark:text-corporate-300 bg-corporate-50 dark:bg-corporate-900/20 hover:bg-corporate-100 dark:hover:bg-corporate-900/40 rounded-lg transition-all transform hover:scale-105"
                data-testid="demo-admin"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600 dark:text-primary-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-corporate-600 hover:text-corporate-700 dark:text-corporate-400 dark:hover:text-corporate-300 transition-colors" data-testid="register-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-primary-500 dark:text-primary-400 animate-fade-in">
          &copy; 2025 Enterprise Communications. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
