import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ChatWithSpaces from './pages/ChatWithSpaces';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Challenges from './pages/Challenges';
import Rewards from './pages/Rewards';
import AdminPanel from './pages/AdminPanelEnhanced';
import AdminIntegrations from './pages/AdminIntegrations';
import CallHistory from './pages/CallHistory';
import Feed from './pages/Feed';
import RecognitionWall from './pages/RecognitionWall';
import ApprovalCenter from './pages/ApprovalCenter';
import Invitations from './pages/Invitations';
import Polls from './pages/Polls';
import DigitalHQ from './pages/DigitalHQ';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/spaces" element={<PrivateRoute><ChatWithSpaces /></PrivateRoute>} />
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="/recognition" element={<PrivateRoute><RecognitionWall /></PrivateRoute>} />
        <Route path="/polls" element={<PrivateRoute><Polls /></PrivateRoute>} />
        <Route path="/digital-hq" element={<PrivateRoute><DigitalHQ /></PrivateRoute>} />
        <Route path="/approvals" element={<PrivateRoute><ApprovalCenter /></PrivateRoute>} />
        <Route path="/invitations" element={<PrivateRoute><Invitations /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><Achievements /></PrivateRoute>} />
        <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
        <Route path="/rewards" element={<PrivateRoute><Rewards /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/admin/integrations" element={<PrivateRoute><AdminIntegrations /></PrivateRoute>} />
        <Route path="/calls" element={<PrivateRoute><CallHistory /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;