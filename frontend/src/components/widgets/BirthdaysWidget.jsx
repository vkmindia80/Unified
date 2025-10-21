import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaBirthdayCake, FaTrophy } from 'react-icons/fa';

function BirthdaysWidget() {
  const { darkMode } = useTheme();
  const [celebrations, setCelebrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCelebrations();
  }, []);

  const fetchCelebrations = async () => {
    try {
      const response = await api.get('/api/birthdays/upcoming');
      setCelebrations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'birthday' ? '🎂' : '🎉';
  };

  const getTypeLabel = (type) => {
    return type === 'birthday' ? 'Birthday' : 'Work Anniversary';
  };

  return (
    <div className={`h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-hidden flex flex-col`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        🎉 Celebrations
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : celebrations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎂</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No upcoming celebrations</p>
          </div>
        ) : (
          celebrations.map((celebration, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg transition ${
                darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}
              data-testid={`celebration-${index}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getTypeIcon(celebration.type)}</span>
                <div className="flex-1">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {celebration.user.full_name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getTypeLabel(celebration.type)}
                    {celebration.years && ` • ${celebration.years} years`}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    {celebration.days_until === 0 ? 'Today!' : 
                     celebration.days_until === 1 ? 'Tomorrow' :
                     `In ${celebration.days_until} days`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BirthdaysWidget;