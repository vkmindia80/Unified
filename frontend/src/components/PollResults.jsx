import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

const PollResults = ({ poll, onClose }) => {
  const { darkMode } = useTheme();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [poll.id]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/polls/${poll.id}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.detail || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        data-testid="poll-results-modal"
      >
        {/* Header */}
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Poll Results
              </h2>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {poll.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-2xl`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading results...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {results.total_votes}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Votes
                    </div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {results.results?.length || 0}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Questions
                    </div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {poll.status === 'closed' ? 'Closed' : 'Active'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status
                    </div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {poll.anonymous_voting ? 'Yes' : 'No'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Anonymous
                    </div>
                  </div>
                </div>
              </div>

              {/* Results by Question */}
              <div className="space-y-8">
                {results.results?.map((result, qIndex) => (
                  <div
                    key={qIndex}
                    className={`p-6 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}
                  >
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Question {qIndex + 1}: {result.question}
                    </h3>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.total_responses} responses
                    </p>

                    {/* Single/Multiple Choice Results */}
                    {(result.type === 'single_choice' || result.type === 'multiple_choice') && (
                      <div className="space-y-4">
                        {Object.entries(result.options || {}).map(([optionId, optionData], idx) => (
                          <div key={optionId}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {optionData.text}
                              </span>
                              <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {optionData.count} ({optionData.percentage}%)
                              </span>
                            </div>
                            <div className={`h-8 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className={`h-full ${getBarColor(idx)} transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold`}
                                style={{ width: `${optionData.percentage}%` }}
                              >
                                {optionData.percentage > 10 && `${optionData.percentage}%`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rating Results */}
                    {result.type === 'rating' && (
                      <div>
                        <div className={`text-center mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className={`text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {result.average_rating || 0}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Average Rating
                          </div>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(result.rating_distribution || {})
                            .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                            .map(([rating, data], idx) => (
                              <div key={rating} className="flex items-center gap-3">
                                <div className={`w-12 text-right font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {rating} ⭐
                                </div>
                                <div className="flex-1">
                                  <div className={`h-6 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                      className={`h-full ${getBarColor(idx)} transition-all duration-500`}
                                      style={{ width: `${data.percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <div className={`w-20 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {data.count} ({data.percentage}%)
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Open-Ended Results */}
                    {result.type === 'open_ended' && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {result.text_responses && result.text_responses.length > 0 ? (
                          result.text_responses.map((response, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                "{response.text}"
                              </p>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {response.user ? (
                                  <span>— {response.user.full_name}</span>
                                ) : (
                                  <span>— Anonymous</span>
                                )}
                                {response.created_at && (
                                  <span className="ml-2">
                                    {new Date(response.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={`text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No responses yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollResults;
