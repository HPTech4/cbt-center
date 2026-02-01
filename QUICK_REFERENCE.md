# Quick Reference & Code Comments Guide

## 🎯 Quick Navigation

### Find specific functionality by topic:

| Topic                  | File                                                          | Lines                |
| ---------------------- | ------------------------------------------------------------- | -------------------- |
| Authentication login   | `src/pages/Login.jsx`                                         | Full file            |
| Auth state management  | `src/contexts/AuthContext.jsx`                                | Full file            |
| Route protection       | `src/components/ProtectedRoute.jsx`                           | Full file            |
| Database operations    | `src/services/supabaseClient.js`                              | Organized by section |
| Main routing           | `src/App.jsx`                                                 | Lines 10-55          |
| Exam questions display | `src/components/QuestionCard.jsx`                             | Full file            |
| Countdown timer        | `src/components/Timer.jsx`                                    | Full file            |
| Student workflow       | `src/pages/ExamSelect.jsx` + `SubjectSelect.jsx` + `Exam.jsx` | -                    |
| Results page           | `src/pages/Result.jsx`                                        | Full file            |
| Review answers         | `src/pages/Review.jsx`                                        | Full file            |
| Admin panel            | `src/pages/AdminDashboard.jsx`                                | Full file            |

---

## 📍 Key File Locations & Purposes

### Core Application Files

**src/main.jsx** (13 lines)

```
Purpose: React DOM entry point
What it does: Mounts App component to #root element
When to modify: Almost never - this is standard React setup
```

**src/App.jsx** (65 lines)

```
Purpose: Main routing and app structure
What it does:
  - Sets up React Router with all routes
  - Wraps app with AuthProvider context
  - Routes are protected with ProtectedRoute component
When to modify: Add new routes, change route structure
```

**src/index.css** (Styles)

```
Purpose: Global CSS utilities and styling
What it does: Tailwind CSS setup, custom CSS classes
When to modify: Add custom styles or utility classes
```

### Authentication & Context

**src/contexts/AuthContext.jsx** (70 lines)

```
Purpose: Global authentication state management
Provides: { user, loading, setUser }
Key hook: useAuth() - use in any component to access auth

Usage example:
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" />
```

**src/components/ProtectedRoute.jsx** (45 lines)

```
Purpose: Route-level access control
Features:
  - Checks if user authenticated
  - Checks if user has required role
  - Redirects unauthorized users

Usage:
  <Route path="/admin" element={
    <ProtectedRoute requireRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } />
```

### Database & Services

**src/services/supabaseClient.js** (475 lines)

```
Purpose: All database operations and API calls
Organization:
  1. Client initialization (lines 1-10)
  2. Auth functions (lines 15-60)
  3. Student operations (lines 65-250)
  4. Admin operations (lines 255-475)

Key sections with most common functions:
  - getExams() - fetch all exams
  - getSubjects(examId) - fetch subjects
  - createAttempt() - start new exam
  - saveAnswer() - persist answer
  - submitAttempt() - complete exam
  - getAttemptResult() - get results
```

### Components

**src/components/QuestionCard.jsx** (105 lines)

```
Purpose: Reusable question display component
Props:
  - question: Question object
  - questionNumber: Display number
  - selectedOption: Current answer
  - onSelectOption: Click handler
  - isReviewMode: Boolean
  - showCorrectAnswer: Boolean

Handles two modes:
  1. Exam: Clickable, selectable
  2. Review: Read-only, shows correct/incorrect
```

**src/components/Timer.jsx** (85 lines)

```
Purpose: Countdown timer with database persistence
Features:
  - Counts from initialSeconds to 0
  - Saves to database every 5 seconds
  - Shows warning at < 5 minutes
  - Triggers callback at 0

Props:
  - attemptId: For database persistence
  - initialSeconds: Time limit
  - onTimeUp: Callback
```

### Student Pages

**src/pages/Login.jsx** (165 lines)

```
Purpose: Authentication entry point
Flow:
  1. Input email/password
  2. Call signIn() service
  3. Update auth context
  4. Redirect based on role

Error handling: Shows generic "Invalid credentials" message
```

**src/pages/ExamSelect.jsx** (175 lines)

```
Purpose: Choose exam type (WAEC/NECO/JAMB)
Flow:
  1. Load all exams on mount
  2. Display as grid of cards
  3. On click → navigate to /subjects/:examId

Header shows: Welcome message, Logout button
```

