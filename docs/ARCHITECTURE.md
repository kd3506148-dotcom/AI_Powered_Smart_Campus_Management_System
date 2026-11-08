# SmartCampus AI - System Architecture & Database Design

## 1. Project Overview
"SmartCampus AI" is a full-stack campus management and collaboration platform engineered for college operations. It combines role-based operational workflows with real-time Socket.IO events and Python-powered AI capabilities.

---

## 2. Technology Stack
- **Frontend**: React (Vite) + Tailwind CSS + Recharts + Lucide Icons + Socket.IO Client
- **Backend**: Node.js + Express + Mongoose + Socket.IO + JWT + express-validator
- **Database**: MongoDB (Local or Atlas)
- **AI Microservice**: Python FastAPI + Google Gemini API (LLM integration)

---

## 3. Directory Layout
```text
smartcampus-ai/
├── package.json               # Root scripts for multi-service execution
├── backend/                   # Node.js Express REST API & Socket.IO
│   ├── config/                # Database & server configurations (db.js)
│   ├── controllers/           # Request handlers for auth, attendance, etc.
│   ├── middleware/            # Auth JWT, role checks, rate limiting, error handler
│   ├── models/                # Mongoose schemas (User, Attendance, Timetable, etc.)
│   ├── routes/                # Express API endpoint definitions
│   ├── scripts/               # DB seed scripts and test runners
│   ├── .env.example           # Backend environment configuration template
│   └── package.json           # Backend package dependencies
├── frontend/                  # React + Vite + Tailwind CSS Single Page App
│   ├── public/                # Static assets (logos, icons)
│   ├── src/                   # Components, pages, hooks, state, utils
│   ├── .env.example           # Frontend environment configuration template
│   └── package.json           # Frontend package dependencies
├── ai_service/                # Python FastAPI Microservice
│   ├── main.py                # FastAPI app endpoints for chatbot, triage, tips
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # AI service environment configuration template
└── docs/                      # Architectural specs, API docs, and phase guides
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Module / Feature | Student | Faculty | Staff | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication (Login/Register)** | Yes | Yes | Yes | Yes |
| **Personal Dashboard** | Student View | Faculty View | Staff View | Admin View |
| **Attendance** | View Own | Mark & View Class | No | View All Reports |
| **Timetable** | View Section | View Assigned | No | Manage / Assign |
| **Complaints** | Submit & Track | Submit & Track | View Assigned & Resolve | Full Oversight & Assign |
| **Classroom/Lab Booking** | Submit Request | Submit Request | No | Approve / Reject |
| **Announcements** | View Target | Publish & View | View Target | Full Broadcast Rights |
| **Real-time Chat** | General / Groups | General / Groups | Helpdesk | Full Moderation |
| **AI Assistant** | Tutor / FAQ | Syllabus Helper | Maintenance Assistant | Analytics & Auto-triage |

---

## 5. Mongoose Data Models Summary

1. **User (`User.js`)**
   - Core identity, credentials (hashed via bcrypt), contact info, and role: `['Student', 'Faculty', 'Admin', 'Staff']`.
   - Automatic pre-save hashing and password sanitization on `toJSON()`.

2. **Attendance (`Attendance.js`)**
   - Student, faculty, subject, date, status (`Present`, `Absent`, `Late`, `Excused`), semester, and section.
   - Compound unique index on `{ student, subject, date }`.

3. **Timetable (`Timetable.js`)**
   - Weekday, time slots, room, department, semester, section, and faculty reference.

4. **Complaint (`Complaint.js`)**
   - Title, description, category (`Hostel`, `Academic`, `Infrastructure`, `Mess/Canteen`, `Network/WiFi`, `Maintenance`, `Other`).
   - Priority (`Low`, `Medium`, `High`, `Urgent`), status (`Submitted`, `Assigned`, `In Progress`, `Resolved`, `Rejected`).
   - References `submittedBy` and `assignedTo`. Enriched with `aiCategorized` & `aiConfidence`.

5. **Booking (`Booking.js`)**
   - Facility type (`Classroom`, `Computer Lab`, `Seminar Hall`, etc.), date, time slot, applicant (`bookedBy`), approval status, and `approvedBy` (Admin).

6. **Notification (`Notification.js`)**
   - Recipient, sender, title, message, link, type, and unread tracking (`isRead`).

7. **Announcement (`Announcement.js`)**
   - Broadcast notices targeted to specific roles and departments with priority levels.

8. **Message (`Message.js`)**
   - Room-based and 1-to-1 live chat records for Socket.IO synchronization.

9. **LeaveRequest (`LeaveRequest.js`)**
   - Student and faculty leave applications with review workflow.
