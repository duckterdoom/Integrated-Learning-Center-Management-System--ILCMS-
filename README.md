# ILCMS — Integrated Learning Center Management System

A web-based management platform for learning centers, supporting three user roles: **Admin**, **Staff**, and **Sale**. Built with React (Vite) on the frontend and Node.js (Express) on the backend, connected to a MySQL database.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Tester Setup Guide](#tester-setup-guide)
3. [Developer Setup Guide](#developer-setup-guide)
4. [Login Accounts](#login-accounts)
5. [Project Structure](#project-structure)
6. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer    | Technology           | Port |
|----------|----------------------|------|
| Frontend | React 19 + Vite      | 5173 |
| Backend  | Node.js + Express.js | 5000 |
| Database | MySQL (via Laragon)  | 3306 |

---

## Tester Setup Guide

> Steps 1–7 are done **once only**.
> From next time: open Laragon → Start All → then run Steps 8 and 9 only.

---

### Step 1 — Install Node.js

1. Go to https://nodejs.org/en/download
2. Click **LTS** version → Download
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type `node -v` → should show a version number

---

### Step 2 — Install Git

1. Go to https://git-scm.com/downloads
2. Click **Download for Windows**
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type `git --version` → should show a version number

---

### Step 3 — Install Laragon

1. Go to https://laragon.org/download
2. Click **Download Laragon Full**
3. Run the installer → click **Next** until **Finish**
4. Laragon opens automatically after install

---

### Step 4 — Start Laragon

1. Open **Laragon** from your Desktop or Start menu
2. Click **Start All**
3. Wait until **MySQL** shows green ✓

```
Apache  ● Running
MySQL   ● Running  ← must be green before continuing
```

> Keep Laragon running in the background at all times while using the app.

---

### Step 5 — Clone the Project

Open **Command Prompt** and run:

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\laragon\www\ILCMS
```

Wait until it finishes downloading.

---

### Step 6 — Import the Database

In the same **Command Prompt**, run:

```bash
C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root < "C:\laragon\www\ILCMS\Backend\database\backup.sql"
```

No errors = database imported successfully ✓

> **If you see "The system cannot find the path":**
> Open `C:\laragon\bin\mysql\` in File Explorer, check the folder name inside,
> then replace `mysql-8.0.30-winx64` in the command with that folder name.

---

### Step 7 — Install Dependencies

Run these commands one by one:

```bash
cd C:\laragon\www\ILCMS\Backend
npm install
```

```bash
cd C:\laragon\www\ILCMS\Frontend\vite-project
npm install
```

Wait until both finish.

---

### Step 8 — Start the Backend

Open **Command Prompt** and run (keep this window open):

```bash
cd C:\laragon\www\ILCMS\Backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

---

### Step 9 — Start the Frontend

Open a **second Command Prompt** and run (keep this window open):

```bash
cd C:\laragon\www\ILCMS\Frontend\vite-project
npm run dev
```

You should see:
```
➜  Local: http://localhost:5173/
```

---

### Step 10 — Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

> ⚠️ **Important:**
> - Laragon must be running (MySQL green) at all times
> - Both Command Prompt windows (Steps 8 and 9) must stay open
> - From next time: just open Laragon → Start All → run Steps 8 and 9

---

## Developer Setup Guide

### Prerequisites
- Laragon: https://laragon.org/download
- Node.js: https://nodejs.org/en/download
- Git: https://git-scm.com/downloads

### Setup

```bash
# 1. Navigate to Backend
cd "path\to\ILCMS\Backend"

# 2. Install dependencies
npm install

# 3. Create database and tables
node database/setup.js
```

### Run

```bash
# Terminal 1 — Backend
cd "path\to\ILCMS\Backend"
npm run dev

# Terminal 2 — Frontend
cd "path\to\ILCMS\Frontend\vite-project"
npm run dev
```

Open browser → **http://localhost:5173**

---

## Login Accounts

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |
| Sale  | `sale`   | `sale123`  |

---

## Project Structure

```
ILCMS/
├── Backend/                     ← Node.js + Express API
│   ├── config/
│   │   └── db.js                ← MySQL connection pool
│   ├── controllers/             ← Business logic (auth, users)
│   ├── database/
│   │   ├── backup.sql           ← Database backup (import once)
│   │   ├── schema.sql           ← Database schema reference
│   │   ├── setup.js             ← Dev only: creates DB + tables
│   │   └── seed.js              ← Dev only: seeds Admin account
│   ├── middleware/              ← JWT auth, request validation
│   ├── routes/                  ← API route definitions
│   ├── .env                     ← Environment config
│   └── server.js                ← App entry point
│
└── Frontend/
    └── vite-project/            ← React + Vite app
        ├── public/
        │   └── ismart-favicon.png
        └── src/
            ├── App.jsx          ← Routes and role-based access control
            ├── assets/          ← Logo images
            └── pages/
                ├── auth/        ← LoginPage
                ├── admin/       ← AdminHomePage, ManageAccountPage
                ├── staff/       ← StaffHomePage
                └── saler/       ← SalerHomePage
```

---

## Troubleshooting

**"mysql is not recognized" in Step 2**
- Open `C:\laragon\bin\mysql\` and check your folder name
- Replace `mysql-8.0.30-winx64` in the command with that folder name

**Step 2 shows errors when importing**
- Make sure Laragon is running and MySQL is green
- Try with no password: remove `-pviet` from the command

**"npm install" fails**
- Make sure Node.js is installed: run `node -v` in terminal
- Delete the `node_modules` folder and run `npm install` again

**Login shows "Invalid username or password"**
- Make sure the database was imported correctly (Step 2)
- Make sure the backend terminal is still running (port 5000)

**Page shows blank / "Cannot GET /"**
- Make sure the frontend terminal is running (port 5173)
- Open `http://localhost:5173` not `http://localhost:5000`

**Port already in use**
- Stop other Node.js processes or restart your computer
