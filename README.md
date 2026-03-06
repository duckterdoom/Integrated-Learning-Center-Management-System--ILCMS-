# Integrated Campus Learning Management System (ICLMS)

## 📖 Project Description

The Integrated Campus Learning Management System (ICLMS) is a comprehensive, full-stack educational platform designed to streamline teaching, learning, and administrative processes within an institution. The system centralizes operations and enhances communication among administrators, instructors, students, and parents, ultimately increasing stakeholder satisfaction and the institution's reputation.

## 🌟 Key Features

*   **Centralized Database Management:** Securely store and manage all institutional data in one place.
*   **Role-Based Dashboards:** Customized interfaces and tools tailored to the specific needs of different user roles.
*   **Academic Management:** Course creation, enrollment, grading, and attendance tracking.
*   **Reporting & Analytics:** Generate accurate reports on student performance, class operations, and financial metrics.
*   **Cross-Functional Support:** Dedicated modules for Customer Support, Teaching Department, and Student Care Teams to manage their respective duties efficiently.
*   **Scalable Architecture:** Built with modern full-stack technologies (Spring Boot & Next.js/React) to accommodate growing user bases.

## 👥 User Base (Roles)

The system supports multiple distinct user roles, each with specific permissions and workflows:

1.  **Administrators:** Manage global system settings, user accounts, roles, and access institution-wide reports.
2.  **Instructors / Teaching Department:** Manage courses, upload materials, grade assignments, track attendance, and interact with students.
3.  **Students:** Access course materials, submit assignments, view grades, and monitor their learning progress.
4.  **Parents:** Monitor their children's academic performance, attendance, and communicate with the Student Care Team.
5.  **Support Staff (Customer Support / Student Care):** Handle inquiries, resolve issues, and provide assistance to students and parents.

---

## 🚀 Setup & Installation Guide

This project uses a decoupled architecture with a **Java Spring Boot Backend** and a **Next.js (React) Frontend**.

### Prerequisites
Before starting, ensure you have the following installed on your machine:
*   [Java Development Kit (JDK) 17+](https://adoptium.net/)
*   [Node.js (v18+) & npm](https://nodejs.org/)
*   [MySQL Server](https://dev.mysql.com/downloads/mysql/) (or XAMPP)
*   Git

### Part 1: Setting up the Spring Boot Backend

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone <repository_url>
    cd ICLMS/backend
    ```

2.  **Configure the Database:**
    *   Open your MySQL testing tool (e.g., MySQL Workbench, DBeaver) or XAMPP phpMyAdmin.
    *   Create a new database named `iclms_db`.
    *   Update the `src/main/resources/application.properties` file with your MySQL credentials:
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/iclms_db
        spring.datasource.username=root
        spring.datasource.password=your_password
        spring.jpa.hibernate.ddl-auto=update
        ```

3.  **Run the Backend Server:**
    *   Open a terminal in the `backend` directory.
    *   Run the application using Maven Wrapper:
        ```bash
        # On Windows:
        mvnw.cmd spring-boot:run
        # On Mac/Linux:
        ./mvnw spring-boot:run
        ```
    *   The backend server will start on `http://localhost:8080`.

### Part 2: Setting up the Next.js Frontend

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd ICLMS/frontend
    ```

2.  **Install Node Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env.local` file in the root of the `frontend` directory.
    *   Add the backend API URL:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:8080/api
        ```

4.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    *   The frontend server will start on `http://localhost:3000`.