**src/pages/SubjectSelect.jsx** (195 lines)

```
Purpose: Choose subject to practice
Features:
  - Shows subjects for selected exam
  - Displays time limit badge
  - Prevents re-taking (one attempt per session)
  - Creates attempt on start

Key function: hasAttemptedSubject() prevents duplicates
```

**src/pages/Exam.jsx** (300+ lines)

```
Purpose: Main exam taking interface
Key features:
  1. Load 40 random questions
  2. Navigate between questions
  3. Select and save answers in real-time
  4. Timer counts down (auto-submit on 0)
  5. Show progress (X/40 answered)

Data flow:
  - Questions load in order
  - Each selection saved to database
  - Timer persisted every 5 seconds
  - Submit calculates score and redirects
```

**src/pages/Result.jsx** (190 lines)

```
Purpose: Show exam results immediately
Displays:
  - Score percentage (0-100%)
  - Grade (Excellent/Good/Fair/Needs Improvement)
  - Breakdown (correct/wrong/unanswered)
  - Time taken

Functions:
  - getPercentage() → Math.round(score/40 * 100)
  - getGrade() → Grade based on percentage ranges
```

**src/pages/Review.jsx** (200 lines)

```
Purpose: Study exam answers in detail
Features:
  - Shows all 40 questions
  - Correct answers (green highlight)
  - Wrong answers (red highlight)
  - Explanations below each question
  - Filter by correct/incorrect/all

Read-only mode - no selection possible
```

### Admin Pages

**src/pages/AdminDashboard.jsx** (900 lines)

```
Purpose: Complete admin interface
Tabs:
  1. Exams - Create/manage exam types
  2. Subjects - Create/manage subjects
  3. Questions - Upload/edit/delete questions
  4. Results - View all student attempts

Key functions:
  - parseQuestionsText() - Parse uploaded questions
  - handleUploadQuestions() - Bulk import
  - handleDeleteQuestion() - Remove question
  - handleUpdateQuestion() - Edit question
```

---

## 🔄 Data Flow Diagrams

### User Authentication Flow

```
User Input (email/password)
    ↓
Login.jsx handleSubmit()
    ↓
signIn(email, password) [supabaseClient.js]
    ↓
Supabase Auth Validation
    ↓
Fetch user profile from DB
    ↓
setUser() in AuthContext
    ↓
Navigate based on role
    ↓
ExamSelect (student) or AdminDashboard (admin)
```

### Exam Taking Flow

```
Click Subject in SubjectSelect
    ↓
createAttempt(userId, subjectId) [supabaseClient.js]
    ↓
Select 40 random questions from database
    ↓
Create attempt record with 40 attempt_questions
    ↓
Navigate to Exam page with attemptId
    ↓
Exam.jsx loads attempt + questions
    ↓
User selects answer
    ↓
saveAnswer() saves to database immediately
    ↓
User navigates between questions (1-40)
    ↓
Timer counts down (displayed via Timer component)
    ↓
Either user clicks Submit OR timer reaches 0
    ↓
submitAttempt() called
    ↓
Mark all answers correct/incorrect
    ↓
Calculate score
    ↓
Set submitted_at timestamp
    ↓
Navigate to Result page
    ↓
Display score and options
```

### Admin Upload Flow

```
Admin clicks "Upload Questions"
    ↓
AdminDashboard shows upload modal
    ↓
Admin pastes formatted questions (plain text)
    ↓
Clicks Upload
    ↓
parseQuestionsText() parses text into objects
    ↓
Validates format (4 options, answer, etc.)
    ↓
createQuestions() inserts into database
    ↓
Success message with count
    ↓
Immediately available for students
```

---

## 💡 Common Code Patterns

### Pattern 1: Load Data on Mount

