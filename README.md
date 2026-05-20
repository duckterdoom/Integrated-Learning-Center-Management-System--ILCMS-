# ILCMS — Integrated Learning Center Management System

A web-based management platform for learning centers, supporting three user roles: **Admin**, **Staff**, and **Sale**. Built with React (Vite) on the frontend and Node.js (Express) on the backend, connected to a MySQL database.

---

## Tech Stack

| Layer    | Technology           | Port |
|----------|----------------------|------|
| Frontend | React 19 + Vite      | 5173 |
| Backend  | Node.js + Express.js | 5000 |
| Database | MySQL 8.0            | 3306 |

---

## Project Structure

```
ILCMS/
│
├── database/
│   └── ilcms_db.sql            ← Full database dump with sample data
│
├── Backend/
│   ├── .env.example            ← Copy to .env and set your DB password
│   ├── .gitignore
│   ├── package.json
│   ├── server.js               ← Entry point (auto-runs DB migrations on start)
│   ├── config/
│   │   └── db.js               ← MySQL connection pool
│   ├── controllers/            ← Business logic
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── courseController.js
│   │   ├── materialController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   ← JWT verification + role guard
│   │   └── validateMiddleware.js ← Request validation rules
│   ├── routes/
│   │   ├── auth.js
│   │   ├── classes.js
│   │   ├── courses.js
│   │   ├── materials.js
│   │   └── users.js
│   └── uploads/                ← Uploaded material files (git-ignored)
│
└── Frontend/
    └── vite-project/
        ├── index.html
        ├── vite.config.js
        ├── package.json
        ├── public/
        │   └── ismart-favicon.png
        └── src/
            ├── App.jsx         ← Routes + role-based access control
            ├── assets/         ← Logo images
            └── pages/
                ├── auth/       ← LoginPage
                ├── admin/      ← AdminHomePage, ManageAccountPage, ManageClassPage, ManageCoursePage
                ├── staff/      ← StaffHomePage, ManageClassPage, ManageCoursePage
                └── saler/      ← SalerHomePage, SalerAcademyPage
```

---

## Login Accounts

| Role  | Username | Password |
|-------|----------|----------|
| Admin | `admin`  | `admin123`  |
| Staff | `staff`  | `staff123`  |
| Sale  | `sale`   | `sale123`   |

---

## Hướng dẫn cài đặt (Tiếng Việt)

> **Các bước 1–6 chỉ thực hiện MỘT LẦN DUY NHẤT.**  
> Từ lần sau: mở terminal → chạy Bước 7 và Bước 8 là xong.

---

### Bước 1 — Cài đặt Node.js

1. Truy cập **https://nodejs.org/en/download**
2. Chọn phiên bản **LTS** → bấm **Download**
3. Chạy file vừa tải → bấm **Next** liên tục → bấm **Finish**
4. Kiểm tra:
   ```
   node -v
   ```

---

### Bước 2 — Cài đặt Git

1. Truy cập **https://git-scm.com/downloads**
2. Bấm **Download for Windows** → chạy file → **Next** → **Finish**
3. Kiểm tra:
   ```
   git --version
   ```

---

### Bước 3 — Cài đặt MySQL Community Server

1. Truy cập **https://dev.mysql.com/downloads/mysql/**
2. Tải file **mysql-installer-community** (~450 MB)
3. Chạy file cài đặt:
   - Chọn **Developer Default** → **Execute** → chờ hoàn tất
   - Ở bước **Accounts and Roles**: đặt **Root Password** (ghi nhớ lại)
   - **Next** liên tục → **Finish**
4. Kiểm tra:
   ```
   mysql --version
   ```

> ⚠️ **Ghi nhớ mật khẩu root MySQL** — sẽ dùng ở Bước 5.

---

