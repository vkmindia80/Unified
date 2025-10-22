import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

function CalendarWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_time: '',
    end_time: '',
    location: '',
    all_day: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/upcoming');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Ensure dates are in ISO format
      const submitData = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : '',
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, submitData);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', submitData);
        toast.success('Event created successfully!');
      }
      
      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.detail || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully!');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    let startTime = '';
    let endTime = '';
    
    try {
      if (event.start_time) {
        const startDate = new Date(event.start_time);
        startTime = format(startDate, "yyyy-MM-dd'T'HH:mm");
      }
      if (event.end_time) {
        const endDate = new Date(event.end_time);
        endTime = format(endDate, "yyyy-MM-dd'T'HH:mm");
      }
    } catch (err) {
      console.error('Error parsing dates:', err);
    }
    
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'meeting',
      start_time: startTime,
      end_time: endTime,
      location: event.location || '',
      all_day: event.all_day || false
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'meeting',
      start_time: '',
      end_time: '',
      location: '',
      all_day: false
    });
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'meeting': return '💼';
      case 'deadline': return '⏰';
      case 'company_event': return '🎉';
      default: return '📅';
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'meeting': return darkMode ? 'border-blue-500' : 'border-blue-400';
      case 'deadline': return darkMode ? 'border-red-500' : 'border-red-400';
      case 'company_event': return darkMode ? 'border-purple-500' : 'border-purple-400';
      default: return darkMode ? 'border-gray-500' : 'border-gray-400';
    }
  };

  const getEventBgColor = (type) => {
    switch(type) {
      case 'meeting': return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
      case 'deadline': return darkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'company_event': return darkMode ? 'bg-purple-900/20' : 'bg-purple-50';
      default: return darkMode ? 'bg-gray-800' : 'bg-gray-50';
    }
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">📅</div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Calendar
          </h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          data-testid="add-event-button"
          title="Add Event"
        >
          <FaPlus className="text-sm" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 opacity-50">📅</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming events</p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click the + button to create one</p>
          </div>
        ) : (
          events.map(event => {
            let startTime;
            try {
              startTime = new Date(event.start_time);
            } catch (err) {
              console.error('Error parsing date:', err);
              return null;
            }
            
            const colorClass = getEventColor(event.event_type);
            const bgColorClass = getEventBgColor(event.event_type);
            
            return (
              <div
                key={event.id}
                className={`group p-4 rounded-lg border-l-4 ${colorClass} ${bgColorClass} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 hover:shadow-md`}
                data-testid={`event-${event.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getEventIcon(event.event_type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 line-clamp-2`}>
                          {event.description}
                        </p>
                      )}
                      <div className={`flex flex-wrap gap-3 mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="flex-shrink-0" />
                          <span>{format(startTime, 'MMM dd, yyyy')}</span>
                        </div>
                        {!event.all_day && (
                          <div className="flex items-center space-x-1">
                            <FaClock className="flex-shrink-0" />
                            <span>{format(startTime, 'h:mm a')}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                      className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                      data-testid={`edit-event-${event.id}`}
                      title="Edit event"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
                      data-testid={`delete-event-${event.id}`}
                      title="Delete event"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={handleCloseModal}>
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar transform transition-all animate-modal-appear`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingEvent ? '✏️ Edit Event' : '➕ Create Event'}
              </h3>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="e.g., Team Meeting"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="meeting">💼 Meeting</option>
                  <option value="deadline">⏰ Deadline</option>
                  <option value="company_event">🎉 Company Event</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Meeting room or online link"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Event details (optional)"
                />
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  id="all_day"
                  checked={formData.all_day}
                  onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="all_day" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  All day event
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="submit-event-button"
                >
                  {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#D1D5DB'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#9CA3AF'};
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CalendarWidget;
