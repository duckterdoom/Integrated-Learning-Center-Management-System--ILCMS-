# ILCMS — Integrated Learning Center Management System

A web-based management platform for learning centers, supporting three user roles: **Admin**, **Staff**, and **Sale**. Built with React (Vite) on the frontend and Node.js (Express) on the backend, connected to a MySQL database.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Hướng dẫn cài đặt cho Tester (Tiếng Việt)](#hướng-dẫn-cài-đặt-cho-tester-tiếng-việt)
3. [Tester Setup Guide (English)](#tester-setup-guide-english)
4. [Developer Setup Guide](#developer-setup-guide)
5. [Login Accounts / Tài khoản đăng nhập](#login-accounts--tài-khoản-đăng-nhập)
6. [Project Structure](#project-structure)
7. [Troubleshooting / Xử lý lỗi](#troubleshooting--xử-lý-lỗi)

---

## Tech Stack

| Layer    | Technology           | Port |
|----------|----------------------|------|
| Frontend | React 19 + Vite      | 5173 |
| Backend  | Node.js + Express.js | 5000 |
| Database | MySQL (via Laragon)  | 3306 |

---

## Hướng dẫn cài đặt cho Tester (Tiếng Việt)

> Các bước 1–7 chỉ thực hiện **một lần duy nhất**.
> Từ lần sau: mở Laragon → Start All → chạy Bước 8 và 9 là xong.

---

### Bước 1 — Cài đặt Node.js

1. Truy cập https://nodejs.org/en/download
2. Chọn phiên bản **LTS** → Download
3. Chạy file cài đặt → bấm **Next** đến khi **Finish**
4. Kiểm tra: mở **Command Prompt** → gõ `node -v` → hiện số phiên bản là thành công ✓

---

### Bước 2 — Cài đặt Git

1. Truy cập https://git-scm.com/downloads
2. Bấm **Download for Windows**
3. Chạy file cài đặt → bấm **Next** đến khi **Finish**
4. Kiểm tra: mở **Command Prompt** → gõ `git --version` → hiện số phiên bản là thành công ✓

---

### Bước 3 — Cài đặt Laragon

> Laragon đã bao gồm MySQL bên trong — **không cần cài MySQL riêng**.

1. Truy cập https://laragon.org/download
2. Bấm **Download Laragon Full**
3. Chạy file cài đặt → bấm **Next** đến khi **Finish**
4. Laragon tự động mở sau khi cài xong

---

### Bước 4 — Khởi động Laragon

1. Mở **Laragon** từ màn hình Desktop hoặc Start menu
2. Bấm **Start All**
3. Chờ đến khi **MySQL** chuyển sang màu **xanh** ✓

```
Apache  ● Running
MySQL   ● Running  ← phải xanh mới tiếp tục
```

> Giữ Laragon chạy nền trong suốt quá trình sử dụng ứng dụng.

---

### Bước 5 — Tải source code về máy

Mở **Command Prompt** và chạy lệnh sau:

```bash
git clone https://github.com/duckterdoom/Integrated-Learning-Center-Management-System--ILCMS-.git C:\laragon\www\ILCMS
```

Chờ đến khi tải xong.

---

### Bước 6 — Import database

Trong cùng cửa sổ **Command Prompt**, chạy:

```bash
C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root < "C:\laragon\www\ILCMS\Backend\database\backup.sql"
```

Không có thông báo lỗi = import thành công ✓

> **Nếu thấy lỗi "The system cannot find the path":**
> Mở thư mục `C:\laragon\bin\mysql\` trong File Explorer,
> xem tên thư mục bên trong rồi thay `mysql-8.0.30-winx64`
> trong lệnh trên bằng tên thư mục đó.

---

### Bước 7 — Cài đặt thư viện

Chạy từng lệnh sau:

```bash
cd C:\laragon\www\ILCMS\Backend
npm install
```

```bash
cd C:\laragon\www\ILCMS\Frontend\vite-project
npm install
```

Chờ đến khi cả hai hoàn tất.

---

### Bước 8 — Khởi động Backend

Mở **Command Prompt** và chạy (giữ cửa sổ này mở):

```bash
cd C:\laragon\www\ILCMS\Backend
npm run dev
```

Thấy dòng này là thành công:
```
Server running on http://localhost:5000
```

---

### Bước 9 — Khởi động Frontend

Mở **Command Prompt thứ hai** và chạy (giữ cửa sổ này mở):

```bash
cd C:\laragon\www\ILCMS\Frontend\vite-project
npm run dev
```

Thấy dòng này là thành công:
```
➜  Local: http://localhost:5173/
```

---

### Bước 10 — Mở ứng dụng

Mở trình duyệt và truy cập:
```
http://localhost:5173
```

---

> ⚠️ **Lưu ý quan trọng:**
> - Laragon phải luôn chạy (MySQL xanh) trong khi dùng app
> - Cả hai cửa sổ Command Prompt (Bước 8 và 9) phải luôn mở
> - Từ lần sau: chỉ cần mở Laragon → Start All → chạy Bước 8 và 9

---

## Tester Setup Guide (English)

> Steps 1–7 are done **once only**.
> From next time: open Laragon → Start All → then run Steps 8 and 9 only.

---

### Step 1 — Install Node.js

1. Go to https://nodejs.org/en/download
2. Click **LTS** version → Download
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type `node -v` → should show a version number ✓

---

### Step 2 — Install Git

1. Go to https://git-scm.com/downloads
2. Click **Download for Windows**
3. Run the installer → click **Next** until **Finish**
4. Verify: open **Command Prompt** → type `git --version` → should show a version number ✓

---

### Step 3 — Install Laragon

> Laragon includes MySQL inside — **no need to install MySQL separately**.

1. Go to https://laragon.org/download
2. Click **Download Laragon Full**
3. Run the installer → click **Next** until **Finish**
4. Laragon opens automatically after install

---

### Step 4 — Start Laragon

1. Open **Laragon** from Desktop or Start menu
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

## Troubleshooting / Xử lý lỗi

**"The system cannot find the path" ở Bước 6 / Step 6**
- Mở `C:\laragon\bin\mysql\` → xem tên thư mục bên trong
- Thay `mysql-8.0.30-winx64` trong lệnh bằng tên thư mục đó

**Lỗi khi import database / Error when importing database**
- Kiểm tra Laragon đang chạy và MySQL đang xanh
- Thử lại lệnh import

**"npm install" thất bại / fails**
- Kiểm tra Node.js đã cài: gõ `node -v` trong terminal
- Xóa thư mục `node_modules` rồi chạy lại `npm install`

**Đăng nhập báo sai mật khẩu / Login shows "Invalid username or password"**
- Kiểm tra database đã import đúng chưa (Bước 6)
- Kiểm tra cửa sổ Backend vẫn đang chạy (port 5000)

**Trang trắng / "Cannot GET /"**
- Kiểm tra cửa sổ Frontend vẫn đang chạy (port 5173)
- Truy cập `http://localhost:5173` không phải `http://localhost:5000`

**Cổng đang bị chiếm / Port already in use**
- Tắt các tiến trình Node.js khác hoặc khởi động lại máy tính
