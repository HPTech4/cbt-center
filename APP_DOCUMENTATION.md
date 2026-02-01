# CBT Practice System - Complete App Documentation

This document provides a comprehensive overview of the entire application architecture, components, and data flow.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute.jsx    # Route protection wrapper
│   ├── QuestionCard.jsx      # Question display component
│   └── Timer.jsx             # Exam timer with persistence
├── contexts/            # Global state management
│   └── AuthContext.jsx       # Authentication context
├── pages/               # Page components (routes)
│   ├── Login.jsx             # Authentication page
│   ├── ExamSelect.jsx        # Select exam type
│   ├── SubjectSelect.jsx     # Select subject to practice
│   ├── Exam.jsx              # Main exam interface
│   ├── Result.jsx            # Show score and results
│   ├── Review.jsx            # Review exam with answers
│   └── AdminDashboard.jsx    # Admin management interface
├── services/            # API/Database services
│   └── supabaseClient.js     # Supabase database operations
├── App.jsx              # Main app with routing
├── main.jsx             # React DOM entry point
└── index.css            # Global styles
```

---

## 🏗️ Architecture Overview

### Authentication Flow

```
Login.jsx
  ↓ (credentials)
supabaseClient.signIn()
  ↓ (Supabase Auth + Profile)
AuthContext (global state)
  ↓ (user data)
ProtectedRoute (guards pages)
  ↓
ExamSelect / AdminDashboard
```

### Student Exam Flow

```
ExamSelect (choose exam type)
  ↓
SubjectSelect (choose subject)
  ↓
Exam (take exam)
  ↓ (answers saved to DB)
Result (show score)
  ↓
Review (study answers)
```

---

## 🔑 Core Components

### 1. **AuthContext.jsx** - Global Authentication

```javascript
// Provides: user, loading, setUser
// Features:
// - Session persistence check on app load
// - Listen for auth state changes
// - Restore user if previously logged in
```

**Key Functions:**

- `useAuth()` - Hook to access auth context
- `AuthProvider` - Wraps entire app

**Usage:**

```jsx
const { user, loading } = useAuth();
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

---

### 2. **ProtectedRoute.jsx** - Route Protection

```javascript
// Guards routes based on authentication and role
// - Not logged in → redirect to /login
// - Wrong role → redirect to appropriate dashboard
```

**Props:**

- `children` - Component to protect
- `requireRole` - Optional: 'admin' or 'student'

**Usage:**

```jsx
<Route
  path="/exam/:attemptId"
  element={
    <ProtectedRoute requireRole="student">
      <Exam />
    </ProtectedRoute>
  }
/>
```

---

### 3. **QuestionCard.jsx** - Question Display

```javascript
// Modes:
// 1. Exam mode - allows selecting answer
// 2. Review mode - shows correct/incorrect answers
```

**Props:**

- `question` - Question object with options
- `questionNumber` - For display
- `selectedOption` - Current answer (A/B/C/D)
- `onSelectOption` - Callback for selection
- `isReviewMode` - Boolean for mode
- `showCorrectAnswer` - Show correct/wrong highlighting

---

### 4. **Timer.jsx** - Exam Timer with Persistence

```javascript
// Features:
// - Countdown timer (1000ms intervals)
// - Database persistence every 5 seconds
// - Warning at < 5 minutes
// - Auto-submit when timer = 0
```

**Props:**

- `attemptId` - Attempt ID for DB persistence
- `initialSeconds` - Time limit in seconds
- `onTimeUp` - Callback when time expires

---

### 5. **supabaseClient.js** - Database Service Layer

Core functions organized by category:

#### Authentication (2 functions)

- `getCurrentUser()` - Get auth + profile data
- `signIn(email, password)` - Authenticate user
- `signOut()` - Logout user

#### Student Operations (8 functions)

