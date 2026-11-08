/**
 * Attendance Controller
 * Handles bulk class attendance marking by faculty, student attendance tracking, and threshold metrics
 */

const { Attendance, User } = require('../models');

// Helper to normalize date to YYYY-MM-DD start of day
const normalizeDate = (inputDate) => {
  const d = new Date(inputDate);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Mark or update attendance for a class (Bulk operation)
// @route   POST /api/attendance/mark
// @access  Private (Faculty, Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, semester, section, records } = req.body;
    const attendanceDate = normalizeDate(date);
    const facultyId = req.user._id;

    // Use bulk operations to upsert each student's attendance for the day
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: {
          student: record.student,
          subject,
          date: attendanceDate,
        },
        update: {
          $set: {
            faculty: facultyId,
            status: record.status || 'Present',
            semester,
            section: section || 'A',
            remarks: record.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: `Successfully marked attendance for ${records.length} students in ${subject}.`,
      date: attendanceDate,
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's personal attendance summary and history
// @route   GET /api/attendance/my
// @access  Private (Student)
const getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Fetch all attendance records for this student sorted by date desc
    const records = await Attendance.find({ student: studentId })
      .populate('faculty', 'name email employeeId')
      .sort({ date: -1 });

    // Aggregate statistics by subject
    const subjectStats = {};
    let totalClasses = 0;
    let totalAttended = 0;

    records.forEach((rec) => {
      totalClasses += 1;
      const isAttended = rec.status === 'Present' || rec.status === 'Late';
      if (isAttended) {
        totalAttended += 1;
      }

      if (!subjectStats[rec.subject]) {
        subjectStats[rec.subject] = {
          subject: rec.subject,
          total: 0,
          attended: 0,
          absent: 0,
          late: 0,
        };
      }

      subjectStats[rec.subject].total += 1;
      if (rec.status === 'Present') subjectStats[rec.subject].attended += 1;
      else if (rec.status === 'Late') {
        subjectStats[rec.subject].attended += 1;
        subjectStats[rec.subject].late += 1;
      } else {
        subjectStats[rec.subject].absent += 1;
      }
    });

    // Compute percentage per subject and flags
    const bySubject = Object.values(subjectStats).map((subj) => {
      const percentage = subj.total > 0 ? Math.round((subj.attended / subj.total) * 100) : 0;
      return {
        ...subj,
        percentage,
        isShortage: percentage < 75, // Below mandatory 75% university requirement
      };
    });

    const overallPercentage =
      totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;

    return res.status(200).json({
      success: true,
      summary: {
        overallPercentage,
        totalClasses,
        totalAttended,
        isLowAttendance: overallPercentage < 75,
        bySubject,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for a class (filtered by date, subject, semester, section)
// @route   GET /api/attendance/class
// @access  Private (Faculty, Admin)
const getClassAttendance = async (req, res, next) => {
  try {
    const { subject, date, semester, section } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section;
    if (date) {
      filter.date = normalizeDate(date);
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name email rollNumber department')
      .populate('faculty', 'name employeeId')
      .sort({ date: -1, 'student.rollNumber': 1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students list for taking attendance (filtered by semester and section)
// @route   GET /api/attendance/students
// @access  Private (Faculty, Admin)
const getStudentsForAttendance = async (req, res, next) => {
  try {
    const { semester = 6, section = 'A', department } = req.query;
    const filter = {
      role: 'Student',
      isActive: true,
      semester: Number(semester),
      section,
    };

    if (department && department !== 'All') {
      filter.department = department;
    }

    const students = await User.find(filter)
      .select('name email rollNumber department semester section')
      .sort({ rollNumber: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getClassAttendance,
  getStudentsForAttendance,
};

