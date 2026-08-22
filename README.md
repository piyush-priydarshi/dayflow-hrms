# DayFlow — HR Management System

DayFlow is a web-based Human Resource Management System that brings common HR and employee tasks into one place.

We are building DayFlow as a hackathon project with a focus on making the system useful, simple to navigate, and visually different from typical HRMS dashboards.

The first version focuses on getting the core HRMS workflow working. The UI and interactive experience will be developed further as the project progresses.

---

## What we're building

The system is planned around two main types of users:

### Employee
- View and update personal profile
- Mark attendance
- View attendance records
- Apply for leave
- Track leave requests
- View salary/payroll information

### Admin / HR
- Manage employees
- View employee profiles
- Monitor attendance
- Review leave requests
- Manage payroll information
- Access HR-related records from a central dashboard

More features will be added based on the hackathon requirements.

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Toastify

### Backend
- Node.js
- Express.js

## LLM/AI
- Claude API

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- Local storage for client-side session handling

---

## Project Structure

```text
dayflow/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Leave.jsx
│   │   │   └── Payroll.jsx
│   │   └── ...
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   │
│   └── package.json
│
├── package.json
└── README.md
