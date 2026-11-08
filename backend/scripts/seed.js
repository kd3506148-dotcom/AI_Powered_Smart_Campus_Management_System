/**
 * Database Seed Script for SmartCampus AI
 * Populates MongoDB with demo accounts for each role and starter data for college demo
 */

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
} = require('../models');

async function connectToMongo() {
  const candidates = [];
  if (process.env.MONGO_URI) candidates.push(process.env.MONGO_URI);
  candidates.push('mongodb://127.0.0.1:27017/smartcampus_db');
  if (fs.existsSync('/tmp/mongodb-27017.sock')) {
    candidates.push('mongodb://%2Ftmp%2Fmongodb-27017.sock/smartcampus_db');
  }

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[Seed]: Connected to MongoDB at ${uri}`);
      return;
    } catch (err) {
      // try next
    }
  }
  throw new Error('Could not connect to MongoDB on any candidate URI');
}

async function seedDatabase() {
  try {
    await connectToMongo();

    console.log('🧹 Clearing previous demo data...');
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Timetable.deleteMany({}),
      Complaint.deleteMany({}),
      Booking.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      Message.deleteMany({}),
    ]);

    console.log('🌱 Creating 4 Demo Accounts for Student, Faculty, Admin, Staff...');

    // 1. Student Demo User
    const student = await User.create({
      name: 'Alex Rivera',
      email: 'student@campus.edu',
      password: 'Student123!',
      role: 'Student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE-2024-001',
      semester: 6,
      section: 'A',
      phone: '+1 555-0199',
    });

    // 2. Faculty Demo User
    const faculty = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'faculty@campus.edu',
      password: 'Faculty123!',
      role: 'Faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-101',
      phone: '+1 555-0144',
    });

    // 3. Admin Demo User
    const admin = await User.create({
      name: 'Dean Arthur Vance',
      email: 'admin@campus.edu',
      password: 'Admin123!',
      role: 'Admin',
      department: 'Campus Administration',
      employeeId: 'ADM-001',
      phone: '+1 555-0100',
    });

    // 4. Staff Demo User
    const staff = await User.create({
      name: 'Robert Taylor',
      email: 'staff@campus.edu',
      password: 'Staff123!',
      role: 'Staff',
      department: 'Maintenance & Facilities',
      employeeId: 'STF-201',
      phone: '+1 555-0177',
    });

    // Additional mock student for class comparisons
    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@campus.edu',
      password: 'Student123!',
      role: 'Student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CSE-2024-002',
      semester: 6,
      section: 'A',
    });

    console.log('📢 Creating Campus Announcements...');
    await Announcement.create([
      {
        title: 'Welcome to SmartCampus AI Portal',
        content: 'The new integrated digital campus platform is now live for all students, faculty, and administrative staff.',
        author: admin._id,
        targetRoles: ['Student', 'Faculty', 'Staff', 'Admin'],
        priority: 'Important',
        department: 'All',
      },
      {
        title: 'Upcoming Mid-Semester Examinations Schedule',
        content: 'Midterm examinations will commence next Monday. Students are advised to verify their subject timetables.',
        author: faculty._id,
        targetRoles: ['Student'],
        priority: 'Urgent',
        department: 'Computer Science & Engineering',
      },
      {
        title: 'Campus Network Maintenance Notice',
        content: 'Scheduled maintenance of high-speed WiFi access points in Block B on Saturday between 02:00 AM and 05:00 AM.',
        author: staff._id,
        targetRoles: ['Student', 'Faculty', 'Staff'],
        priority: 'Normal',
        department: 'All',
      },
    ]);

    console.log('🗓️ Creating Timetable entries for CSE Sem 6 Sec A...');
    await Timetable.create([
      {
        dayOfWeek: 'Monday',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        subject: 'Artificial Intelligence & Machine Learning',
        faculty: faculty._id,
        room: 'Lab 5 - AI & Robotics Wing',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'A',
      },
      {
        dayOfWeek: 'Monday',
        startTime: '10:15 AM',
        endTime: '11:15 AM',
        subject: 'Distributed Cloud Computing',
        faculty: faculty._id,
        room: 'Room 304 - Academic Block',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'A',
      },
      {
        dayOfWeek: 'Tuesday',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
        subject: 'Full-Stack Web Architectures',
        faculty: faculty._id,
        room: 'CS Computer Lab 2',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'A',
      },
    ]);

    console.log('📝 Creating Initial Attendance Records for Student...');
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 172800000);

    await Attendance.create([
      {
        student: student._id,
        faculty: faculty._id,
        subject: 'Artificial Intelligence & Machine Learning',
        date: today,
        status: 'Present',
        semester: 6,
        section: 'A',
      },
      {
        student: student._id,
        faculty: faculty._id,
        subject: 'Distributed Cloud Computing',
        date: yesterday,
        status: 'Present',
        semester: 6,
        section: 'A',
      },
      {
        student: student._id,
        faculty: faculty._id,
        subject: 'Full-Stack Web Architectures',
        date: twoDaysAgo,
        status: 'Late',
        semester: 6,
        section: 'A',
        remarks: 'Admitted with late slip',
      },
    ]);

    console.log('🛠️ Creating Sample Complaints...');
    await Complaint.create([
      {
        title: 'Projector in CS Lab 3 not turning on',
        description: 'During morning lab session the HDMI connector and projector lamp remained unpowered.',
        category: 'Infrastructure',
        priority: 'High',
        status: 'Assigned',
        submittedBy: student._id,
        assignedTo: staff._id,
        location: 'CS Department, Lab 3, 2nd Floor',
      },
      {
        title: 'Hostel Block C 3rd Floor Water Purifier Filter Maintenance',
        description: 'Water flow rate is significantly reduced and water filter indicator shows red LED.',
        category: 'Hostel',
        priority: 'Medium',
        status: 'In Progress',
        submittedBy: student._id,
        assignedTo: staff._id,
        location: 'Hostel Block C, Wing 3',
      },
      {
        title: 'Library WiFi signal dropping intermittently',
        description: 'Frequent WiFi disconnections near study cubicles 15 to 25.',
        category: 'Network/WiFi',
        priority: 'Medium',
        status: 'Submitted',
        submittedBy: student2._id,
        location: 'Central Library, 1st Floor Reading Hall',
      },
    ]);

    console.log('🏛️ Creating Classroom & Lab Bookings...');
    await Booking.create([
      {
        resourceType: 'Computer Lab',
        resourceName: 'Advanced AI & ML Lab (Lab 5)',
        bookedBy: faculty._id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        purpose: 'B.Tech Project Evaluation and Hands-On Demonstration',
        status: 'Approved',
        approvedBy: admin._id,
        approvalRemarks: 'Approved for final year demonstration',
      },
      {
        resourceType: 'Seminar Hall',
        resourceName: 'Main Auditorium (Hall A)',
        bookedBy: faculty._id,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        purpose: 'Guest Lecture on Next-Gen Autonomous AI Agents',
        status: 'Pending',
      },
    ]);

    console.log('🔔 Creating Initial Notifications...');
    await Notification.create([
      {
        recipient: student._id,
        title: 'Welcome to SmartCampus',
        message: 'Your student profile is ready. Check your timetable and attendance.',
        type: 'System',
      },
      {
        recipient: student._id,
        title: 'Complaint Update',
        message: 'Your complaint regarding CS Lab 3 has been assigned to Robert Taylor.',
        type: 'Complaint',
        link: '/complaints',
      },
    ]);

    console.log('\n==========================================================');
    console.log('🎉 SMARTCAMPUS AI SEED COMPLETED SUCCESSFULLY!');
    console.log('==========================================================');
    console.log('Demo Credentials for B.Tech Project Presentation:');
    console.log('----------------------------------------------------------');
    console.log('Role       | Email                 | Password');
    console.log('----------------------------------------------------------');
    console.log('Student    | student@campus.edu    | Student123!');
    console.log('Faculty    | faculty@campus.edu    | Faculty123!');
    console.log('Admin      | admin@campus.edu      | Admin123!');
    console.log('Staff      | staff@campus.edu      | Staff123!');
    console.log('==========================================================\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
