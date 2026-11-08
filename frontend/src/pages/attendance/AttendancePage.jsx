/**
 * Attendance Page
 * Adapts interface according to user role:
 * - Student: Visualizes overall attendance percentage, subject breakdown, shortage alerts, and history
 * - Faculty / Admin: Roll-call roster to mark attendance with 1-click toggles and review records
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import StatCard from '../../components/common/StatCard';
import api from '../../api/client';
import {
  CalendarCheck,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserCheck,
  Send,
} from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const isFacultyOrAdmin = user?.role === 'Faculty' || user?.role === 'Admin';

  // --- Student State ---
  const [studentSummary, setStudentSummary] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [loadingStudent, setLoadingStudent] = useState(!isFacultyOrAdmin);

  // --- Faculty / Admin State ---
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  const [formSubject, setFormSubject] = useState('Artificial Intelligence & Machine Learning');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formSemester, setFormSemester] = useState(6);
  const [formSection, setFormSection] = useState('A');

  const [roster, setRoster] = useState([]);
  const [markingRecords, setMarkingRecords] = useState({}); // studentId -> { status: 'Present', remarks: '' }
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Class records review state (Tab 2 for faculty)
  const [classRecords, setClassRecords] = useState([]);
  const [loadingClassRecords, setLoadingClassRecords] = useState(false);

  // Load student attendance data
  useEffect(() => {
    if (!isFacultyOrAdmin) {
      const fetchStudentData = async () => {
        try {
          const res = await api.get('/attendance/my');
          if (res.data.success) {
            setStudentSummary(res.data.summary);
            setStudentRecords(res.data.records);
          }
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to load attendance', 'error');
        } finally {
          setLoadingStudent(false);
        }
      };
      fetchStudentData();
    }
  }, [isFacultyOrAdmin, addToast]);

  // Load roster when faculty opens the page or changes class selection
  useEffect(() => {
    if (isFacultyOrAdmin && activeTab === 'mark') {
      const fetchRoster = async () => {
        setLoadingRoster(true);
        try {
          const res = await api.get(
            `/attendance/students?semester=${formSemester}&section=${formSection}`
          );
          if (res.data.success) {
            setRoster(res.data.students);
            // Default all students to 'Present'
            const initialMap = {};
            res.data.students.forEach((s) => {
              initialMap[s._id] = { status: 'Present', remarks: '' };
            });
            setMarkingRecords(initialMap);
          }
        } catch (err) {
          addToast('Could not load student roster for attendance', 'error');
        } finally {
          setLoadingRoster(false);
        }
      };
      fetchRoster();
    }
  }, [isFacultyOrAdmin, activeTab, formSemester, formSection, addToast]);

  // Load past class records for faculty view tab
  useEffect(() => {
    if (isFacultyOrAdmin && activeTab === 'history') {
      const fetchClassHistory = async () => {
        setLoadingClassRecords(true);
        try {
          const res = await api.get(
            `/attendance/class?subject=${encodeURIComponent(formSubject)}&semester=${formSemester}&section=${formSection}`
          );
          if (res.data.success) {
            setClassRecords(res.data.records);
          }
        } catch (err) {
          addToast('Failed to load past class records', 'error');
        } finally {
          setLoadingClassRecords(false);
        }
      };
      fetchClassHistory();
    }
  }, [isFacultyOrAdmin, activeTab, formSubject, formSemester, formSection, addToast]);

  // Faculty actions
  const handleStatusToggle = (studentId, status) => {
    setMarkingRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setMarkingRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    roster.forEach((s) => {
      updated[s._id] = {
        ...markingRecords[s._id],
        status,
      };
    });
    setMarkingRecords(updated);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (roster.length === 0) {
      addToast('No students available in this class to mark attendance.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject: formSubject,
        date: formDate,
        semester: Number(formSemester),
        section: formSection,
        records: roster.map((s) => ({
          student: s._id,
          status: markingRecords[s._id]?.status || 'Present',
          remarks: markingRecords[s._id]?.remarks || '',
        })),
      };

      const res = await api.post('/attendance/mark', payload);
      if (res.data.success) {
        addToast(res.data.message || 'Attendance saved successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving attendance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter student history table
  const filteredStudentRecords = studentRecords.filter(
    (r) => selectedSubjectFilter === 'All' || r.subject === selectedSubjectFilter
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance Module • Phase 2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
            {isFacultyOrAdmin ? 'Class Attendance Roster' : 'My Attendance & Standing'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isFacultyOrAdmin
              ? 'Record daily lecture presence, mark excuses, and inspect student eligibility'
              : 'Track real-time subject attendance percentages against the mandatory 75% rule'}
          </p>
        </div>

        {isFacultyOrAdmin && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('mark')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mark'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy-900'
              }`}
            >
              Take Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy-900'
              }`}
            >
              Past Class Records
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT VIEW                                                           */}
      {/* ========================================================================= */}
      {!isFacultyOrAdmin && (
        <div className="space-y-6">
          {/* Low Attendance Warning Alert if < 75% */}
          {studentSummary?.isLowAttendance && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="text-xs font-medium">
                <span className="font-bold">Attendance Shortage Alert:</span> Your overall attendance
                is currently at {studentSummary.overallPercentage}%, which is below the mandatory 75%
                eligibility criteria for university examinations.
              </div>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Attendance"
              value={`${studentSummary?.overallPercentage || 0}%`}
              subtitle={
                studentSummary?.overallPercentage >= 75
                  ? 'Eligible for university exams'
                  : 'Action required'
              }
              icon={CalendarCheck}
              color={studentSummary?.overallPercentage >= 75 ? 'emerald' : 'rose'}
              trend={studentSummary?.overallPercentage >= 75 ? 'Satisfactory' : 'Critical'}
            />
            <StatCard
              title="Total Classes Held"
              value={studentSummary?.totalClasses || 0}
              subtitle="Registered across all subjects"
              icon={CalendarDays}
              color="cyan"
            />
            <StatCard
              title="Classes Attended"
              value={studentSummary?.totalAttended || 0}
              subtitle="Present and permitted late slips"
              icon={CheckCircle}
              color="emerald"
            />
            <StatCard
              title="Classes Absent"
              value={
                (studentSummary?.totalClasses || 0) - (studentSummary?.totalAttended || 0)
              }
              subtitle="Unexcused lecture absences"
              icon={XCircle}
              color="amber"
            />
          </div>

          {/* Subject Breakdown Cards */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy-900 dark:text-white mb-4">
              Subject-Wise Attendance Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentSummary?.bySubject && studentSummary.bySubject.length > 0 ? (
                studentSummary.bySubject.map((subj) => (
                  <div
                    key={subj.subject}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">
                        {subj.subject}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          subj.percentage >= 75
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {subj.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          subj.percentage >= 75 ? 'bg-cyan-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(subj.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Attended: {subj.attended} / {subj.total}</span>
                      <span>Absent: {subj.absent}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-3 py-4 text-center">
                  No subject attendance records recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Full Attendance History Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Detailed Roll Call History
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filter Subject:</span>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  <option value="All">All Subjects</option>
                  {studentSummary?.bySubject?.map((s) => (
                    <option key={s.subject} value={s.subject}>
                      {s.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-navy-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-y border-slate-200 dark:border-navy-700/60">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Faculty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {filteredStudentRecords.length > 0 ? (
                    filteredStudentRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                        <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {new Date(rec.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">
                          {rec.subject}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {rec.faculty?.name || 'Faculty Member'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : rec.status === 'Late'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {rec.remarks || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-xs text-slate-400">
                        No roll call logs found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FACULTY & ADMIN VIEW                                                   */}
      {/* ========================================================================= */}
      {isFacultyOrAdmin && activeTab === 'mark' && (
        <form onSubmit={handleSubmitAttendance} className="space-y-6">
          {/* Class Selector Bar */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              Step 1: Select Subject & Class Section
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Artificial Intelligence & Machine Learning">
                    Artificial Intelligence & Machine Learning
                  </option>
                  <option value="Distributed Cloud Computing">
                    Distributed Cloud Computing
                  </option>
                  <option value="Full-Stack Web Architectures">
                    Full-Stack Web Architectures
                  </option>
                  <option value="Advanced Computer Networks">
                    Advanced Computer Networks
                  </option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Attendance Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Section
                </label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Roll Roster Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-500" />
                  <span>Student Roll Call ({roster.length} Enrolled)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select status for each student or use 1-click batch actions
                </p>
              </div>

              {/* Quick Batch Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('Present')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors border border-emerald-500/30"
                >
                  ✓ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Absent')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold transition-colors border border-rose-500/30"
                >
                  ✗ Mark All Absent
                </button>
              </div>
            </div>

            {loadingRoster ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading students for Semester {formSemester} Section {formSection}...
              </div>
            ) : roster.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {roster.map((student) => {
                  const currentStatus = markingRecords[student._id]?.status || 'Present';
                  const currentRemarks = markingRecords[student._id]?.remarks || '';

                  return (
                    <div
                      key={student._id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-navy-800/40 px-2 rounded-xl"
                    >
                      {/* Student Info */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            {student.rollNumber || 'CSE-000'}
                          </span>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {student.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {student.department} • {student.email}
                        </p>
                      </div>

                      {/* Controls: Status Radios & Remarks */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Status Buttons */}
                        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-navy-800 p-1 border border-slate-200 dark:border-navy-700">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student._id, 'Present')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student._id, 'Absent')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student._id, 'Late')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
                            }`}
                          >
                            Late
                          </button>
                        </div>

                        {/* Optional Remarks Input */}
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                          className="w-32 sm:w-40 px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active students found in Semester {formSemester} Section {formSection}.
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-end">
              <button
                type="submit"
                disabled={submitting || roster.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Class Attendance...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. FACULTY PAST RECORDS TAB                                               */}
      {/* ========================================================================= */}
      {isFacultyOrAdmin && activeTab === 'history' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Archived Class Roll Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspection list for {formSubject} (Sem {formSemester} Sec {formSection})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Subject:</span>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
              >
                <option value="Artificial Intelligence & Machine Learning">
                  AI & Machine Learning
                </option>
                <option value="Distributed Cloud Computing">Distributed Cloud</option>
                <option value="Full-Stack Web Architectures">Full-Stack Web</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-navy-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-y border-slate-200 dark:border-navy-700/60">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {classRecords.length > 0 ? (
                  classRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                      <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">
                        {r.student?.name || 'Student'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-cyan-600 dark:text-cyan-400">
                        {r.student?.rollNumber || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            r.status === 'Present'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : r.status === 'Late'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {r.faculty?.name || 'Faculty'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-slate-400">
                      No records logged yet for this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