### Bước 4 — Tải source code về máy

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\ILCMS
```

---

### Bước 5 — Cấu hình Backend

1. Vào thư mục `C:\ILCMS\Backend`
2. Sao chép file `.env.example` → đổi tên thành `.env`
3. Mở `.env` bằng Notepad, sửa dòng:
   ```
   DB_PASSWORD=mật_khẩu_của_bạn
   ```
4. Lưu file (**Ctrl + S**)

---

### Bước 6 — Cài thư viện & Import database

```bash
cd C:\ILCMS\Backend
npm install
```

```bash
cd C:\ILCMS\Frontend\vite-project
npm install
```

```bash
cd C:\ILCMS
mysql -u root -p < database/ilcms_db.sql
```

Nhập mật khẩu root MySQL → Enter. Không có lỗi = import thành công ✓

---

### Bước 7 — Khởi động Backend

Mở **Command Prompt** và giữ cửa sổ này mở:

```bash
cd C:\ILCMS\Backend
npm run dev
```

Thấy dòng này là thành công ✓
```
Server running on http://localhost:5000
```

---

### Bước 8 — Khởi động Frontend

Mở **Command Prompt thứ hai** và giữ cửa sổ này mở:

```bash
cd C:\ILCMS\Frontend\vite-project
npm run dev
```

Thấy dòng này là thành công ✓
```
➜  Local: http://localhost:5173/
```

---

### Bước 9 — Mở ứng dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

> ⚠️ MySQL Service phải đang chạy. Cả hai cửa sổ terminal phải luôn mở khi dùng app.

---

## Setup Guide (English)

> **Steps 1–6 are done ONE TIME ONLY.**  
> From next time: run Step 7 and Step 8 only.

---

### Step 1 — Install Node.js

1. Go to **https://nodejs.org/en/download** → Download **LTS**
2. Run installer → Next → Finish
3. Verify: `node -v`

---

### Step 2 — Install Git

1. Go to **https://git-scm.com/downloads** → Download for Windows
2. Run installer → Next → Finish
3. Verify: `git --version`

---

### Step 3 — Install MySQL Community Server

1. Go to **https://dev.mysql.com/downloads/mysql/**
2. Download **mysql-installer-community** (~450 MB)
3. Run installer: select **Developer Default** → Execute → at **Accounts and Roles** set a Root Password → Next → Finish
4. Verify: `mysql --version`

> ⚠️ **Remember your MySQL root password** — needed in Step 5.

---

### Step 4 — Clone the Project

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\ILCMS
```

---

### Step 5 — Configure Backend

1. Go to `C:\ILCMS\Backend`
2. Copy `.env.example` → rename to `.env`
3. Open `.env` in Notepad and set:
   ```
   DB_PASSWORD=your_mysql_password
   ```
4. Save (**Ctrl + S**)

---

### Step 6 — Install Dependencies & Import Database

```bash
cd C:\ILCMS\Backend && npm install
cd C:\ILCMS\Frontend\vite-project && npm install
```

```bash
cd C:\ILCMS
mysql -u root -p < database/ilcms_db.sql
```

Enter your MySQL root password → Enter. No errors = success ✓

---

### Step 7 — Start the Backend

Keep this window open:

```bash
cd C:\ILCMS\Backend
npm run dev
```

Success output:
```
Server running on http://localhost:5000
```

---

### Step 8 — Start the Frontend

Open a **second terminal**, keep it open:

```bash
cd C:\ILCMS\Frontend\vite-project
npm run dev
```

Success output:
```
➜  Local: http://localhost:5173/
```

---

### Step 9 — Open the App

Open **http://localhost:5173** in your browser.

> ⚠️ MySQL Service must be running. Both terminal windows must stay open.

---

## Troubleshooting

**`mysql` is not recognized**
- Add MySQL to PATH: search **"Edit system environment variables"** → Environment Variables → Path → Add `C:\Program Files\MySQL\MySQL Server 8.0\bin` → restart terminal

**Cannot import database**
- Make sure MySQL service is running: Start menu → search **Services** → find **MySQL80** → Start

**`npm install` fails**
- Confirm Node.js is installed: `node -v`
- Delete `node_modules/` folder and run `npm install` again

**"Invalid username or password" on login**
- Confirm the database was imported (Step 6)
- Confirm the Backend terminal is still running on port 5000

**Blank page or "Cannot GET /"**
- Confirm the Frontend terminal is still running: go to `http://localhost:5173` (not 5000)

**Port already in use**
- Close other Node.js processes, or run:
  ```
  netstat -ano | findstr :5000
  ```
