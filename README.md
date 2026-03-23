# ILCMS — Integrated Learning Center Management System

A web-based management platform for learning centers, supporting three user roles: **Admin**, **Staff**, and **Sale**. Built with React (Vite) on the frontend and Node.js (Express) on the backend, connected to a MySQL database.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites — What to Install](#prerequisites--what-to-install)
3. [Step 1 — Set Up the Database](#step-1--set-up-the-database)
4. [Step 2 — Set Up the Backend](#step-2--set-up-the-backend)
5. [Step 3 — Set Up the Frontend](#step-3--set-up-the-frontend)
6. [Step 4 — Run the Project](#step-4--run-the-project)
7. [Default Login Accounts](#default-login-accounts)
8. [Project Structure](#project-structure)
9. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer     | Technology                  | Port  |
|-----------|-----------------------------|-------|
| Frontend  | React 19 + Vite             | 5173  |
| Backend   | Node.js + Express.js        | 5000  |
| Database  | MySQL                        | 3306  |

---

## Prerequisites — What to Install

Before running the project, install the following tools on your machine. Each link goes to the official download page.

### 1. Node.js (v18 or higher)
- Download: https://nodejs.org/en/download
- Choose the **LTS** version (recommended)
- After installing, verify in a terminal:
  ```
  node -v
  npm -v
  ```
  You should see version numbers printed (e.g. `v20.x.x`).

### 2. MySQL Server
You can install MySQL in one of two ways:

**Option A — XAMPP (easiest for beginners):**
- Download: https://www.apachefriends.org/download.html
- Install XAMPP, then open the **XAMPP Control Panel** and click **Start** next to **MySQL**

**Option B — MySQL Community Server (standalone):**
- Download: https://dev.mysql.com/downloads/mysql/
- During installation, set a root password and remember it

### 3. MySQL Workbench (recommended GUI tool)
- Download: https://dev.mysql.com/downloads/workbench/
- Used to run SQL scripts and view the database visually
- Alternative: use **phpMyAdmin** if you installed XAMPP (open browser → http://localhost/phpmyadmin)

### 4. Git (optional, for cloning)
- Download: https://git-scm.com/downloads

---

## Step 1 — Set Up the Database

### 1.1 — Start MySQL
- **XAMPP users:** Open XAMPP Control Panel → click **Start** next to MySQL
- **Standalone MySQL users:** MySQL should already be running as a Windows service

### 1.2 — Create the Database and Tables

1. Open **MySQL Workbench** (or phpMyAdmin)
2. Connect to your local MySQL server (host: `localhost`, user: `root`)
3. Open the file:
   ```
   Backend/database/schema.sql
   ```
4. Run the entire file — this will:
   - Create the database `ilcms_db`
   - Create all tables (Role, User, Course, Class, Student, Enrollment, Attendance, Score)
   - Insert the three roles: Admin, Staff, Sale

### 1.3 — Configure the Backend Database Password

Open the file `Backend/.env` in any text editor (Notepad, VS Code, etc.):

```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here   ← change this line
DB_NAME=ilcms_db

JWT_SECRET=ilcms_jwt_access_secret_change_me_in_production
JWT_REFRESH_SECRET=ilcms_jwt_refresh_secret_change_me_in_production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

BCRYPT_ROUNDS=10
```

Replace `your_mysql_password_here` with your actual MySQL root password.
- XAMPP default: leave it empty (`DB_PASSWORD=`)
- If you set a password during MySQL installation, enter that password

---

## Step 2 — Set Up the Backend

Open a terminal (Command Prompt or PowerShell) and run:

```bash
# 1. Navigate to the Backend folder
cd "path\to\ILCMS\Backend"

# 2. Install dependencies (only needed once)
npm install

# 3. Seed the default Admin account into the database (only needed once)
node database/seed.js
```

If the seed runs successfully you will see:
```
✓ Admin account seeded (username: admin)
```

---

## Step 3 — Set Up the Frontend

Open a **second** terminal and run:

```bash
# 1. Navigate to the Frontend project folder
cd "path\to\ILCMS\Frontend\vite-project"

# 2. Install dependencies (only needed once)
npm install
```

---

## Step 4 — Run the Project

You need **two terminals open at the same time** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend
```bash
cd "path\to\ILCMS\Backend"
npm run dev
```
You should see:
```
Server running on port 5000
Database connected
```

### Terminal 2 — Start the Frontend
```bash
cd "path\to\ILCMS\Frontend\vite-project"
npm run dev
```
You should see:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Open the App
Open your browser and go to:
```
http://localhost:5173
```

> **Important:** Both terminals must stay open while using the app. Closing either one will stop that part of the system.

---

## Default Login Accounts

After running the seed script, the following account is available:

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123` |

**To create Staff or Sale accounts:**
1. Log in as Admin
2. Go to **Manage Account** in the top navigation bar
3. Click **Add Account** and fill in the form

---

## Project Structure

```
ILCMS/
├── Backend/                    ← Node.js + Express API
│   ├── config/
│   │   └── db.js               ← MySQL connection pool
│   ├── controllers/            ← Business logic (auth, users)
│   ├── database/
│   │   ├── schema.sql          ← Run this first to create DB + tables
│   │   └── seed.js             ← Run this once to create Admin account
│   ├── middleware/             ← JWT auth, request validation
│   ├── routes/                 ← API route definitions
│   ├── .env                    ← Environment config (DB password, JWT secrets)
│   └── server.js               ← App entry point
│
└── Frontend/
    └── vite-project/           ← React + Vite app
        ├── public/
        │   └── ismart-favicon.png
        └── src/
            ├── App.jsx         ← Routes and role-based access control
            ├── assets/         ← Logo images
            └── pages/
                ├── auth/       ← LoginPage
                ├── admin/      ← AdminHomePage, ManageAccountPage
                ├── staff/      ← StaffHomePage
                └── saler/      ← SalerHomePage
```

---

## Troubleshooting

**"Cannot connect to database" / backend crashes on start**
- Make sure MySQL is running (check XAMPP Control Panel or Windows Services)
- Double-check `DB_PASSWORD` in `Backend/.env`
- Make sure you ran `schema.sql` to create the `ilcms_db` database

**"npm install" fails**
- Make sure Node.js is installed: run `node -v` in terminal
- Try deleting the `node_modules` folder and running `npm install` again

**Login shows "Invalid credentials"**
- Make sure you ran `node database/seed.js` from inside the `Backend` folder
- Check that the backend terminal is still running (port 5000)

**Page shows blank / "Cannot GET /"**
- Make sure the frontend terminal is running (port 5173)
- Open `http://localhost:5173` not `http://localhost:5000`

**Port already in use**
- Another program is using port 5000 or 5173
- Stop other Node.js processes or restart your computer
