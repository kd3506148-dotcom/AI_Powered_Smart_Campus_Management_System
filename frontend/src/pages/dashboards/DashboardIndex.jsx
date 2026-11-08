/**
 * Dashboard Router
 * Dynamically renders the correct dashboard component according to the user's role
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';

export default function DashboardIndex() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Faculty':
      return <FacultyDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Staff':
      return <StaffDashboard />;
    case 'Student':
    default:
      return <StudentDashboard />;
  }
}

