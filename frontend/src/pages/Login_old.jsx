import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
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
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-corporate-600 to-corporate-800 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">EC</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome Back</h1>
          <p className="text-primary-600">Sign in to your Enterprise Communications account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-large p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3" data-testid="login-error">
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-corporate-600 border-gray-300 rounded focus:ring-corporate-500"
                />
                <span className="ml-2 text-primary-700">Remember me</span>
              </label>
              <a href="#" className="text-corporate-600 hover:text-corporate-700 font-medium">
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
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-primary-500 text-center mb-3 font-medium uppercase tracking-wide">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                className="px-3 py-2 text-xs font-medium text-corporate-700 bg-corporate-50 hover:bg-corporate-100 rounded-lg transition-colors"
                data-testid="demo-employee"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                className="px-3 py-2 text-xs font-medium text-corporate-700 bg-corporate-50 hover:bg-corporate-100 rounded-lg transition-colors"
                data-testid="demo-manager"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2 text-xs font-medium text-corporate-700 bg-corporate-50 hover:bg-corporate-100 rounded-lg transition-colors"
                data-testid="demo-admin"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-corporate-600 hover:text-corporate-700" data-testid="register-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-primary-500">
          &copy; 2025 Enterprise Communications. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
