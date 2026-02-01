# Page Components - Detailed Documentation

## SubjectSelect.jsx

**Purpose:** Second step in exam flow. Allows students to select which subject to practice for a specific exam.

**Key Props:** `examId` from URL params

**State Management:**

```javascript
subjects[]              // All subjects for this exam
attemptedSubjects Set() // Subjects already taken by user
loading boolean         // Loading state
startingAttempt string  // ID of subject being started
error string           // Error messages
```

**Key Functions:**

### loadSubjects()

```javascript
// 1. Fetch all subjects for this exam
const data = await getSubjects(examId);

// 2. Check which subjects user has already attempted
for (const subject of data) {
  const hasAttempted = await hasAttemptedSubject(user.id, subject.id);
  if (hasAttempted) {
    attempted.add(subject.id); // Mark as attempted
  }
}

// 3. Prevents re-taking same subject in same session
```

### handleStartExam(subjectId, subjectName)

```javascript
// 1. Prevent start if already attempted
if (attemptedSubjects.has(subjectId)) return;

// 2. Create new attempt with 40 random questions
const attempt = await createAttempt(user.id, subjectId);

// 3. Navigate to exam page
navigate(`/exam/${attempt.id}`);
```

**UI Features:**

- Subject cards with time limit badges
- "Already Attempted" label on disabled subjects
- Loading spinner while creating attempt
- Back button to return to exam selection
- Responsive grid layout

---

## Exam.jsx

**Purpose:** Main exam interface where students answer 40 questions.

**Critical State:**

```javascript
attempt object              // Exam metadata
questions[]                 // Array of 40 questions
currentQuestionIndex number // Which question showing
answers {}                  // Map of questionId → selected option
showSubmitConfirm boolean   // Confirmation dialog
```

**Key Features:**

### 1. Question Selection

```javascript
const handleSelectOption = async (option) => {
  // Update local state immediately (instant feedback)
  setAnswers((prev) => ({ ...prev, [questionId]: option }));

  // Save to database in background (doesn't block UI)
  await saveAnswer(attemptId, questionId, option);
};
```

### 2. Question Navigation

```javascript
// Previous / Next buttons move between 40 questions
handlePreviousQuestion(); // Decrement index
handleNextQuestion(); // Increment index
handleQuestionNavigate(); // Jump to specific question
```

### 3. Timer Integration

```javascript
const handleTimeUp = useCallback(async () => {
  // When timer reaches 0, auto-submit
  await handleSubmitExam(true);
}, []);
```

### 4. Submit Logic

```javascript
const handleSubmitExam = async (autoSubmit = false) => {
  // 1. Call database function to:
  //    - Mark all answers as correct/incorrect
  //    - Calculate score
  //    - Set submitted_at timestamp
  await submitAttempt(attemptId);

  // 2. Navigate to results page
  navigate(`/result/${attemptId}`);
};
```

**UI Layout:**

```
┌─ Header (Title, Question X/40, Timer, Answered Count) ─┐
│                                                          │
│  ┌──────────────────┬───────────────────────────────┐  │
│  │                  │                               │  │
│  │   Questions      │   Question Card               │  │
│  │   Navigator      │   - Question text             │  │
│  │   (1-40)         │   - 4 Options with selection  │  │
│  │   ┌──┬──┬──┐    │   - Navigation buttons        │  │
│  │   │▌ │░░│░░│    │   - Submit confirmation       │  │
│  │   └──┴──┴──┘    │                               │  │
│  │                  │   [Previous] [Next]           │  │
│  │                  │   [Submit Exam]               │  │
│  │                  │                               │  │
│  └──────────────────┴───────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Answer Persistence:**

- Local state updates immediately for UX
- Database saves in background
- If page refreshes, answers still there
- Timer seconds also persisted every 5 seconds

---

## Result.jsx

**Purpose:** Display exam results immediately after submission.

**Data Fetched:**

```javascript
attempt {
  score: number,           // Number correct (0-40)
  total_questions: 40,
  submitted_at: timestamp,
  subjects: { name }       // Subject name
}

