import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { FaPlus, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';

function CalendarWidget() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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
      const response = await api.get('/api/events/upcoming');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/api/events/${editingEvent.id}`, formData);
      } else {
        await api.post('/api/events', formData);
      }
      fetchEvents();
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
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/api/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    // Format dates for datetime-local input
    const startTime = event.start_time ? format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm") : '';
    const endTime = event.end_time ? format(parseISO(event.end_time), "yyyy-MM-dd'T'HH:mm") : '';
    
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
      case 'meeting': return 'blue';
      case 'deadline': return 'red';
      case 'company_event': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          📅 Calendar
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          data-testid="add-event-button"
        >
          <FaPlus />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No upcoming events</p>
          </div>
        ) : (
          events.map(event => {
            const startTime = parseISO(event.start_time);
            const color = getEventColor(event.event_type);
            
            return (
              <div
                key={event.id}
                className={`group p-3 rounded-lg border-l-4 border-${color}-500 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
                data-testid={`event-${event.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {event.description}
                        </p>
                      )}
                      <div className={`flex flex-wrap gap-3 mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt />
                          <span>{format(startTime, 'MMM dd, yyyy')}</span>
                        </div>
                        {!event.all_day && (
                          <div className="flex items-center space-x-1">
                            <FaClock />
                            <span>{format(startTime, 'h:mm a')}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                      className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
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
                      className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Create Event
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Event Type
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="company_event">Company Event</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Meeting room or online link"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.all_day}
                  onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                  className="rounded"
                />
                <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  All day event
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarWidget;