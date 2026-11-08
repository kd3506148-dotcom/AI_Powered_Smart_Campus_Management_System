/**
 * Faculty Dashboard View
 * Displays teaching schedule, quick attendance shortcuts, booking requests, and student oversight
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import api from '../../api/client';
import {
  CalendarCheck,
  CalendarDays,
  Building2,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  PlusCircle,
  Megaphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 120,
    classesToday: 2,
    myBookings: 1,
    announcementsCount: 3,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/stats');
        if (res.data.success && res.data.stats) {
          setStats((prev) => ({ ...prev, ...res.data.stats }));
        }
      } catch (err) {
        console.warn('Could not load faculty stats:', err.message);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <span>👨‍🏫 Faculty Portal</span>
            <span>•</span>
            <span>Emp ID: {user?.employeeId || 'FAC-101'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-300 text-sm">
            {user?.department} • Academic Year 2025-2026
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Lectures Today"
          value="2 Classes"
          subtitle="CSE Sem 6 (Section A)"
          icon={Clock}
          color="cyan"
        />
        <StatCard
          title="Department Students"
          value={stats.totalStudents || 120}
          subtitle="Enrolled under department"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Facility Bookings"
          value={stats.myBookings || 1}
          subtitle="1 Approved lab booking"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Active Notices"
          value={stats.announcementsCount || 3}
          subtitle="Broadcast to students"
          icon={Megaphone}
          color="amber"
        />
      </div>

      {/* Grid: Teaching Schedule Today & Faculty Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              <span>Teaching Schedule Today</span>
            </h2>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Mark Attendance</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                time: '09:00 AM - 10:00 AM',
                subject: 'Artificial Intelligence & Machine Learning',
                batch: 'CSE Sem 6 (Section A)',
                room: 'Lab 5 - AI Wing',
                status: 'Completed',
                attendanceMarked: true,
              },
              {
                time: '10:15 AM - 11:15 AM',
                subject: 'Distributed Cloud Computing',
                batch: 'CSE Sem 6 (Section A)',
                room: 'Room 304 - Academic Block',
                status: 'Pending Roll Call',
                attendanceMarked: false,
              },
            ].map((slot, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700/60 gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {slot.time}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {slot.subject}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{slot.batch}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {slot.room}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {slot.attendanceMarked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Marked</span>
                    </span>
                  ) : (
                    <Link
                      to="/attendance"
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
                    >
                      Take Attendance
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            Faculty Quick Actions
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/attendance"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors border border-transparent hover:border-indigo-500/20"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              <span>Mark Student Attendance</span>
            </Link>

            <Link
              to="/bookings"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 text-sm font-medium transition-colors border border-transparent hover:border-cyan-500/20"
            >
              <PlusCircle className="w-4 h-4 text-cyan-500" />
              <span>Book Seminar Hall or Lab</span>
            </Link>

            <Link
              to="/announcements"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 text-sm font-medium transition-colors border border-transparent hover:border-amber-500/20"
            >
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Publish Class Announcement</span>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-navy-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Upcoming Approved Bookings
            </h4>
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                Advanced AI & ML Lab (Lab 5)
              </p>
              <p>Tomorrow • 02:00 PM - 05:00 PM</p>
              <p className="text-[11px] text-slate-400">B.Tech Project Evaluation Demo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

