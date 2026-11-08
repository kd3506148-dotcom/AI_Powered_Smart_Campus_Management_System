/**
 * Sidebar Navigation Component
 * Dynamic menu links customized according to the authenticated user's role
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  AlertTriangle,
  Building2,
  Bell,
  MessageSquare,
  Bot,
  Users,
  CheckSquare,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  // Role-based navigation item configuration
  const getNavLinks = () => {
    const commonLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    switch (user?.role) {
      case 'Student':
        return [
          ...commonLinks,
          { name: 'My Attendance', path: '/attendance', icon: CalendarCheck, badge: 'Phase 2' },
          { name: 'Timetable', path: '/timetable', icon: CalendarDays, badge: 'Phase 2' },
          { name: 'Complaints', path: '/complaints', icon: AlertTriangle, badge: 'Phase 3' },
          { name: 'Book Facility', path: '/bookings', icon: Building2, badge: 'Phase 4' },
          { name: 'Live Chat', path: '/chat', icon: MessageSquare, badge: 'Phase 5' },
          { name: 'AI Campus Bot', path: '/ai-bot', icon: Bot, badge: 'Phase 6' },
        ];
      case 'Faculty':
        return [
          ...commonLinks,
          { name: 'Mark Attendance', path: '/attendance', icon: CalendarCheck, badge: 'Phase 2' },
          { name: 'Teaching Schedule', path: '/timetable', icon: CalendarDays, badge: 'Phase 2' },
          { name: 'Room & Lab Booking', path: '/bookings', icon: Building2, badge: 'Phase 4' },
          { name: 'Campus Notices', path: '/announcements', icon: Bell, badge: 'Phase 5' },
          { name: 'Live Chat', path: '/chat', icon: MessageSquare, badge: 'Phase 5' },
          { name: 'AI Study Assistant', path: '/ai-bot', icon: Bot, badge: 'Phase 6' },
        ];
      case 'Admin':
        return [
          ...commonLinks,
          { name: 'Attendance Records', path: '/attendance', icon: CalendarCheck, badge: 'Phase 2' },
          { name: 'Manage Timetable', path: '/timetable', icon: CalendarDays, badge: 'Phase 2' },
          { name: 'Complaints Overview', path: '/complaints', icon: AlertTriangle, badge: 'Phase 3' },
          { name: 'Booking Approvals', path: '/bookings', icon: Building2, badge: 'Phase 4' },
          { name: 'Broadcast Notices', path: '/announcements', icon: Bell, badge: 'Phase 5' },
          { name: 'User Management', path: '/users', icon: Users },
        ];
      case 'Staff':
        return [
          ...commonLinks,
          { name: 'Assigned Work Orders', path: '/complaints', icon: CheckSquare, badge: 'Phase 3' },
          { name: 'Campus Notices', path: '/announcements', icon: Bell, badge: 'Phase 5' },
          { name: 'Support Chat', path: '/chat', icon: MessageSquare, badge: 'Phase 5' },
        ];
      default:
        return commonLinks;
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Campus Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile card inside sidebar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/80 dark:border-navy-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-navy-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  {user?.role} Portal
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Main Menu
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold border-l-4 border-cyan-500'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-cyan-500/80" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-200/70 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            SmartCampus AI v1.0 • B.Tech Demo
          </p>
        </div>
      </aside>
    </>
  );
}

