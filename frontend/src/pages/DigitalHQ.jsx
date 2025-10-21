import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import QuickLinksWidget from '../components/widgets/QuickLinksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import PerformanceDashboardWidget from '../components/widgets/PerformanceDashboardWidget';
import TeamDirectoryWidget from '../components/widgets/TeamDirectoryWidget';
import CompanyNewsWidget from '../components/widgets/CompanyNewsWidget';
import BirthdaysWidget from '../components/widgets/BirthdaysWidget';
import AtAGlanceWidget from '../components/widgets/AtAGlanceWidget';
import api from '../services/api';
import { FaArrowLeft, FaCog, FaEye, FaEyeSlash } from 'react-icons/fa';

function DigitalHQ() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState([]);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);

  // Default widget configuration
  const defaultWidgets = [
    { id: 'quick-links', component: QuickLinksWidget, title: 'Quick Links', minH: 2, minW: 2 },
    { id: 'calendar', component: CalendarWidget, title: 'Calendar', minH: 3, minW: 2 },
    { id: 'performance', component: PerformanceDashboardWidget, title: 'Performance', minH: 3, minW: 2 },
    { id: 'team-directory', component: TeamDirectoryWidget, title: 'Team Directory', minH: 3, minW: 2 },
    { id: 'company-news', component: CompanyNewsWidget, title: 'Company News', minH: 2, minW: 2 },
    { id: 'birthdays', component: BirthdaysWidget, title: 'Celebrations', minH: 2, minW: 1 },
    { id: 'stats', component: AtAGlanceWidget, title: 'At a Glance', minH: 2, minW: 2 }
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/api/user-preferences');
      setPreferences(response.data);
      setHiddenWidgets(response.data.hidden_widgets || []);
      
      // Generate layout from preferences
      const widgetOrder = response.data.widget_order || defaultWidgets.map(w => w.id);
      const generatedLayout = widgetOrder.map((widgetId, index) => {
        const widget = defaultWidgets.find(w => w.id === widgetId);
        return {
          i: widgetId,
          x: (index % 3) * 4,
          y: Math.floor(index / 3) * 3,
          w: 4,
          h: widget?.minH || 2,
          minW: widget?.minW || 2,
          minH: widget?.minH || 2
        };
      });
      setLayout(generatedLayout);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Set default layout
      const defaultLayout = defaultWidgets.map((widget, index) => ({
        i: widget.id,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 3,
        w: 4,
        h: widget.minH,
        minW: widget.minW,
        minH: widget.minH
      }));
      setLayout(defaultLayout);
    }
  };

  const handleLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    
    // Save layout to backend
    try {
      const widgetOrder = newLayout
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map(item => item.i);
      
      await api.put('/api/user-preferences', {
        widget_order: widgetOrder
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleWidgetVisibility = async (widgetId) => {
    const newHidden = hiddenWidgets.includes(widgetId)
      ? hiddenWidgets.filter(id => id !== widgetId)
      : [...hiddenWidgets, widgetId];
    
    setHiddenWidgets(newHidden);
    
    try {
      await api.put('/api/user-preferences', {
        hidden_widgets: newHidden
      });
    } catch (error) {
      console.error('Error updating widget visibility:', error);
    }
  };

  const visibleWidgets = defaultWidgets.filter(w => !hiddenWidgets.includes(w.id));

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                data-testid="back-button"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🏢 Digital HQ
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your central command center
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="settings-button"
            >
              <FaCog className="text-lg" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Widget Visibility
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {defaultWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`flex items-center justify-between p-3 rounded-lg transition ${
                    hiddenWidgets.includes(widget.id)
                      ? darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                      : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-600'
                  }`}
                  data-testid={`toggle-widget-${widget.id}`}
                >
                  <span className="font-medium">{widget.title}</span>
                  {hiddenWidgets.includes(widget.id) ? <FaEyeSlash /> : <FaEye />}
                </button>
              ))}
            </div>
            <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              💡 Tip: Drag widgets to rearrange them on the dashboard
            </p>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {layout.length > 0 ? (
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={100}
            width={1200}
            onLayoutChange={handleLayoutChange}
            isDraggable={true}
            isResizable={true}
            compactType="vertical"
            preventCollision={false}
          >
            {visibleWidgets.map(widget => {
              const WidgetComponent = widget.component;
              return (
                <div key={widget.id} className="widget-container">
                  <WidgetComponent />
                </div>
              );
            })}
          </GridLayout>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚙️</div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalHQ;