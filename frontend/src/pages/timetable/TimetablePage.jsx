/**
 * Timetable Page
 * Interactive weekly lecture schedule viewer with day filters and admin slot scheduler
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import api from '../../api/client';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  X,
  Building,
} from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const isStaffOrAdmin = user?.role === 'Admin' || user?.role === 'Faculty';
  const isAdmin = user?.role === 'Admin';

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 6);
  const [selectedSection, setSelectedSection] = useState(user?.section || 'A');
  const [selectedDepartment, setSelectedDepartment] = useState(
    user?.department || 'Computer Science & Engineering'
  );

  // Add Slot Modal State
  const [showModal, setShowModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: '',
    faculty: '',
    room: 'Room 304 - Academic Block',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch timetable slots
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = `/timetable?semester=${selectedSemester}&section=${selectedSection}`;
      if (selectedDepartment && selectedDepartment !== 'All') {
        url += `&department=${encodeURIComponent(selectedDepartment)}`;
      }
      if (selectedDay !== 'All') {
        url += `&dayOfWeek=${selectedDay}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setSlots(res.data.slots);
      }
    } catch (err) {
      addToast('Failed to load timetable slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDay, selectedSemester, selectedSection, selectedDepartment]);

  // Load faculty members for the scheduler modal
  useEffect(() => {
    if (isStaffOrAdmin) {
      const fetchFaculty = async () => {
        try {
          const res = await api.get('/auth/users?role=Faculty');
          if (res.data.success && res.data.users.length > 0) {
            setFacultyList(res.data.users);
            setFormData((prev) => ({ ...prev, faculty: res.data.users[0]._id }));
          }
        } catch (err) {
          console.warn('Could not load faculty for timetable:', err.message);
        }
      };
      fetchFaculty();
    }
  }, [isStaffOrAdmin]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/timetable', formData);
      if (res.data.success) {
        addToast('New lecture slot added to timetable!', 'success');
        setShowModal(false);
        setFormData({
          dayOfWeek: 'Monday',
          startTime: '09:00 AM',
          endTime: '10:00 AM',
          subject: '',
          faculty: facultyList[0]?._id || '',
          room: 'Room 304 - Academic Block',
          department: selectedDepartment,
          semester: Number(selectedSemester),
          section: selectedSection,
        });
        fetchTimetable();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add timetable slot', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this lecture slot?')) return;
    try {
      const res = await api.delete(`/timetable/${slotId}`);
      if (res.data.success) {
        addToast('Lecture slot deleted successfully', 'success');
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
      }
    } catch (err) {
      addToast('Error deleting slot', 'error');
    }
  };

  // Group slots by Day
  const slotsByDay = {};
  WEEKDAYS.forEach((day) => {
    slotsByDay[day] = [];
  });
  slots.forEach((slot) => {
    if (slotsByDay[slot.dayOfWeek]) {
      slotsByDay[slot.dayOfWeek].push(slot);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Class Timetable • Phase 2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
            Department Weekly Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lecture schedule, faculty allocations, and lab classroom mappings
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture Slot</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        {/* Day Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDay === 'All'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
            }`}
          >
            All Days
          </button>
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Schedule Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading lecture timetable...
        </div>
      ) : selectedDay === 'All' ? (
        <div className="space-y-6">
          {WEEKDAYS.map((day) => {
            const daySlots = slotsByDay[day] || [];
            if (daySlots.length === 0) return null;

            return (
              <div
                key={day}
                className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                  <h3 className="font-extrabold text-base text-navy-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>{day}</span>
                  </h3>
                  <span className="text-xs text-slate-400">{daySlots.length} Scheduled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySlots.map((slot) => (
                    <SlotCard
                      key={slot._id}
                      slot={slot}
                      isAdmin={isAdmin}
                      onDelete={handleDeleteSlot}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-navy-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-navy-800">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>{selectedDay} Schedule</span>
          </h3>

          {slots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <SlotCard
                  key={slot._id}
                  slot={slot}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteSlot}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No classes scheduled for {selectedDay} in Section {selectedSection}.
            </div>
          )}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-1">
              Add New Lecture Slot
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Allocate a subject to a faculty member, room, and time slot
            </p>

            <form onSubmit={handleCreateSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 5 - AI Wing"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Subject Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Web Architectures"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Assigned Faculty
                </label>
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25"
                >
                  {submitting ? 'Creating...' : 'Save Lecture Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Slot Card
function SlotCard({ slot, isAdmin, onDelete }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {slot.startTime} - {slot.endTime}
            </span>
          </span>

          {isAdmin && (
            <button
              onClick={() => onDelete(slot._id)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              title="Delete this lecture slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
          {slot.subject}
        </h4>
      </div>

      <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-navy-700/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{slot.faculty?.name || 'Faculty Member'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{slot.room}</span>
        </div>
      </div>
    </div>
  );
}

