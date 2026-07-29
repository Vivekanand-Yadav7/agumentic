# 🏢 PropManage — Real Estate Management System (ERP)

**PropManage** is a modern, full-stack Real Estate Management & Workforce Portal built with **Node.js, Express, Prisma ORM, Neon PostgreSQL, and React (Vite)**. It provides role-based functionality for **Employers (Admins)** and **Employees**, enabling property development tracking, project assignments, leave workflows, monthly payroll processing, and daily attendance logging.

---

## 🌟 Key Features

### 🏢 Employer / Admin Dashboard
- **Executive Analytics**: Real-time stats on active workforce, real estate projects, site progress, pending leave requests, and payroll status.
- **Real Estate Projects Management**: Create, edit, monitor budgets, completion progress (%), property types (*Residential, Commercial, Land, Rental*), and assign multi-disciplinary teams (*Project Lead, Architect, Site Supervisor*).
- **Leave Approval Workflow**: Review employee leave applications with instant Approve / Reject controls and custom remarks.
- **Monthly Payroll Processing**: Generate salary slips calculating Basic, HRA, Allowances, Deductions, and Tax with one-click payment status updates.
- **Employee Directory**: Manage staff profiles, designations, departments, base salaries, and system roles.

### 👤 Employee Dashboard
- **Personalized Workspace**: View assigned real estate projects, pending leave requests, net disbursed salary, and monthly attendance counts.
- **My Projects**: Access property details, client information, site location, and completion status for assigned projects.
- **Leave Application**: Apply for casual, sick, annual, or unpaid leaves and track approval status.
- **Salary Slips**: Download and review detailed monthly salary breakdowns and payment receipts.
- **Attendance Logging**: One-click daily clock-in and attendance log tracking.

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma ORM v5
- **Database**: Serverless PostgreSQL (**Neon DB**)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

### **Frontend**
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Styling**: Modern Vanilla CSS with dark/light dynamic tokens & responsive layouts

---

## 📁 Repository Structure

```
shilabs/
├── package.json              # Root package orchestrating full-stack build & start
├── server/
│   ├── prisma/
│   │   └── schema.prisma     # PostgreSQL database schema
│   ├── src/
│   │   ├── config/           # DB & Prisma instances
│   │   ├── controllers/      # Dashboard, Projects, Leaves, Payroll, Employees, Attendance
│   │   ├── middleware/       # JWT Auth & Role protection
│   │   ├── routes/           # REST API endpoints
│   │   ├── utils/            # Seed script with test data
│   │   └── index.js          # Express app entry point
│   └── package.json
└── client/
    ├── src/
    │   ├── components/       # Layout, Header, Sidebar
    │   ├── context/          # Auth Context
    │   ├── pages/            # Login, Signup, Dashboard, Projects, Leaves, Payroll, Employees, Attendance
    │   ├── utils/            # Axios API instance
    │   ├── App.jsx           # React Router
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL database URL (or any PostgreSQL database)

---

### 2. Installation & Setup

Clone the repository and install all dependencies:

```bash
git clone https://github.com/Vivekanand-Yadav7/agumentic.git
cd agumentic

# Install both server and client dependencies
npm install
```

---

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://neondb_owner:npg_XA7LKw5lJTju@ep-nameless-violet-ay7ywpog-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET=your_secure_jwt_secret_key_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3001
```

---

### 4. Database Push & Seeding

Sync the Prisma schema to your PostgreSQL database and populate initial sample data:

```bash
# Push schema to PostgreSQL
npm run db:push

# Seed database with sample accounts, projects, leaves & payroll
npm run db:seed
```

---

### 5. Running the Application Locally

Start both the backend server and frontend client concurrently:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:3001)
npm run dev:client
```

Open **`http://localhost:3001`** in your browser.

---

## 🔑 Test Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Employer / Admin** | `abhi@gmail.com` | `123` | Full ERP Control, Project Creation, Team Assignment, Leave Review, Payroll Processing |
| **Employee 1** | `employee@gmail.com` | `123` | Assigned Projects, Leave Applications, Salary Slips, Daily Attendance |
| **Employee 2** | `sarah@gmail.com` | `123` | Lead Architect Workspace, Leave Requests, Salary Slips |

---

## 📡 REST API Documentation

### **Authentication**
- `POST /api/auth/register` — Register a new user (`employer` or `employee`)
- `POST /api/auth/login` — Login user and receive JWT token
- `GET /api/auth/me` — Fetch authenticated user profile

### **Dashboard**
- `GET /api/dashboard` — Returns role-specific analytical payload based on JWT user role

### **Real Estate Projects**
- `GET /api/projects` — Get projects (All projects for Employer, Assigned for Employee)
- `POST /api/projects` — Create new project *(Employer)*
- `PUT /api/projects/:id` — Update project details & progress % *(Employer)*
- `DELETE /api/projects/:id` — Delete project *(Employer)*
- `POST /api/projects/:id/assign` — Assign employee to project *(Employer)*

### **Leaves & Absence**
- `GET /api/leaves` — Fetch leave requests
- `POST /api/leaves` — Apply for leave *(Employee)*
- `PUT /api/leaves/:id/review` — Approve or Reject leave application *(Employer)*
- `DELETE /api/leaves/:id` — Cancel pending leave request *(Employee)*

### **Payrolls & Salary**
- `GET /api/payroll` — Get salary slips & payroll history
- `POST /api/payroll` — Process monthly salary disbursal *(Employer)*
- `PUT /api/payroll/:id/status` — Mark payroll as paid *(Employer)*

### **Employees & Attendance**
- `GET /api/employees` — Get employee directory *(Employer)*
- `POST /api/employees` — Create new staff member *(Employer)*
- `GET /api/attendance` — Get daily attendance logs
- `POST /api/attendance` — Clock-in daily work attendance

---

## 🚢 Deployment Guide

### Single Server Deployment (e.g. Render / Heroku / DigitalOcean)

1. Set `NODE_ENV=production` and `DATABASE_URL` in environment variables.
2. Run the build script:
   ```bash
   npm run build
   ```
3. Start the application:
   ```bash
   npm start
   ```
   *The Express server automatically serves the compiled Vite static assets from `client/dist`.*

---

## 📄 License

This project is open-source under the MIT License.
