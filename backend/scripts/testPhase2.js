/**
 * Automated Test Suite for Phase 2: Attendance & Timetable Modules
 * Tests faculty attendance marking, student attendance viewing, timetable queries, and RBAC enforcement
 */

const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { app } = require('../server');
const connectDB = require('../config/db');

function makeRequest(server, options, postData = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      ...options,
      port,
      host: '127.0.0.1',
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase2Tests() {
  console.log('--- Testing SmartCampus AI Phase 2: Attendance & Timetable ---');
  await connectDB();

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  console.log(`✓ Test server running on ephemeral port ${port}`);

  try {
    // 1. Authenticate Faculty
    const facultyLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'faculty@campus.edu', password: 'Faculty123!' }
    );
    const facultyToken = facultyLogin.body.token;
    console.log('✓ Faculty authentication successful');

    // 2. Authenticate Student
    const studentLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'student@campus.edu', password: 'Student123!' }
    );
    const studentToken = studentLogin.body.token;
    const studentId = studentLogin.body.user._id;
    console.log('✓ Student authentication successful');

    // 3. Authenticate Admin
    const adminLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@campus.edu', password: 'Admin123!' }
    );
    const adminToken = adminLogin.body.token;
    console.log('✓ Admin authentication successful');

    // 4. Faculty fetches student roster for taking attendance
    const rosterRes = await makeRequest(testServer, {
      path: '/api/attendance/students?semester=6&section=A',
      method: 'GET',
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    if (rosterRes.status !== 200 || !rosterRes.body.students) {
      throw new Error(`Failed to fetch student roster: ${JSON.stringify(rosterRes.body)}`);
    }
    console.log(`✓ Faculty fetched student attendance roster (${rosterRes.body.count} students in Sem 6 Sec A)`);

    // 5. Faculty marks attendance for the class
    const today = new Date().toISOString();
    const markRes = await makeRequest(
      testServer,
      {
        path: '/api/attendance/mark',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${facultyToken}`,
        },
      },
      {
        subject: 'Artificial Intelligence & Machine Learning',
        date: today,
        semester: 6,
        section: 'A',
        records: [
          {
            student: studentId,
            status: 'Present',
            remarks: 'Active lab participation',
          },
        ],
      }
    );
    if (markRes.status !== 200 || !markRes.body.success) {
      throw new Error(`Failed to mark attendance: ${JSON.stringify(markRes.body)}`);
    }
    console.log(`✓ Faculty successfully marked attendance: ${markRes.body.message}`);

    // 6. Student views personal attendance overview
    const studentAttendanceRes = await makeRequest(testServer, {
      path: '/api/attendance/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (studentAttendanceRes.status !== 200 || !studentAttendanceRes.body.summary) {
      throw new Error(`Student attendance retrieval failed: ${JSON.stringify(studentAttendanceRes.body)}`);
    }
    const summary = studentAttendanceRes.body.summary;
    console.log(
      `✓ Student verified attendance: ${summary.overallPercentage}% overall across ${summary.totalClasses} classes (Low attendance alert: ${summary.isLowAttendance})`
    );

    // 7. Security Check: Student cannot call /api/attendance/mark (403 Forbidden check)
    const forbiddenRes = await makeRequest(
      testServer,
      {
        path: '/api/attendance/mark',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
      },
      {
        subject: 'Hacking 101',
        date: today,
        semester: 6,
        section: 'A',
        records: [{ student: studentId, status: 'Present' }],
      }
    );
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Student marking attendance, received ${forbiddenRes.status}`);
    }
    console.log('✓ RBAC Security verified: Student blocked from marking attendance (403 Forbidden)');

    // 8. Timetable Query (Open to student & faculty)
    const timetableRes = await makeRequest(testServer, {
      path: '/api/timetable?semester=6&section=A',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (timetableRes.status !== 200 || !Array.isArray(timetableRes.body.slots)) {
      throw new Error(`Timetable query failed: ${JSON.stringify(timetableRes.body)}`);
    }
    console.log(`✓ Timetable query verified (${timetableRes.body.count} weekly lecture slots returned)`);

    // 9. Faculty Schedule Query
    const facultyScheduleRes = await makeRequest(testServer, {
      path: '/api/timetable/my-schedule',
      method: 'GET',
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    if (facultyScheduleRes.status !== 200 || !Array.isArray(facultyScheduleRes.body.slots)) {
      throw new Error(`Faculty schedule query failed: ${JSON.stringify(facultyScheduleRes.body)}`);
    }
    console.log(`✓ Faculty teaching schedule verified (${facultyScheduleRes.body.count} slots assigned)`);

    // 10. Admin creates a new Timetable slot
    const createSlotRes = await makeRequest(
      testServer,
      {
        path: '/api/timetable',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        dayOfWeek: 'Wednesday',
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        subject: 'Capstone Project Evaluation & Lab',
        faculty: facultyLogin.body.user._id,
        room: 'Lab 5 - AI Wing',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'A',
      }
    );
    if (createSlotRes.status !== 201 || !createSlotRes.body.slot) {
      throw new Error(`Failed to create timetable slot: ${JSON.stringify(createSlotRes.body)}`);
    }
    const createdSlotId = createSlotRes.body.slot._id;
    console.log(`✓ Admin created new lecture slot with id ${createdSlotId} (201 Created)`);

    // 11. Admin deletes the test timetable slot
    const deleteSlotRes = await makeRequest(testServer, {
      path: `/api/timetable/${createdSlotId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deleteSlotRes.status !== 200) {
      throw new Error(`Failed to delete timetable slot: ${JSON.stringify(deleteSlotRes.body)}`);
    }
    console.log('✓ Admin successfully deleted slot (200 OK)');

    console.log('\n=================================================');
    console.log('🎉 ALL 11 PHASE 2 ATTENDANCE & TIMETABLE TESTS PASSED!');
    console.log('=================================================\n');
  } catch (error) {
    console.error('❌ Phase 2 test failed with error:', error);
    process.exit(1);
  } finally {
    testServer.close();
    process.exit(0);
  }
}

runPhase2Tests();

