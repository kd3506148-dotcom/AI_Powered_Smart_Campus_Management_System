/**
 * Staff Dashboard View
 * Focused on assigned maintenance work orders, status toggles, and service resolution
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import api from '../../api/client';
import {
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  AlertTriangle,
  CheckSquare,
  Search,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedTasks: 2,
    resolvedTasks: 12,
  });

  // Sample assigned maintenance orders for staff view
  const [tasks, setTasks] = useState([
    {
      id: 'CMP-101',
      title: 'Projector in CS Lab 3 not turning on',
      category: 'Infrastructure',
      priority: 'High',
      status: 'Assigned',
      location: 'CS Department, Lab 3, 2nd Floor',
      submittedBy: 'Alex Rivera (Student)',
    },
    {
      id: 'CMP-102',
      title: 'Hostel Block C 3rd Floor Water Purifier Filter',
      category: 'Hostel',
      priority: 'Medium',
      status: 'In Progress',
      location: 'Hostel Block C, Wing 3',
      submittedBy: 'Alex Rivera (Student)',
    },
    {
      id: 'CMP-098',
      title: 'Library Air Conditioning Thermostat Replacement',
      category: 'Maintenance',
      priority: 'Low',
      status: 'Resolved',
      location: 'Central Library, 2nd Floor',
      submittedBy: 'Prof. Alan Turing (Faculty)',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/stats');
        if (res.data.success && res.data.stats) {
          setStats((prev) => ({ ...prev, ...res.data.stats }));
        }
      } catch (err) {
        console.warn('Could not load staff stats:', err.message);
      }
    };
    fetchStats();
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const filteredTasks = tasks.filter(
    (t) => filterStatus === 'All' || t.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <span>🛠️ Maintenance & Operations Portal</span>
            <span>•</span>
            <span>Emp ID: {user?.employeeId || 'STF-201'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-300 text-sm">
            {user?.department} • Active Duty Roster
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Active Work Orders"
          value={tasks.filter((t) => t.status !== 'Resolved').length}
          subtitle="Assigned to your queue"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={tasks.filter((t) => t.status === 'In Progress').length}
          subtitle="Currently being inspected"
          icon={Clock}
          color="cyan"
        />
        <StatCard
          title="Resolved Tickets"
          value={stats.resolvedTasks || 12}
          subtitle="Successfully closed this month"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Work Orders Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-500" />
              <span>Assigned Campus Work Orders</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update task status in real time as maintenance proceeds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {task.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      task.priority === 'High'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : task.priority === 'Medium'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                    • {task.category}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {task.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {task.location}
                  </span>
                  <span>•</span>
                  <span>Submitted by: {task.submittedBy}</span>
                </div>
              </div>

              {/* Status Action Selector */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <span className="text-xs text-slate-400 font-medium">Update Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition-colors ${
                    task.status === 'Resolved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : task.status === 'In Progress'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