- `getExams()` - Get all exam types
- `getSubjects(examId)` - Get subjects for exam
- `hasAttemptedSubject(userId, subjectId)` - Check if attempted
- `createAttempt(userId, subjectId)` - Start new exam
- `getAttemptWithQuestions(attemptId)` - Get exam questions
- `saveAnswer(attemptId, questionId, option)` - Save answer
- `updateTimeRemaining(attemptId, seconds)` - Persist timer
- `submitAttempt(attemptId)` - Submit exam and calculate score
- `getAttemptResult(attemptId)` - Get results for display

#### Admin Operations (7 functions)

- `createExam(name, description)` - Create new exam
- `createSubject(examId, name, timeLimitMinutes)` - Add subject
- `getAllSubjects()` - Get all subjects
- `createQuestions(questions)` - Upload questions in bulk
- `getQuestionsBySubject(subjectId)` - Get subject questions
- `getAllAttempts()` - Get all student attempts
- `deleteQuestion(questionId)` - Delete question
- `updateQuestion(questionId, updates)` - Edit question

---

## 📄 Page Components

### **Login.jsx**

- Entry point for authentication
- Email + password form
- Redirects to /admin or /exams based on role
- No registration or password reset

### **ExamSelect.jsx** (Student)

- Shows grid of exam types
- Displays exam name and description
- Navigates to subject selection on click
- Logout button in header

### **SubjectSelect.jsx** (Student)

- Shows all subjects for selected exam
- Displays time limit for each subject
- Prevents re-attempting same subject
- Back button to exam selection

### **Exam.jsx** (Student)

- Main exam interface
- Question display with timer
- Navigation between questions
- Real-time answer persistence
- Auto-submit on time up
- Progress indicator

**Key Features:**

```javascript
// Load exam
useEffect(() => loadExam(), [attemptId]);

// Handle answer selection
const handleSelectOption = async (option) => {
  // Update local state
  setAnswers((prev) => ({ ...prev, [questionId]: option }));
  // Save to database
  await saveAnswer(attemptId, questionId, option);
};

// Auto-submit on timer end
const handleTimeUp = useCallback(async () => {
  await handleSubmitExam(true);
}, []);
```

### **Result.jsx** (Student)

- Shows score and percentage
- Displays grade (Excellent/Good/Fair/Needs Improvement)
- Shows correct vs incorrect count
- Button to view review

**Grading:**

- 75%+ = Excellent (green)
- 60-75% = Good (blue)
- 50-60% = Fair (yellow)
- <50% = Needs Improvement (red)

### **Review.jsx** (Student)

- Shows all questions in read-only mode
- Correct answers highlighted in green
- Wrong answers highlighted in red
- Shows explanations
- Filter by correct/incorrect/all

### **AdminDashboard.jsx** (Admin)

- Tabbed interface: Exams | Subjects | Questions | Results
- Create new exams
- Create new subjects
- Bulk upload questions with parser
- Edit/delete questions
- View all student attempts with scores

**Question Upload Format:**

```
Q: What is 2+2?
A) 3
B) 4
C) 5
D) 6
ANSWER: B
EXPLANATION: Basic arithmetic

Q: Next question?
A) Option A
...
```

---

## 🔄 Data Flow Examples

### Taking an Exam

1. Student selects exam → ExamSelect
2. Student selects subject → SubjectSelect
3. `createAttempt()` creates attempt with 40 random questions
4. Student enters exam page → Exam loads questions
5. Each answer → `saveAnswer()` to database
6. Timer counts down → `updateTimeRemaining()` persists time
7. Time = 0 or student clicks submit → `submitAttempt()` calculates score
8. Redirect to Result page
9. Can click "Review" → Review page shows all answers

### Question Upload Process

1. Admin fills upload modal with question text
2. `parseQuestionsText()` parses formatted text
3. Validates all questions have 4 options + answer
4. `createQuestions()` inserts into database
5. Shows success count

---

## 🗄️ Database Schema (Key Tables)

### users

```
id (UUID, PK)
full_name (TEXT)
role (TEXT) - 'student' or 'admin'
created_at (TIMESTAMP)
```

