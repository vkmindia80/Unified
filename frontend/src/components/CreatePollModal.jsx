import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

const CreatePollModal = ({ onClose, onPollCreated }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    anonymous_voting: false,
    show_results_before_close: true,
    expires_at: '',
    target_audience: 'all',
    target_value: ''
  });

  const [questions, setQuestions] = useState([
    {
      question: '',
      type: 'single_choice',
      options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }],
      rating_scale: 5,
      required: true
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex].text = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push({ id: crypto.randomUUID(), text: '' });
    setQuestions(updatedQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options.length > 2) {
      updatedQuestions[qIndex].options.splice(oIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'single_choice',
      options: [{ id: crypto.randomUUID(), text: '' }, { id: crypto.randomUUID(), text: '' }],
      rating_scale: 5,
      required: true
    }]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, idx) => idx !== qIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Poll title is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if ((q.type === 'single_choice' || q.type === 'multiple_choice')) {
        const validOptions = q.options.filter(opt => opt.text.trim());
        if (validOptions.length < 2) {
          setError(`Question ${i + 1} must have at least 2 options`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Format questions for API
      const formattedQuestions = questions.map(q => {
        const question = {
          question: q.question,
          type: q.type,
          required: q.required
        };

        if (q.type === 'single_choice' || q.type === 'multiple_choice') {
          question.options = q.options.filter(opt => opt.text.trim()).map(opt => ({
            id: opt.id,
            text: opt.text
          }));
        }

        if (q.type === 'rating') {
          question.rating_scale = q.rating_scale;
        }

        return question;
      });

      const pollData = {
        ...formData,
        questions: formattedQuestions
      };

      const response = await axios.post(`${API_URL}/api/polls`, pollData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onPollCreated(response.data);
    } catch (error) {
      console.error('Error creating poll:', error);
      setError(error.response?.data?.detail || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        data-testid="create-poll-modal"
      >
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 z-10`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Create New Poll
            </h2>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-2xl`}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Poll Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="What's your poll about?"
                data-testid="poll-title-input"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="Add more details about this poll..."
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Questions
            </h3>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Question {qIndex + 1}
                  </h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your question"
                  />

                  <div className="flex gap-4">
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="rating">Rating Scale</option>
                      <option value="open_ended">Open-Ended</option>
                    </select>
                  </div>

                  {/* Options for choice-based questions */}
                  {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Options
                      </label>
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex gap-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className={`flex-1 px-4 py-2 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="px-3 py-2 text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {/* Rating scale */}
                  {question.type === 'rating' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Rating Scale
                      </label>
                      <select
                        value={question.rating_scale}
                        onChange={(e) => handleQuestionChange(qIndex, 'rating_scale', parseInt(e.target.value))}
                        className={`px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="5">1-5</option>
                        <option value="10">1-10</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              + Add Another Question
            </button>
          </div>

          {/* Poll Settings */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} space-y-4`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Poll Settings
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous_voting"
                name="anonymous_voting"
                checked={formData.anonymous_voting}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="anonymous_voting" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Allow anonymous voting
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="show_results_before_close"
                name="show_results_before_close"
                checked={formData.show_results_before_close}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="show_results_before_close" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Show live results (uncheck to hide results until poll closes)
              </label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Audience
              </label>
              <select
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">Everyone</option>
                <option value="department">Specific Department</option>
                <option value="team">Specific Team</option>
                <option value="role">Specific Role</option>
              </select>
            </div>

            {formData.target_audience !== 'all' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.target_audience === 'department' ? 'Department' :
                   formData.target_audience === 'team' ? 'Team' : 'Role'}
                </label>
                <input
                  type="text"
                  name="target_value"
                  value={formData.target_value}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder={`Enter ${formData.target_audience}`}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg font-semibold ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-poll-btn"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