```javascript
// In any page component
useEffect(() => {
  loadData();
}, []); // Empty dependency = run once on mount

const loadData = async () => {
  setLoading(true);
  try {
    const data = await supabaseService.getData();
    setData(data);
  } catch (err) {
    setError("Failed to load");
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Protected Route

```javascript
// In App.jsx routing
<Route
  path="/admin"
  element={
    <ProtectedRoute requireRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Pattern 3: Form Submission

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await service.create(formData);
    setSuccess("Created successfully");
  } catch (err) {
    setError(err.message || "Failed");
  } finally {
    setLoading(false);
  }
};
```

### Pattern 4: Real-time Save

```javascript
// Save to DB but don't block UI
const handleChange = (value) => {
  // Update local state immediately
  setLocalState(value);

  // Save to DB in background
  service.save(value).catch((err) => {
    console.error("Save failed:", err);
    // Local state still has value
  });
};
```

---

## 🚀 Starting Development

### First time setup:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add Supabase credentials
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

### Making changes:

```bash
# 1. Edit a component file (auto-refresh)
# 2. Browser automatically reloads
# 3. Check console for errors
# 4. Test the feature
```

### Before committing:

```bash
# Run build (catches errors)
npm run build

# No errors? Good to commit!
```

---

## 🔍 Debugging Tips

### Common Issues & Solutions

**"Failed to load exams" error**

```
1. Check browser console for exact error
2. Verify .env has correct Supabase URL
3. Verify ANON_KEY is correct
4. Check Supabase logs for database errors
5. Verify schema was executed (tables exist)
```

**Login fails**

```
1. Check user exists in Supabase Auth
2. Check user profile exists in users table
3. Verify password is correct
4. Check browser console for error details
```

**Answers not saving**

```
1. Check network tab for failed requests
2. Verify saveAnswer() is being called
3. Check Supabase logs for permission errors
4. Verify RLS policies allow saving
```

**Timer issues**

```
1. Check updateTimeRemaining() is called
2. Verify browser allows timers
3. Check database connection is stable
4. Reload page to reset
```

### Debugging Techniques

**Console Logging:**

```javascript
// Log before DB call
console.log("Saving answer:", { attemptId, questionId, option });

// Log response
console.log("Save response:", data);

// Log errors
console.error("Save failed:", error);
```

**React DevTools:**

```
1. Install React DevTools extension
2. Open DevTools → Components tab
3. Select component to inspect
4. View props and state
5. Modify state to test
```

**Network Tab:**

```
1. Open DevTools → Network tab
2. Perform action
3. See API calls to Supabase
4. Check response status and data
5. Identify failed requests
```

---

## 📚 Documentation Files

After commenting, you'll have:

1. **README.md** - Setup and installation guide
2. **APP_DOCUMENTATION.md** - Full app architecture (NEW)
3. **PAGES_DETAILED_COMMENTS.md** - Page-by-page breakdown (NEW)
4. **This file** - Quick reference guide
5. **Code comments** - In every file

Start with this quick reference, then dive into specific files as needed!

---

## ✨ Code Style Conventions

### File Organization

```javascript
// 1. Imports (React, libraries)
import React, { useState, useEffect } from "react";

// 2. Component definition
export default function ComponentName() {
  // 3. State declarations
  const [state, setState] = useState(initial);

  // 4. Helper functions
  const helperFunction = () => {};

  // 5. Effects
  useEffect(() => {}, []);

  // 6. Render/return
  return <div>...</div>;
}
```

### Naming Conventions

```
Components:      PascalCase (ExamSelect.jsx)
Functions:       camelCase (handleSubmit, loadExams)
Variables:       camelCase (examId, isLoading)
Constants:       UPPER_SNAKE_CASE (MAX_QUESTIONS = 40)
Files:           PascalCase for components, lowercase for other files
Boolean props:   isSomething, hasFeature, canAccess
Event handlers:  handleEventName (handleClick, handleSubmit)
```

### JSDoc Comments

```javascript
/**
 * Function description
 * @param {type} paramName - Description
 * @returns {type} Description
 * @throws {type} When this error occurs
 */
```

---

## 🎓 Learning Path

**Start with:**

1. This quick reference
2. README.md for setup

**Then explore:**

1. src/App.jsx - See routing structure
2. src/pages/Login.jsx - Understand auth flow
3. src/contexts/AuthContext.jsx - See state management

**Then tackle:**

1. src/pages/ExamSelect.jsx - Student flow
2. src/pages/Exam.jsx - Core exam logic
3. src/services/supabaseClient.js - Database layer

**Advanced topics:**

1. src/pages/AdminDashboard.jsx - Complex state
2. Performance optimization
3. Error handling patterns

---

## 📞 Support Files

- **APP_DOCUMENTATION.md** - For architecture questions
- **PAGES_DETAILED_COMMENTS.md** - For page logic
- **This file** - For quick lookups
- **Code comments** - In the actual files

Happy coding! 🚀
