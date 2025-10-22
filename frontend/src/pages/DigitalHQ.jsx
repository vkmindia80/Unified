import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Layout from '../components/Layout/Layout';
import QuickLinksWidget from '../components/widgets/QuickLinksWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import PerformanceDashboardWidget from '../components/widgets/PerformanceDashboardWidget';
import TeamDirectoryWidget from '../components/widgets/TeamDirectoryWidget';
import CompanyNewsWidget from '../components/widgets/CompanyNewsWidget';
import BirthdaysWidget from '../components/widgets/BirthdaysWidget';
import AtAGlanceWidget from '../components/widgets/AtAGlanceWidget';
import api from '../services/api';
import { FaCog, FaEye, FaEyeSlash } from 'react-icons/fa';

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
      const response = await api.get('/user-preferences');
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
      
      await api.put('/user-preferences', {
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
      await api.put('/user-preferences', {
        hidden_widgets: newHidden
      });
    } catch (error) {
      console.error('Error updating widget visibility:', error);
    }
  };

  const visibleWidgets = defaultWidgets.filter(w => !hiddenWidgets.includes(w.id));

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-4xl">🏢</div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Digital HQ
              </h1>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your central command center for productivity and collaboration
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
              showSettings
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : darkMode ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
            data-testid="settings-button"
          >
            <FaCog className={`text-lg ${showSettings ? 'animate-spin' : ''}`} />
            <span>{showSettings ? 'Hide Settings' : 'Customize'}</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 animate-slide-down">
          <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} border rounded-2xl shadow-xl p-6 mb-6`}>
            <div className="flex items-center space-x-2 mb-5">
              <span className="text-2xl">⚙️</span>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Widget Visibility
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {defaultWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                    hiddenWidgets.includes(widget.id)
                      ? darkMode ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-400 border border-gray-300'
                      : darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-blue-200 border border-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-300'
                  }`}
                  data-testid={`toggle-widget-${widget.id}`}
                >
                  <span className="font-semibold">{widget.title}</span>
                  {hiddenWidgets.includes(widget.id) ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
              ))}
            </div>
            <div className={`mt-5 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    Pro Tips:
                  </p>
                  <ul className={`text-xs mt-2 space-y-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <li>• Drag widgets to rearrange them on the dashboard</li>
                    <li>• Click the eye icon to show/hide widgets</li>
                    <li>• Resize widgets by dragging their corners</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div>
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
            <div className="text-6xl mb-4 animate-pulse">⚙️</div>
            <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading your dashboard...
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .widget-container {
          transition: all 0.3s ease;
        }
        .widget-container:hover {
          z-index: 10;
        }
      `}</style>
    </Layout>
  );
}

export default DigitalHQ;