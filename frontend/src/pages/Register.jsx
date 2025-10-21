import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiBriefcase, FiUsers } from 'react-icons/fi';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    department: '',
    team: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'department_head', label: 'Department Head' },
  ];

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Design', label: 'Design' },
    { value: 'Finance', label: 'Finance' },
  ];

  const teamOptions = [
    { value: '', label: 'Select Team' },
    { value: 'Alpha', label: 'Alpha' },
    { value: 'Beta', label: 'Beta' },
    { value: 'Gamma', label: 'Gamma' },
    { value: 'Delta', label: 'Delta' },
    { value: 'Omega', label: 'Omega' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-corporate-300 dark:bg-corporate-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-300 dark:bg-accent-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-2xl w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-corporate-600 to-corporate-800 rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-3xl">EC</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">Create Your Account</h1>
          <p className="text-primary-600 dark:text-primary-400">Join your team on Enterprise Communications</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 dark:bg-primary-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-primary-700/50 animate-scale-in">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 animate-slide-up" data-testid="register-error">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                type="text"
                name="full_name"
                icon={FiUser}
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
                fullWidth
                data-testid="full-name-input"
              />

              <Input
                label="Username"
                type="text"
                name="username"
                icon={FiUser}
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
                data-testid="username-input"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              icon={FiMail}
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              data-testid="email-input"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              icon={FiLock}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              helperText="Minimum 8 characters"
              data-testid="password-input"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Select
                label="Role"
                name="role"
                options={roleOptions}
                value={formData.role}
                onChange={handleChange}
                fullWidth
                data-testid="role-select"
              />

              <Select
                label="Department"
                name="department"
                options={departmentOptions}
                value={formData.department}
                onChange={handleChange}
                fullWidth
                data-testid="department-select"
              />

              <Select
                label="Team"
                name="team"
                options={teamOptions}
                value={formData.team}
                onChange={handleChange}
                fullWidth
                data-testid="team-select"
              />
            </div>

            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FiCheckCircle className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-accent-900">Welcome Bonus</p>
                  <p className="text-xs text-accent-700 mt-1">Get 50 points instantly when you create your account!</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              data-testid="register-button"
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-corporate-600 hover:text-corporate-700" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-primary-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Register;
