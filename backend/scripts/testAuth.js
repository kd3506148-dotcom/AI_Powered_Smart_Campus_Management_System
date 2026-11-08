/**
 * Automated Test Suite for Authentication & RBAC API Endpoints
 * Tests register, login for all 4 roles, token verification, and profile endpoints
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

async function runAuthTests() {
  console.log('--- Testing SmartCampus AI Auth Endpoints & RBAC ---');
  await connectDB();

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  console.log(`✓ Test server running on ephemeral port ${port}`);

  try {
    // Test 1: Health Check
    const health = await makeRequest(testServer, {
      path: '/api/health',
      method: 'GET',
    });
    if (health.status !== 200 || !health.body.success) {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
    console.log('✓ Health check endpoint functioning (200 OK)');

    // Test 2: Student Login
    const studentLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'student@campus.edu', password: 'Student123!' }
    );
    if (studentLogin.status !== 200 || !studentLogin.body.token) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLogin.body)}`);
    }
    console.log(`✓ Student Login verified (Role: ${studentLogin.body.user.role}, Name: ${studentLogin.body.user.name})`);
    const studentToken = studentLogin.body.token;

    // Test 3: Faculty Login
    const facultyLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'faculty@campus.edu', password: 'Faculty123!' }
    );
    if (facultyLogin.status !== 200 || facultyLogin.body.user.role !== 'Faculty') {
      throw new Error(`Faculty login failed: ${JSON.stringify(facultyLogin.body)}`);
    }
    console.log(`✓ Faculty Login verified (Role: ${facultyLogin.body.user.role}, Name: ${facultyLogin.body.user.name})`);

    // Test 4: Admin Login
    const adminLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@campus.edu', password: 'Admin123!' }
    );
    if (adminLogin.status !== 200 || adminLogin.body.user.role !== 'Admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }
    console.log(`✓ Admin Login verified (Role: ${adminLogin.body.user.role}, Name: ${adminLogin.body.user.name})`);

    // Test 5: Staff Login
    const staffLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'staff@campus.edu', password: 'Staff123!' }
    );
    if (staffLogin.status !== 200 || staffLogin.body.user.role !== 'Staff') {
      throw new Error(`Staff login failed: ${JSON.stringify(staffLogin.body)}`);
    }
    console.log(`✓ Staff Login verified (Role: ${staffLogin.body.user.role}, Name: ${staffLogin.body.user.name})`);

    // Test 6: Verify Token with /api/auth/me
    const meResponse = await makeRequest(testServer, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    if (meResponse.status !== 200 || meResponse.body.user.email !== 'student@campus.edu') {
      throw new Error(`/api/auth/me failed: ${JSON.stringify(meResponse.body)}`);
    }
    console.log('✓ JWT Token authentication validated via /api/auth/me');

    // Test 7: Get Dashboard Stats
    const statsResponse = await makeRequest(testServer, {
      path: '/api/auth/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    if (statsResponse.status !== 200 || !statsResponse.body.stats) {
      throw new Error(`/api/auth/stats failed: ${JSON.stringify(statsResponse.body)}`);
    }
    console.log('✓ Campus statistics endpoint verified:', statsResponse.body.stats);

    // Test 8: Register New User
    const newStudentEmail = `testuser_${Date.now()}@campus.edu`;
    const registerResponse = await makeRequest(
      testServer,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Jordan Lee',
        email: newStudentEmail,
        password: 'Password123!',
        role: 'Student',
        department: 'Computer Science & Engineering',
        rollNumber: 'CSE-2024-099',
        semester: 6,
      }
    );
    if (registerResponse.status !== 201 || !registerResponse.body.token) {
      throw new Error(`Register failed: ${JSON.stringify(registerResponse.body)}`);
    }
    console.log('✓ New user registration endpoint verified (201 Created)');

    // Test 9: Invalid Password Rejection (Security check)
    const badLogin = await makeRequest(
      testServer,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'student@campus.edu', password: 'WrongPassword999' }
    );
    if (badLogin.status !== 401) {
      throw new Error(`Expected 401 for bad password but received ${badLogin.status}`);
    }
    console.log('✓ Bad password rejected with 401 Unauthorized as expected');

    // Test 10: Validation Error Handler (Express-validator check)
    const badRegister = await makeRequest(
      testServer,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: '', email: 'not-an-email', password: '123' }
    );
    if (badRegister.status !== 400 || !badRegister.body.errors) {
      throw new Error(`Expected 400 validation error but received ${badRegister.status}`);
    }
    console.log('✓ Express-validator input checks verified (400 Bad Request with field details)');

    console.log('\n=================================================');
    console.log('🎉 ALL 10 AUTHENTICATION & RBAC TESTS PASSED!');
    console.log('=================================================\n');
  } catch (error) {
    console.error('❌ Auth test failed with error:', error);
    process.exit(1);
  } finally {
    testServer.close();
    process.exit(0);
  }
}

runAuthTests();

