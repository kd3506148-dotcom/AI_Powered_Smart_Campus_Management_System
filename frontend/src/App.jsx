/**
 * SmartCampus AI - Main Application Component
 * Configures React Router, Global Context Providers, and Protected Routes
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';

import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import DashboardIndex from './pages/dashboards/DashboardIndex';
import PhasePlaceholder from './pages/PhasePlaceholder';
import AttendancePage from './pages/attendance/AttendancePage';
import TimetablePage from './pages/timetable/TimetablePage';
import ComplaintsPage from './pages/complaints/ComplaintsPage';
import BookingsPage from './pages/bookings/BookingsPage';
import AnnouncementsPage from './pages/communication/AnnouncementsPage';
import ChatPage from './pages/communication/ChatPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Application Routes wrapped with DashboardLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardIndex />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 2 Feature Routes */}
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AttendancePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/timetable"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TimetablePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 3 Feature Routes */}
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ComplaintsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 4 Feature Routes */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <BookingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 5 Feature Routes */}
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AnnouncementsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ChatPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Phase 6 Feature Routes */}
              <Route
                path="/ai-bot"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AIAssistantPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin User Management */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout>
                      <DashboardIndex />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