questions[]               // All 40 questions with answers
```

**Key Calculations:**

### Score Percentage

```javascript
const getPercentage = () => {
  return Math.round((result.attempt.score / 40) * 100);
};
// Example: 28 correct = 28/40 = 0.7 = 70%
```

### Grade Assignment

```javascript
const getGrade = () => {
  const percentage = getPercentage();
  if (percentage >= 75) return { grade: "Excellent", color: "green" };
  if (percentage >= 60) return { grade: "Good", color: "blue" };
  if (percentage >= 50) return { grade: "Fair", color: "yellow" };
  return { grade: "Needs Improvement", color: "red" };
};
```

**UI Components:**

- Large animated trophy icon
- Score circle (70% example)
- Grade badge with color
- Score breakdown (28/40 correct)
- Time taken display
- Statistics cards:
  - ✓ Correct answers
  - ✗ Wrong answers
  - ⊘ Unanswered
- Navigation buttons:
  - Review (view all answers)
  - Try Another Subject (back to subject select)
  - Back to Exams

---

## Review.jsx

**Purpose:** Review exam answers with correct/incorrect highlighting and explanations.

**States:**

```javascript
result {                    // Full attempt result
  attempt { score, ... },
  questions[{...}]         // With correct_option and is_correct
}

filter string              // 'all' | 'correct' | 'incorrect'
```

**Filtering:**

```javascript
const getFilteredQuestions = () => {
  switch (filter) {
    case "correct":
      return result.questions.filter((q) => q.is_correct);
    case "incorrect":
      // Show wrong answers (excluding unanswered)
      return result.questions.filter((q) => !q.is_correct && q.selected_option);
    default:
      return result.questions; // All 40
  }
};
```

**UI Features:**

### Filter Tabs

```
[All 40] [Correct 28] [Incorrect 12]
```

### Color Coding

```
Correct option:       Green border + green background
Your wrong answer:    Red border + red background
Unanswered:          Gray (not shown in review)
Explanation:         Blue info box below question
```

**Question Card Differences from Exam Mode:**

```javascript
// Exam Mode
<QuestionCard
  isReviewMode={false}
  onSelectOption={handleSelectOption}
/>

// Review Mode
<QuestionCard
  isReviewMode={true}          // Disables clicking
  showCorrectAnswer={true}      // Shows correct option
  // Plus display of explanation
/>
```

**Navigation:**

- Back arrow to result page
- Filter buttons
- Question numbers indicating answered/unanswered
- Back to exams button

---

## AdminDashboard.jsx

**Purpose:** Admin interface for managing exams, subjects, questions, and viewing results.

**State Organization:**

```javascript
activeTab string           // 'exams' | 'subjects' | 'questions' | 'results'

// Data states
exams[]                   // All exams
subjects[]                // All subjects
attempts[]                // All student attempts
selectedSubject string    // For question management
subjectQuestions[]        // Questions for selected subject

// Modal states
showExamModal boolean
showSubjectModal boolean
showQuestionUploadModal boolean
showEditQuestionModal boolean
editingQuestion object

// Form states
examForm { name, description }
subjectForm { examId, name, timeLimitMinutes }
questionUploadForm { subjectId, questionsText }
```

**Tab 1: Exams Management**

```javascript
// Create Exam
handleCreateExam(e) {
  await createExam(examForm.name, examForm.description)
  // Shows in list
}

// Display
// - Exam name
// - Description
// - Subject count
// - Edit/Delete buttons
```

**Tab 2: Subjects Management**

```javascript
// Create Subject
handleCreateSubject(e) {
  await createSubject(
    subjectForm.examId,
    subjectForm.name,
    subjectForm.timeLimitMinutes
  )
}

// Display
// - Subject name
// - Parent exam
// - Time limit
// - Question count
```

**Tab 3: Questions Management**

```javascript
// Upload Questions
handleUploadQuestions(e) {
  const questions = parseQuestionsText(questionUploadForm.questionsText)
  // Validates format
  // Inserts with subject_id
}

