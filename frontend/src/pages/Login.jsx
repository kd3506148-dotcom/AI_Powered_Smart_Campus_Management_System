/**
 * Login Page
 * Features standard authentication and 1-click demo login buttons for each of the 4 roles
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, Eye, EyeOff, Shield, GraduationCap, Briefcase, Wrench, Moon, Sun } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, demoLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleDemoClick = async (role) => {
    setErrorMsg('');
    setSubmitting(true);
    const result = await demoLogin(role);
    setSubmitting(false);

    if (result?.success) {
      navigate('/dashboard', { replace: true });
    } else if (result?.message) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-transform"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Campus Logo & Title */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white shadow-xl shadow-cyan-500/25 mb-4">
          <span className="text-3xl">🏫</span>
        </div>
        <h2 className="text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          SmartCampus <span className="text-cyan-500">AI</span>
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Integrated Campus Management & AI Assistance Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-navy-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200/80 dark:border-navy-800 rounded-3xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., student@campus.edu"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Campus</span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Bar for B.Tech Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-navy-800">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              ⚡ 1-Click Demo Evaluation Login
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoClick('Student')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-semibold transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-cyan-500" />
                <span>Student</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoClick('Faculty')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoClick('Admin')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
              >
                <Shield className="w-4 h-4 text-rose-500" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDemoClick('Staff')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors"
              >
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Staff</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

