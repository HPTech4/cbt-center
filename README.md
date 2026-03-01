# 🎓 CBT Practice System — Full-Stack Exam Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A production-ready **Computer-Based Testing (CBT)** platform engineered for high-stakes exam preparation (WAEC, NECO, JAMB). This application features a robust administrative dashboard, real-time exam simulation, and automated pedagogical feedback.

---

## 🚀 Key Features

### 🧑‍🎓 Student Dashboard
- **Live Exam Simulation:** Countdown timer with **state persistence** to prevent data loss on browser refresh.
- **Smart Question Engine:** Dynamic randomization of 40 questions per subject attempt.
- **Immediate Analytics:** Instant score calculation and performance metrics post-submission.
- **Review System:** Detailed review mode showing correct answers, user choices, and academic explanations.
- **Auto-Submit:** Intelligent logic to finalize and grade exams exactly when time expires.

### 🔐 Administrative Suite
- **Role-Based Access Control (RBAC):** Secure separation between Student and Admin privileges.
- **Content Management:** Full CRUD suite for managing Exams, Subjects, and Question Banks.
- **Bulk Data Ingestion:** Custom-built text parser for rapid bulk question uploads (100+ questions in seconds).
- **Result Monitoring:** Centralized view of all student attempts and historical performance.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Hooks, Functional Components) |
| **State/Routing** | React Router DOM |
| **Styling** | Tailwind CSS (Mobile-first responsive design) |
| **Backend/DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (JWT-based) |
| **Icons** | Lucide React |

---

## 📂 System Architecture (Database Schema)

The database is built on a relational PostgreSQL foundation with Row Level Security (RLS) enabled for data integrity.



- **`users`**: Profiles linked to Supabase Auth (Roles: `admin`, `student`).
- **`exams`**: Top-level categories (JAMB, WAEC, etc.).
- **`subjects`**: Linked to exams with specific `time_limit` constraints.
- **`questions`**: Normalized question bank with options and explanations.
- **`attempts`**: Tracks user scores, timestamps, and completion status.

---

## 📦 Installation & Setup

### 1. Clone & Install
```bash
git clone [https://github.com/HPTech4/cbt-practice-system.git](https://github.com/HPTech4/cbt-practice-system.git)
cd cbt-practice-system
npm install
2. Database Configuration
Create a project at Supabase.

Go to the SQL Editor and run the contents of supabase-schema.sql.

Copy your Project URL and Anon/Public Key.

3. Environment Variables
Create a .env file in the root directory:

Code snippet
VITE_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key-here
4. Launch
Bash
npm run dev
📝 Bulk Upload Syntax
Admins can batch-upload questions using this specific format:

Plaintext
Q: What is the primary function of a React Hook?
A) To manage state and lifecycle in functional components
B) To style the DOM
C) To handle database migrations
D) To compile JavaScript to C++
ANSWER: A
EXPLANATION: Hooks allow you to use state and other features without writing a class.
🛡️ Security & Performance
RLS Policies: Students can only read their own attempts; Admins have full schema access.

Optimized Loading: Vite-powered HMR and lazy-loading for heavy dashboards.

Data Persistence: Local storage syncing for active exam sessions.

📄 License
Distributed under the MIT License. See LICENSE for more information.

🤝 Contact
ALIMI Opeyemi Azeez

LinkedIn: alimi-azeez-opeyemi

GitHub: HPTech4

Email: alimiazeez4@gmail.com

Created for educational excellence and high-performance exam preparation.

