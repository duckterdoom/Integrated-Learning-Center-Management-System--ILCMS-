# ILCMS — Integrated Learning Center Management System

A web-based management platform for learning centers, supporting three user roles: **Admin**, **Staff**, and **Sale**. Built with React (Vite) on the frontend and Node.js (Express) on the backend, connected to a MySQL database.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Hướng dẫn cài đặt cho Tester / BA (Tiếng Việt)](#hướng-dẫn-cài-đặt-cho-tester--ba-tiếng-việt)
3. [Tester / BA Setup Guide (English)](#tester--ba-setup-guide-english)
4. [Login Accounts / Tài khoản đăng nhập](#login-accounts--tài-khoản-đăng-nhập)
5. [Project Structure](#project-structure)
6. [Troubleshooting / Xử lý lỗi](#troubleshooting--xử-lý-lỗi)

---

## Tech Stack

| Layer    | Technology           | Port |
|----------|----------------------|------|
| Frontend | React 19 + Vite      | 5173 |
| Backend  | Node.js + Express.js | 5000 |
| Database | MySQL Community      | 3306 |

---

## Hướng dẫn cài đặt cho Tester / BA (Tiếng Việt)

> **Các bước 1–6 chỉ thực hiện MỘT LẦN DUY NHẤT.**
> Từ lần sau: mở terminal → chạy Bước 7 và Bước 8 là xong.

---

### Bước 1 — Cài đặt Node.js

1. Truy cập **https://nodejs.org/en/download**
2. Chọn phiên bản **LTS** → bấm **Download**
3. Chạy file vừa tải → bấm **Next** liên tục → bấm **Finish**
4. Kiểm tra: mở **Command Prompt** → gõ lệnh sau → thấy số phiên bản là thành công ✓
   ```
   node -v
   ```

---

### Bước 2 — Cài đặt Git

1. Truy cập **https://git-scm.com/downloads**
2. Bấm **Download for Windows**
3. Chạy file vừa tải → bấm **Next** liên tục → bấm **Finish**
4. Kiểm tra: mở **Command Prompt** → gõ lệnh sau → thấy số phiên bản là thành công ✓
   ```
   git --version
   ```

---

### Bước 3 — Cài đặt MySQL Community Server

1. Truy cập **https://dev.mysql.com/downloads/mysql/**
2. Bấm **Download** ở mục **MySQL Installer for Windows**
3. Chọn file **mysql-installer-community** (bản lớn hơn ~450MB)
4. Chạy file cài đặt:
   - Chọn **Developer Default** → bấm **Next**
   - Bấm **Execute** để cài → chờ hoàn tất
   - Ở bước **Accounts and Roles**: đặt **Root Password** là `root` (hoặc mật khẩu bạn muốn — **ghi nhớ lại**)
   - Bấm **Next** liên tục → bấm **Finish**
5. Kiểm tra: mở **Command Prompt** → gõ lệnh sau → thấy số phiên bản là thành công ✓
   ```
   mysql --version
   ```

> ⚠️ **Ghi nhớ mật khẩu root MySQL** — sẽ cần dùng ở Bước 5 và Bước 7.

---

### Bước 4 — Tải source code về máy

Mở **Command Prompt** và chạy lệnh sau (chọn thư mục bạn muốn lưu):

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\ILCMS
```

Chờ đến khi tải xong. Thư mục `C:\ILCMS` sẽ được tạo.

---

### Bước 5 — Cấu hình môi trường Backend

1. Mở thư mục `C:\ILCMS\Backend` trong **File Explorer**
2. Tìm file tên `.env` — mở bằng **Notepad**
3. Sửa dòng `DB_PASSWORD` thành mật khẩu root MySQL bạn đặt ở Bước 3:
   ```
   DB_PASSWORD=mật_khẩu_của_bạn
   ```
4. Lưu file lại (**Ctrl + S**)

> Nếu không thấy file `.env`, bật tùy chọn **Show hidden files** trong File Explorer.

---

### Bước 6 — Cài đặt thư viện & Import database

Mở **Command Prompt** và chạy từng lệnh sau theo thứ tự:

**Cài thư viện Backend:**
```bash
cd C:\ILCMS\Backend
npm install
```

**Cài thư viện Frontend:**
```bash
cd C:\ILCMS\Frontend\vite-project
npm install
```

**Import database:**
```bash
cd C:\ILCMS\Backend
mysql -u root -p < database/ilcms_db.sql
```
Nhập mật khẩu root MySQL khi được hỏi → Enter.

Không có thông báo lỗi = import thành công ✓

---

### Bước 7 — Khởi động Backend

Mở **Command Prompt** và chạy (giữ cửa sổ này mở trong suốt quá trình dùng app):

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

Mở **Command Prompt thứ hai** và chạy (giữ cửa sổ này mở):

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

Mở trình duyệt (Chrome/Edge) và truy cập:
```
http://localhost:5173
```

---

> ⚠️ **Lưu ý quan trọng:**
> - MySQL Service phải đang chạy (tự động sau khi cài)
> - Cả hai cửa sổ Command Prompt (Bước 7 và Bước 8) phải luôn mở
> - **Từ lần sau:** chỉ cần chạy lại Bước 7 và Bước 8

---

## Tester / BA Setup Guide (English)

> **Steps 1–6 are done ONE TIME ONLY.**
> From next time: open terminal → run Step 7 and Step 8 only.

---

### Step 1 — Install Node.js

1. Go to **https://nodejs.org/en/download**
2. Click **LTS** version → Download
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type the command below → should show a version number ✓
   ```
   node -v
   ```

---

### Step 2 — Install Git

1. Go to **https://git-scm.com/downloads**
2. Click **Download for Windows**
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type the command below → should show a version number ✓
   ```
   git --version
   ```

---

### Step 3 — Install MySQL Community Server

1. Go to **https://dev.mysql.com/downloads/mysql/**
2. Click **Download** under **MySQL Installer for Windows**
3. Choose the **mysql-installer-community** file (the larger one ~450MB)
4. Run the installer:
   - Select **Developer Default** → click **Next**
   - Click **Execute** to install → wait for completion
   - At **Accounts and Roles**: set **Root Password** to `root` (or your own — **write it down**)
   - Click **Next** until **Finish**
5. Verify: open **Command Prompt** → type the command below → should show a version number ✓
   ```
   mysql --version
   ```

> ⚠️ **Remember your MySQL root password** — you will need it in Step 5 and Step 6.

---

### Step 4 — Clone the Project

Open **Command Prompt** and run:

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\ILCMS
```

Wait until it finishes. The folder `C:\ILCMS` will be created.

---

### Step 5 — Configure Backend Environment

1. Open `C:\ILCMS\Backend` in **File Explorer**
2. Find the file named `.env` — open it with **Notepad**
3. Edit the `DB_PASSWORD` line to match your MySQL root password from Step 3:
   ```
   DB_PASSWORD=your_password_here
   ```
4. Save the file (**Ctrl + S**)

> If you cannot see `.env`, enable **Show hidden items** in File Explorer options.

---

### Step 6 — Install Dependencies & Import Database

Open **Command Prompt** and run each command in order:

**Install Backend dependencies:**
```bash
cd C:\ILCMS\Backend
npm install
```

**Install Frontend dependencies:**
```bash
cd C:\ILCMS\Frontend\vite-project
npm install
```

**Import the database:**
```bash
cd C:\ILCMS\Backend
mysql -u root -p < database/ilcms_db.sql
```
Enter your MySQL root password when prompted → press Enter.

No error messages = database imported successfully ✓

---

### Step 7 — Start the Backend

Open **Command Prompt** and run (keep this window open while using the app):

```bash
cd C:\ILCMS\Backend
npm run dev
```

You should see ✓
```
Server running on http://localhost:5000
```

---

### Step 8 — Start the Frontend

Open a **second Command Prompt** and run (keep this window open):

```bash
cd C:\ILCMS\Frontend\vite-project
npm run dev
```

You should see ✓
```
➜  Local: http://localhost:5173/
```

---

### Step 9 — Open the App

Open your browser (Chrome/Edge) and go to:
```
http://localhost:5173
```

---

> ⚠️ **Important:**
> - MySQL Service must be running (starts automatically after install)
> - Both Command Prompt windows (Steps 7 and 8) must stay open
> - **From next time:** just run Step 7 and Step 8 again

---

## Login Accounts / Tài khoản đăng nhập

| Role / Vai trò | Username | Password   |
|----------------|----------|------------|
| Admin          | `admin`  | `admin123` |
| Staff          | `staff`  | `staff123` |
| Sale           | `sale`   | `sale123`  |

---

## Project Structure

```
ILCMS/
├── Backend/                        ← Node.js + Express API
│   ├── config/
│   │   └── db.js                   ← MySQL connection pool
│   ├── controllers/                ← Business logic (auth, users)
│   ├── database/
│   │   ├── ilcms_db.sql            ← ✅ Full database export (import this)
│   │   ├── export.js               ← Re-export database anytime
│   │   ├── setup.js                ← Dev only: creates DB + tables
│   │   └── seed.js                 ← Dev only: seeds Admin account
│   ├── middleware/                 ← JWT auth, request validation
│   ├── routes/                     ← API route definitions
│   ├── .env                        ← Environment config (set DB_PASSWORD)
│   └── server.js                   ← App entry point
│
└── Frontend/
    └── vite-project/               ← React + Vite app
        └── src/
            ├── App.jsx             ← Routes and role-based access control
            ├── assets/             ← Logo images
            └── pages/
                ├── auth/           ← LoginPage (with Forgot Password)
                ├── admin/          ← AdminHomePage, ManageAccountPage
                ├── staff/          ← StaffHomePage
                └── saler/          ← SalerHomePage
```

---

## Troubleshooting / Xử lý lỗi

**`mysql` is not recognized / Không nhận lệnh mysql**
- MySQL was not added to PATH during install
- Fix: Search **"Edit the system environment variables"** → Environment Variables → Path → Add `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- Then restart Command Prompt and retry

**Error importing database / Lỗi khi import database**
- Make sure MySQL service is running: open **Services** (search in Start menu) → find **MySQL80** → Start
- Check your password in `.env` matches what you set during MySQL install

**`npm install` fails / thất bại**
- Verify Node.js is installed: type `node -v`
- Delete the `node_modules` folder and run `npm install` again

**Login shows "Invalid username or password" / Đăng nhập báo sai**
- Check the database was imported correctly (Step 6)
- Make sure the Backend window is still running (port 5000)

**Blank page / "Cannot GET /" / Trang trắng**
- Check the Frontend window is still running (port 5173)
- Go to `http://localhost:5173` — not `http://localhost:5000`

**Port already in use / Cổng đang bị chiếm**
- Close any other Node.js processes or restart your computer
- Run `netstat -ano | findstr :5000` to see what is using the port
