// Smoke test script to verify all Mongoose models compile, validate, and query properly
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
  User,
  Attendance,
  Timetable,
  Complaint,
  Booking,
  Notification,
  Announcement,
  Message,
  LeaveRequest,
} = require('../models');

async function connectToMongo() {
  const candidates = [];
  if (process.env.MONGO_URI) candidates.push(process.env.MONGO_URI);
  candidates.push('mongodb://127.0.0.1:27017/smartcampus_db_test');
  if (fs.existsSync('/tmp/mongodb-27017.sock')) {
    candidates.push('mongodb://%2Ftmp%2Fmongodb-27017.sock/smartcampus_db_test');
  }

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('✓ Successfully connected to MongoDB at', uri);
      return;
    } catch (err) {
      // try next
    }
  }
  throw new Error('Could not connect to MongoDB on any candidate URI');
}

async function testAllModels() {
  console.log('--- Testing SmartCampus AI Mongoose Models ---');

  try {
    await connectToMongo();

    // 1. Test User Model & Password Hashing
    const testUser = new User({
      name: 'Test Student',
      email: `test_student_${Date.now()}@campus.edu`,
      password: 'PlainPassword123',
      role: 'Student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE2024-001',
      semester: 6,
      section: 'A',
    });
    await testUser.save();
    console.log('✓ User Model: saved successfully with encrypted password.');

    const isMatch = await testUser.comparePassword('PlainPassword123');
    if (!isMatch) throw new Error('User comparePassword failed!');
    console.log('✓ User Model: password comparison verified.');

    const userJson = testUser.toJSON();
    if (userJson.password) throw new Error('User toJSON did not strip password!');
    console.log('✓ User Model: password properly hidden in JSON representation.');

    // 2. Test Faculty User for associations
    const testFaculty = await User.create({
      name: 'Dr. Alan Turing',
      email: `alan_${Date.now()}@campus.edu`,
      password: 'FacultyPassword123',
      role: 'Faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-201',
    });

    // 3. Test Staff User for assignments
    const testStaff = await User.create({
      name: 'Campus Caretaker Bob',
      email: `bob_${Date.now()}@campus.edu`,
      password: 'StaffPassword123',
      role: 'Staff',
      department: 'Maintenance & Facilities',
      employeeId: 'STF-501',
    });

    // 4. Test Attendance Model
    const testAttendance = await Attendance.create({
      student: testUser._id,
      faculty: testFaculty._id,
      subject: 'Data Structures and Algorithms',
      date: new Date(),
      status: 'Present',
      semester: 6,
      section: 'A',
      remarks: 'Active participant',
    });
    console.log('✓ Attendance Model: record created with id', testAttendance._id);

    // 5. Test Timetable Model
    const testTimetable = await Timetable.create({
      dayOfWeek: 'Monday',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      subject: 'Data Structures and Algorithms',
      faculty: testFaculty._id,
      room: 'Room 304 - CS Block',
      department: 'Computer Science & Engineering',
      semester: 6,
      section: 'A',
    });
    console.log('✓ Timetable Model: entry created with id', testTimetable._id);

    // 6. Test Complaint Model
    const testComplaint = await Complaint.create({
      title: 'Lab 3 Projector Lamp Flickering',
      description: 'The overhead projector in CS Lab 3 turns off after 10 minutes.',
      category: 'Infrastructure',
      priority: 'High',
      status: 'Assigned',
      submittedBy: testUser._id,
      assignedTo: testStaff._id,
      location: 'Computer Science Lab 3, 2nd Floor',
    });
    console.log('✓ Complaint Model: entry created with id', testComplaint._id);

    // 7. Test Booking Model
    const testBooking = await Booking.create({
      resourceType: 'Computer Lab',
      resourceName: 'Advanced AI & ML Lab (Lab 5)',
      bookedBy: testFaculty._id,
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      purpose: 'Hands-on Workshop for Final Year B.Tech Project demo',
      status: 'Pending',
    });
    console.log('✓ Booking Model: entry created with id', testBooking._id);

    // 8. Test Notification Model
    const testNotification = await Notification.create({
      recipient: testUser._id,
      sender: testFaculty._id,
      title: 'Workshop Scheduled',
      message: 'Lab 5 has been booked for tomorrow afternoon.',
      type: 'Booking',
      link: '/bookings',
    });
    console.log('✓ Notification Model: alert created with id', testNotification._id);

    // 9. Test Announcement Model
    const testAnnouncement = await Announcement.create({
      title: 'SmartCampus Portal Demonstration',
      content: 'All faculty and students are invited to the portal showcase.',
      author: testFaculty._id,
      targetRoles: ['Student', 'Faculty', 'Staff', 'Admin'],
      department: 'All',
      priority: 'Important',
    });
    console.log('✓ Announcement Model: broadcast created with id', testAnnouncement._id);

    // 10. Test Message Model
    const testMessage = await Message.create({
      sender: testUser._id,
      room: 'general',
      content: 'Hello everyone! Testing real-time communication.',
      readBy: [testUser._id],
    });
    console.log('✓ Message Model: chat message created with id', testMessage._id);

    // 11. Test LeaveRequest Model
    const testLeave = await LeaveRequest.create({
      applicant: testUser._id,
      leaveType: 'Sick',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      reason: 'Suffering from seasonal fever.',
      status: 'Pending',
    });
    console.log('✓ LeaveRequest Model: record created with id', testLeave._id);

    // Clean up test documents
    await User.deleteMany({ _id: { $in: [testUser._id, testFaculty._id, testStaff._id] } });
    await Attendance.deleteOne({ _id: testAttendance._id });
    await Timetable.deleteOne({ _id: testTimetable._id });
    await Complaint.deleteOne({ _id: testComplaint._id });
    await Booking.deleteOne({ _id: testBooking._id });
    await Notification.deleteOne({ _id: testNotification._id });
    await Announcement.deleteOne({ _id: testAnnouncement._id });
    await Message.deleteOne({ _id: testMessage._id });
    await LeaveRequest.deleteOne({ _id: testLeave._id });
    console.log('✓ Cleaned up all test documents successfully.');

    console.log('\n=========================================');
    console.log('🎉 ALL 9 MONGOOSE MODELS VALIDATED & WORKING!');
    console.log('=========================================');
  } catch (err) {
    console.error('❌ Model test failed with error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testAllModels();
