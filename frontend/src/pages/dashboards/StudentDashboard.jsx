/**
 * Student Dashboard View
 * Displays attendance metrics, class schedule, recent announcements, and quick student actions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import api from '../../api/client';
import {
  CalendarCheck,
  CalendarDays,
  AlertTriangle,
  Building2,
  Clock,
  MapPin,
  Bot,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendanceRate: 92,
    totalClasses: 28,
    myComplaints: 1,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/stats');
        if (res.data.success && res.data.stats) {
          setStats((prev) => ({ ...prev, ...res.data.stats }));
        }
      } catch (err) {
        console.warn('Could not load dynamic stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
            <span>🎓 Student Portal</span>
            <span>•</span>
            <span>Sem {user?.semester || 6} (Section {user?.section || 'A'})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-300 text-sm">
            {user?.department} • Roll No: {user?.rollNumber || 'CSE-2024-001'}
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          subtitle="Meets 75% campus requirement"
          icon={CalendarCheck}
          color={stats.attendanceRate >= 75 ? 'emerald' : 'amber'}
          trend="+3.2%"
        />
        <StatCard
          title="Total Lectures"
          value={stats.totalClasses || 3}
          subtitle="Classes recorded this month"
          icon={CalendarDays}
          color="cyan"
        />
        <StatCard
          title="My Complaints"
          value={stats.myComplaints || 0}
          subtitle="Active / assigned tickets"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Facility Requests"
          value={stats.pendingBookings || 0}
          subtitle="Lab & seminar approvals"
          icon={Building2}
          color="navy"
        />
      </div>

      {/* Two Column Grid: Classes Today & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Today */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <span>Today's Schedule</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              Monday
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                time: '09:00 AM - 10:00 AM',
                subject: 'Artificial Intelligence & Machine Learning',
                faculty: 'Dr. Sarah Mitchell',
                room: 'Lab 5 - AI Wing',
                status: 'Completed',
              },
              {
                time: '10:15 AM - 11:15 AM',
                subject: 'Distributed Cloud Computing',
                faculty: 'Dr. Sarah Mitchell',
                room: 'Room 304 - Academic Block',
                status: 'Next Up',
              },
              {
                time: '02:00 PM - 04:00 PM',
                subject: 'Full-Stack Web Development Lab',
                faculty: 'Prof. Alan Turing',
                room: 'CS Computer Lab 2',
                status: 'Upcoming',
              },
            ].map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700/60 hover:border-cyan-500/40 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                    {slot.time}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {slot.subject}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{slot.faculty}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {slot.room}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    slot.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : slot.status === 'Next Up'
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold'
                      : 'bg-slate-200/70 dark:bg-navy-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy-900 dark:text-white mb-4">
              Quick Shortcuts
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/attendance"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-cyan-500" />
                  <span>Check Attendance Records</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/complaints"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Submit Campus Complaint</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/ai-bot"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-500/15 to-navy-800/40 text-cyan-700 dark:text-cyan-300 hover:from-cyan-500/25 text-sm font-semibold transition-all border border-cyan-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-cyan-500" />
                  <span>Ask Campus AI Assistant</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500 text-white font-bold">
                  AI
                </span>
              </Link>
            </div>
          </div>

          {/* Campus Broadcast Notices */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-500" />
                <span>Notice Board</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  Urgent Notice
                </span>
                <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  Midterm Examination Timetable Released
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Exams commence next Monday. Verify your seat allocation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                  Campus Announcement
                </span>
                <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  SmartCampus AI Portal Launch
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  All campus services are now accessible digitally via this portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

