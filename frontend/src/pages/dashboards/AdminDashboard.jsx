/**
 * Admin Dashboard View
 * Comprehensive administrative overview with Recharts analytics and searchable user roster
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import api from '../../api/client';
import {
  Users,
  Shield,
  Building2,
  AlertTriangle,
  Megaphone,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 2,
    totalFaculty: 1,
    totalStaff: 1,
    pendingComplaints: 3,
    pendingBookings: 1,
    announcementsCount: 3,
  });

  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/auth/stats'),
          api.get('/auth/users'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (usersRes.data.success) {
          setUsersList(usersRes.data.users);
        }
      } catch (err) {
        console.warn('Could not load administrative data:', err.message);
      }
    };
    loadAdminData();
  }, []);

  // Filter users based on search term and role
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Recharts Chart Data
  const roleChartData = [
    { name: 'Students', count: stats.totalStudents || 2, fill: '#06b6d4' },
    { name: 'Faculty', count: stats.totalFaculty || 1, fill: '#6366f1' },
    { name: 'Staff', count: stats.totalStaff || 1, fill: '#f59e0b' },
    { name: 'Admin', count: 1, fill: '#f43f5e' },
  ];

  const complaintChartData = [
    { category: 'Hostel', count: 4 },
    { category: 'Infrastructure', count: 3 },
    { category: 'Academic', count: 1 },
    { category: 'Network/WiFi', count: 2 },
    { category: 'Mess', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-400/30">
            <span>🛡️ Campus Administration</span>
            <span>•</span>
            <span>Emp ID: {user?.employeeId || 'ADM-001'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Executive Overview
          </h1>
          <p className="text-slate-300 text-sm">
            Dean Arthur Vance • Central Management & Operations Control
          </p>
        </div>
      </div>

      {/* Campus StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Students"
          value={stats.totalStudents || 2}
          subtitle="Registered on portal"
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Faculty"
          value={stats.totalFaculty || 1}
          subtitle="Active teaching staff"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Support Staff"
          value={stats.totalStaff || 1}
          subtitle="Facilities & service"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings || 1}
          subtitle="Requires approval"
          icon={Building2}
          color="emerald"
        />
        <StatCard
          title="Active Issues"
          value={stats.pendingComplaints || 3}
          subtitle="Complaints in queue"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Visual Analytics Row via Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Bar Chart */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-navy-900 dark:text-white mb-4">
            Campus Population Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#102a43',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category Bar Chart */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-navy-900 dark:text-white mb-4">
            Complaints by Department Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintChartData}>
                <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#102a43',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Roster Table with Search and Pagination */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
              Campus User Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing active accounts across Student, Faculty, Staff, and Admin roles
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-navy-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-y border-slate-200 dark:border-navy-700/60">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">ID / Roll No.</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'Student'
                            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                            : u.role === 'Faculty'
                            ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                            : u.role === 'Staff'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                      {u.department}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {u.rollNumber || u.employeeId || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    No campus members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing Page <span className="font-bold">{currentPage}</span> of{' '}
            <span className="font-bold">{totalPages}</span> (
            {filteredUsers.length} total users)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

