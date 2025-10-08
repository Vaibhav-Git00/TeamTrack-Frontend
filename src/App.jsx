import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import NotificationSystem from './components/NotificationSystem';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import TeamDashboard from './pages/TeamDashboard';
import MentorTeamDashboard from './pages/MentorTeamDashboard';

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'mentor') {
    return <MentorDashboard />;
  } else {
    return <StudentDashboard />;
  }
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar />
      <main className="transition-colors duration-300">{children}</main>
      <NotificationSystem />
    </div>
  );
};

const AppContent = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardRouter />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Team Dashboard Route */}
            <Route
              path="/team/:teamId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TeamDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/teams"
              element={
                <ProtectedRoute requiredRole="student">
                  <Layout>
                    <StudentDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/resources"
              element={
                <ProtectedRoute requiredRole="student">
                  <Layout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-8">Resources</h1>
                      <div className="text-center py-12">
                        <p className="text-gray-500">Resources page coming soon...</p>
                      </div>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Mentor Routes */}
            <Route
              path="/mentor/dashboard"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <Layout>
                    <MentorDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/teams"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <Layout>
                    <MentorDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/team/:teamId"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <Layout>
                    <MentorTeamDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a
                      href="/dashboard"
                      className="btn btn-primary"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
