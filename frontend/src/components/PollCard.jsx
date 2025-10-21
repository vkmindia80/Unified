import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

const PollCard = ({ poll, onVoteSubmitted, onViewResults, onClosePoll, onDeletePoll }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const isClosed = poll.status === 'closed' || isExpired;
  const canManage = user?.role === 'admin' || poll.created_by === user?.id;

  const initializeAnswers = () => {
    const initialAnswers = poll.questions.map((q, idx) => ({
      question_index: idx,
      answer_type: q.type,
      selected_option_ids: [],
      rating_value: null,
      text_answer: ''
    }));
    setAnswers(initialAnswers);
    setShowVoteForm(true);
  };

  const handleOptionSelect = (qIndex, optionId, isMultiple) => {
    const updated = [...answers];
    if (isMultiple) {
      const current = updated[qIndex].selected_option_ids || [];
      if (current.includes(optionId)) {
        updated[qIndex].selected_option_ids = current.filter(id => id !== optionId);
      } else {
        updated[qIndex].selected_option_ids = [...current, optionId];
      }
    } else {
      updated[qIndex].selected_option_ids = [optionId];
    }
    setAnswers(updated);
  };

  const handleRatingSelect = (qIndex, value) => {
    const updated = [...answers];
    updated[qIndex].rating_value = value;
    setAnswers(updated);
  };

  const handleTextChange = (qIndex, text) => {
    const updated = [...answers];
    updated[qIndex].text_answer = text;
    setAnswers(updated);
  };

  const handleSubmitVote = async () => {
    // Validation
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = poll.questions[i];
      
      if (question.required) {
        if (question.type === 'single_choice' || question.type === 'multiple_choice') {
          if (!answer.selected_option_ids || answer.selected_option_ids.length === 0) {
            alert(`Please answer question ${i + 1}`);
            return;
          }
        } else if (question.type === 'rating') {
          if (!answer.rating_value) {
            alert(`Please provide a rating for question ${i + 1}`);
            return;
          }
        } else if (question.type === 'open_ended') {
          if (!answer.text_answer || !answer.text_answer.trim()) {
            alert(`Please answer question ${i + 1}`);
            return;
          }
        }
      }
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/polls/${poll.id}/vote`, {
        poll_id: poll.id,
        answers: answers,
        is_anonymous: isAnonymous
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Vote submitted successfully!');
      setShowVoteForm(false);
      onVoteSubmitted(poll.id);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert(error.response?.data?.detail || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition-shadow p-6`}
      data-testid={`poll-card-${poll.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {poll.title}
            </h3>
            {isClosed && (
              <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                CLOSED
              </span>
            )}
            {!isClosed && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          {poll.description && (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {poll.description}
            </p>
          )}
          <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>
              By {poll.created_by_user?.full_name || 'Admin'}
            </span>
            <span>•</span>
            <span>{formatDate(poll.created_at)}</span>
            {poll.expires_at && (
              <>
                <span>•</span>
                <span>Expires: {formatDate(poll.expires_at)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`flex items-center gap-6 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span>{poll.total_votes || 0} votes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">❓</span>
          <span>{poll.questions?.length || 0} questions</span>
        </div>
        {poll.anonymous_voting && (
          <div className="flex items-center gap-2">
            <span className="text-xl">🕵️</span>
            <span>Anonymous voting</span>
          </div>
        )}
      </div>

      {/* Vote Status */}
      {poll.has_voted && (
        <div className="mb-4 px-4 py-3 bg-blue-100 border border-blue-300 text-blue-800 rounded-lg flex items-center gap-2">
          <span className="text-xl">✓</span>
          <span className="font-medium">You have voted on this poll</span>
        </div>
      )}

      {/* Voting Form */}
      {showVoteForm && !poll.has_voted && !isClosed && (
        <div className={`mb-4 p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
          <div className="space-y-6">
            {poll.questions.map((question, qIndex) => (
              <div key={qIndex}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {qIndex + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h4>

                {/* Single/Multiple Choice */}
                {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-opacity-80 ${
                          answers[qIndex]?.selected_option_ids?.includes(option.id)
                            ? darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'
                            : darkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <input
                          type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                          name={`question-${qIndex}`}
                          checked={answers[qIndex]?.selected_option_ids?.includes(option.id)}
                          onChange={() => handleOptionSelect(qIndex, option.id, question.type === 'multiple_choice')}
                          className="w-4 h-4"
                        />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {option.text}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Rating */}
                {question.type === 'rating' && (
                  <div className="flex gap-2">
                    {Array.from({ length: question.rating_scale || 5 }, (_, i) => i + 1).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingSelect(qIndex, value)}
                        className={`w-12 h-12 rounded-lg font-bold transition-all ${
                          answers[qIndex]?.rating_value === value
                            ? 'bg-blue-500 text-white scale-110'
                            : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}

                {/* Open-Ended */}
                {question.type === 'open_ended' && (
                  <textarea
                    value={answers[qIndex]?.text_answer || ''}
                    onChange={(e) => handleTextChange(qIndex, e.target.value)}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}

            {poll.anonymous_voting && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Submit anonymously
                </span>
              </label>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowVoteForm(false)}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitVote}
              disabled={submitting}
              className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              data-testid="submit-vote-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {!poll.has_voted && !isClosed && !showVoteForm && (
          <button
            onClick={initializeAnswers}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700"
            data-testid="vote-now-btn"
          >
            Vote Now
          </button>
        )}

        {(poll.has_voted || isClosed || (poll.show_results_before_close && poll.total_votes > 0)) && (
          <button
            onClick={() => onViewResults(poll)}
            className={`px-6 py-2 rounded-lg font-semibold ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            data-testid="view-results-btn"
          >
            View Results
          </button>
        )}

        {canManage && !isClosed && (
          <button
            onClick={() => onClosePoll(poll.id)}
            className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
          >
            Close Poll
          </button>
        )}

        {canManage && (
          <button
            onClick={() => onDeletePoll(poll.id)}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;
