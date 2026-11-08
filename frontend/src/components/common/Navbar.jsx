/**
 * Top Navigation Bar
 * Features brand branding, active role badge, theme switcher, and user logout
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, LogOut, Menu, User, Shield, GraduationCap, Briefcase, Wrench } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Role badge helper icon and colors
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return {
          icon: <Shield className="w-3.5 h-3.5" />,
          classes: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      case 'Faculty':
        return {
          icon: <Briefcase className="w-3.5 h-3.5" />,
          classes: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        };
      case 'Staff':
        return {
          icon: <Wrench className="w-3.5 h-3.5" />,
          classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'Student':
      default:
        return {
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          classes: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <span className="font-extrabold text-base md:text-lg tracking-tight text-navy-900 dark:text-white">
                SmartCampus <span className="text-cyan-500">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-300 dark:border-cyan-800">
                B.Tech Portal
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Role Badge & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <>
              {/* Role badge */}
              <div
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
              >
                {badge.icon}
                <span>{user.role}</span>
              </div>

              {/* User profile dropdown / avatar */}
              <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200 dark:border-navy-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {user.role === 'Student' ? user.rollNumber || user.department : user.department}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-cyan-400 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-navy-700">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'U'}
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign out of account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