### exams

```
id (UUID, PK)
name (TEXT) - "WAEC", "NECO", "JAMB"
description (TEXT)
```

### subjects

```
id (UUID, PK)
exam_id (UUID, FK → exams)
name (TEXT) - "English", "Mathematics", etc.
time_limit_minutes (INTEGER)
```

### questions

```
id (UUID, PK)
subject_id (UUID, FK → subjects)
question_text (TEXT)
option_a, option_b, option_c, option_d (TEXT)
correct_option (TEXT) - 'A', 'B', 'C', or 'D'
explanation (TEXT)
```

### attempts

```
id (UUID, PK)
user_id (UUID, FK → users)
subject_id (UUID, FK → subjects)
score (INTEGER) - number correct
total_questions (INTEGER) - always 40
time_remaining_seconds (INTEGER)
started_at (TIMESTAMP)
submitted_at (TIMESTAMP)
```

### answers

```
id (UUID, PK)
attempt_id (UUID, FK → attempts)
question_id (UUID, FK → questions)
selected_option (TEXT) - 'A', 'B', 'C', 'D', or null
is_correct (BOOLEAN)
```

### attempt_questions

```
id (UUID, PK)
attempt_id (UUID, FK → attempts)
question_id (UUID, FK → questions)
question_order (INTEGER) - 1-40
```

---

## 🔐 Security Features

### Row Level Security (RLS)

- Students can only see their own attempts
- Students cannot see answers until submission
- Admins have full access

### Authentication

- Email + password via Supabase Auth
- Session management with auth context
- Protected routes with role verification

---

## 🎯 Key Workflows

### Flow 1: Student Login & Practice

```
1. User goes to /login
2. Enters email/password
3. signIn() validates credentials
4. Auth context updated with user + role
5. If admin → redirect /admin
6. If student → redirect /exams (ExamSelect)
7. Select exam → go to /subjects/:examId
8. Select subject → createAttempt() → go to /exam/:attemptId
9. Take exam with questions displayed
10. Submit or timeout → go to /result/:attemptId
11. Can review → go to /review/:attemptId
```

### Flow 2: Admin Creates Content

```
1. Admin login → /admin dashboard
2. Click "Add Exam" → create exam
3. Click "Add Subject" → create subject under exam
4. Click "Upload Questions" → paste formatted questions
5. Parser validates format
6. Questions inserted into database
7. Available for student practice
```

---

## 🚀 Environment Setup

### Required Environment Variables (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
# Runs on http://localhost:3000
```

### Build

```bash
npm run build
# Creates optimized production build
```

---

## 📝 Common Tasks

### Add a New Page

1. Create file in `src/pages/PageName.jsx`
2. Add route in `App.jsx`
3. Wrap with `<ProtectedRoute>` if needed

### Add a New Feature to Exam

1. Create component in `src/components/`
2. Import in Exam.jsx
3. Add to exam UI

### Add Database Query

1. Add function to `src/services/supabaseClient.js`
2. Organized by category
3. Include JSDoc comments
4. Throw errors for handling

---

## 🐛 Troubleshooting

### "Failed to load exams"

- Check .env credentials
- Verify schema was executed
- Check Supabase logs

### "Not enough questions"

- Need minimum 40 questions per subject
- Check question format in upload

### Timer not persisting

- Check network connection
- Verify updateTimeRemaining() database permissions

### Cannot login

- Verify user exists in Auth
- Verify user profile in users table
- Check correct password

---

## 📚 Tech Stack

- **Frontend:** React 18, Vite
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM

---

## ✅ Development Checklist

- [x] Authentication system
- [x] Role-based access control
- [x] Student exam flow
- [x] Timer with persistence
- [x] Real-time answer saving
- [x] Auto-submit on time
- [x] Results calculation
- [x] Review with explanations
- [x] Admin dashboard
- [x] Question management
- [x] Bulk question upload
- [x] Row level security

---

## 📞 Support

Refer to README.md for deployment and setup instructions.