// Question Parser
const parseQuestionsText = (text) => {
  // Input format:
  // Q: Question?
  // A) Option A
  // B) Option B
  // C) Option C
  // D) Option D
  // ANSWER: B
  // EXPLANATION: Why B

  // Output: Array of validated question objects
}

// Edit Question
handleEditQuestion(question) {
  // Open modal with form pre-filled
  // Save changes with updateQuestion()
}

// Delete Question
handleDeleteQuestion(questionId) {
  // Confirm, then call deleteQuestion()
}
```

**Tab 4: Results Viewing**

```javascript
// Display all student attempts
attempts[] = {
  user_id,
  user { full_name },
  subject_id,
  subject { name, exam { name } },
  score,
  total_questions,
  submitted_at,
  percentage calculated
}

// Sortable table with:
// - Student name
// - Exam type
// - Subject
// - Score/Percentage
// - Date taken
// - View button → can view their attempt details
```

**UI Structure:**

```
┌─ Header (Logo, Admin Name, Logout) ──────────────────┐
│                                                        │
│  Tabs: [Exams] [Subjects] [Questions] [Results]      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [+ Add New] [Upload] [Refresh]                  │ │
│  │                                                  │ │
│  │ Table/Grid of content based on active tab        │ │
│  │ - Column headers                                 │ │
│  │ - Rows with data                                 │ │
│  │ - Edit/Delete buttons per row                    │ │
│  │ - Pagination if many items                       │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Modals (hidden until needed):                        │
│  - Create Exam Form                                   │
│  - Create Subject Form                                │
│  - Upload Questions Form                              │
│  - Edit Question Form                                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Common Patterns Across All Pages

### 1. Loading State

```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
```

### 2. Error Handling

```javascript
try {
  const data = await apiCall();
  setData(data);
} catch (err) {
  console.error("Failed:", err);
  setError("Failed. Please try again.");
} finally {
  setLoading(false);
}
```

### 3. useEffect for Data Loading

```javascript
useEffect(() => {
  loadData();
}, [depParam]); // Dependency array
```

### 4. Success Feedback

```javascript
// Show success message
setSuccess("Operation completed");
// Auto-clear after 3 seconds
setTimeout(() => setSuccess(""), 3000);
```

---

## Data Dependencies & Relations

```
User (auth)
  ↓
Attempt (what exam attempt)
  ├─ Exam (which exam type)
  ├─ Subject (which subject)
  ├─ Answers (selected responses)
  └─ AttemptQuestions (which 40 questions)
        ↓
        Questions (actual questions)
          ├─ Options A/B/C/D
          ├─ Correct answer
          └─ Explanation

Subject
  ├─ Exam (parent)
  ├─ Questions (many)
  └─ Time limit
```

---

## Session Flow Summary

### New User Session

1. **Login** (Login.jsx)
   - Input: email, password
   - Check: Supabase auth
   - Output: User object with role

2. **Exam Selection** (ExamSelect.jsx)
   - Display: All exams (WAEC/NECO/JAMB)
   - Action: Click exam

3. **Subject Selection** (SubjectSelect.jsx)
   - Display: Subjects for selected exam
   - Check: Which subjects already attempted
   - Action: Click subject → Create attempt

4. **Exam Taking** (Exam.jsx)
   - Display: Current question (1-40)
   - Actions:
     - Select answer → Save to DB
     - Navigate questions
     - Submit or timeout
   - Timer: Counts down, persists every 5 sec

5. **Results** (Result.jsx)
   - Display: Score, grade, breakdown
   - Calculate: Percentage, grade letter
   - Actions: Review or try another subject

6. **Review** (Review.jsx)
   - Display: All questions with answers
   - Highlight: Correct (green), Wrong (red)
   - Show: Explanations for each question
   - Filter: All / Correct / Incorrect

### Admin Session

1. **Login** → Admin Dashboard
2. **Manage Exams** → Create/Edit/Delete
3. **Manage Subjects** → Create/Edit/Delete
4. **Manage Questions** → Upload/Edit/Delete
5. **View Results** → Monitor student performance
