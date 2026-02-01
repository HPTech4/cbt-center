# 📁 CBT Practice System - Project Structure

## Complete File Organization

```
cbt-practice-system/
├── node_modules/              # Dependencies (gitignored)
├── public/                    # Static assets
├── src/                       # Source code
│   ├── components/            # Reusable React components
│   │   ├── ProtectedRoute.jsx # Authentication guard
│   │   ├── QuestionCard.jsx   # Question display component
│   │   └── Timer.jsx          # Countdown timer with persistence
│   │
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.jsx    # Global authentication state
│   │
│   ├── pages/                 # Page components
│   │   ├── AdminDashboard.jsx # Admin management interface
│   │   ├── Exam.jsx           # Main exam interface
│   │   ├── ExamSelect.jsx     # Exam type selection
│   │   ├── Login.jsx          # Authentication page
│   │   ├── Result.jsx         # Score display page
│   │   ├── Review.jsx         # Corrections & explanations
│   │   └── SubjectSelect.jsx  # Subject selection
│   │
│   ├── services/              # API & business logic
│   │   └── supabaseClient.js  # Supabase configuration & queries
│   │
│   ├── App.jsx                # Main app component with routing
│   ├── index.css              # Global styles & Tailwind
│   └── main.jsx               # React entry point
│
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick setup guide
├── sample-questions.txt       # Sample questions for testing
├── supabase-schema.sql        # Database schema
├── tailwind.config.js         # Tailwind configuration
└── vite.config.js             # Vite build configuration
```

## 🔍 Key Files Explained

### Core Configuration

**package.json**
- Project dependencies
- NPM scripts (dev, build, preview)
- Version information

**vite.config.js**
- Vite build tool configuration
- React plugin setup
- Server configuration

**tailwind.config.js**
- Tailwind CSS customization
- Color theme
- Font configuration

### Source Code Structure

#### Components (`src/components/`)

**ProtectedRoute.jsx**
- Guards routes requiring authentication
- Redirects based on user role
- Shows loading state during auth check

**QuestionCard.jsx**
- Displays a single question with options
- Handles answer selection
- Shows correct/incorrect in review mode
- Displays explanations

**Timer.jsx**
- Countdown timer component
- Persists to database every 5 seconds
- Auto-submits when time expires
- Visual warning when time is low

#### Contexts (`src/contexts/`)

**AuthContext.jsx**
- Global authentication state
- Current user information
- Auth status loading state
- Used throughout the app via `useAuth()` hook

#### Pages (`src/pages/`)

**Login.jsx**
- Email + password authentication
- No registration option
- Role-based redirect after login
- Error handling

**ExamSelect.jsx** (Student)
- Display available exams (WAEC/NECO/JAMB)
- Navigate to subject selection
- Shows student info
- Logout option

**SubjectSelect.jsx** (Student)
- Display subjects for selected exam
- Shows time limit per subject
- Prevents retaking attempted subjects
- Creates new attempt on start

**Exam.jsx** (Student)
- Main exam interface
- 40 questions with navigation
- Live timer with persistence
- Answer selection and saving
- Submit with confirmation
- Auto-submit on timeout

**Result.jsx** (Student)
- Display score and percentage
- Performance summary
- Grade calculation
- Navigate to review or home

**Review.jsx** (Student)
- Show all questions with answers
- Highlight correct/incorrect
- Display explanations
- Filter by correct/incorrect/all
- Read-only mode

**AdminDashboard.jsx** (Admin)
- Tab-based interface (Exams/Subjects/Questions/Results)
- Create and manage exams
- Create and manage subjects
- Upload questions in bulk
- Edit individual questions
- View all student results
- Complete CRUD operations

#### Services (`src/services/`)

**supabaseClient.js**
- Supabase client initialization
- Authentication functions
- All database queries
- Question randomization logic
- Score calculation
- RLS policy compliance

### Database (`supabase-schema.sql`)

**Tables:**
- `users` - User profiles with roles
- `exams` - Exam types (WAEC, NECO, JAMB)
- `subjects` - Subjects under each exam
- `questions` - Question bank with answers
- `attempts` - Student exam attempts
- `answers` - Student answers per attempt
- `attempt_questions` - 40 selected questions per attempt

**Security:**
- Row Level Security (RLS) policies
- Role-based access control
- Secure data isolation

## 🔄 Data Flow

### Student Taking Exam

```
1. Login.jsx
   ↓ (authenticate)
2. ExamSelect.jsx
   ↓ (select exam)
3. SubjectSelect.jsx
   ↓ (start attempt, randomize 40 questions)
4. Exam.jsx
   ↓ (answer questions, timer running)
   ↓ (submit or auto-submit)
5. Result.jsx
   ↓ (view corrections)
6. Review.jsx
```

### Admin Managing Content

```
1. Login.jsx
   ↓ (authenticate as admin)
2. AdminDashboard.jsx
   ├─ Exams Tab → Create/View Exams
   ├─ Subjects Tab → Create/View Subjects
   ├─ Questions Tab → Upload/Edit/Delete Questions
   └─ Results Tab → View All Student Attempts
```

## 🎨 Styling System

**Tailwind CSS Classes:**
- `btn-primary` - Primary action buttons
- `btn-secondary` - Secondary action buttons
- `btn-danger` - Destructive actions
- `card` - Content card container
- `input` - Form input styling
- `label` - Form label styling

**Custom Animations:**
- Timer warning pulse
- Loading spinners
- Smooth transitions

## 🔐 Authentication Flow

```
User Login
   ↓
Supabase Auth Check
   ↓
Fetch User Profile (role)
   ↓
Store in AuthContext
   ↓
Route based on role:
   - Admin → /admin
   - Student → /exams
```

## 📊 Question Selection Logic

```
1. Student starts exam
2. Fetch all questions for subject
3. Shuffle array randomly
4. Select first 40 questions
5. Store in attempt_questions table
6. Display to student in shuffled order
7. Each attempt gets different questions
```

## 🛡️ Security Layers

1. **Authentication**: Supabase Auth
2. **Authorization**: RLS Policies
3. **Route Protection**: ProtectedRoute component
4. **Role Validation**: Server-side via RLS
5. **Data Isolation**: User can only see own data

## 🚀 Build Process

```
Development:
npm run dev → Vite Dev Server → http://localhost:3000

Production:
npm run build → Optimized bundle in /dist → Deploy
```

## 📝 Code Organization Principles

- **Component-based**: Reusable UI components
- **Context for State**: Global state via Context API
- **Service Layer**: All API calls in one place
- **Page-based Routing**: One page per route
- **Separation of Concerns**: Logic separated from UI

## 🔧 Configuration Files Purpose

- **vite.config.js**: Build tool settings
- **tailwind.config.js**: Design system
- **postcss.config.js**: CSS processing
- **package.json**: Dependencies
- **.env**: Secret keys (not committed)

## 📦 Dependencies

**Runtime:**
- `react` - UI library
- `react-dom` - React rendering
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Backend SDK
- `lucide-react` - Icons

**Development:**
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS compatibility
- `eslint` - Code linting

## 🎯 Key Features Implementation

### Timer Persistence
- Updates Supabase every 5 seconds
- Survives page refresh
- Auto-submit on zero

### Question Randomization
- Shuffled on attempt creation
- Stored in attempt_questions
- Consistent across session

### Answer Tracking
- Saved immediately on selection
- Upsert prevents duplicates
- Recoverable on refresh

### Score Calculation
- Server-side for security
- Compares with correct_option
- Updates attempt record

## 📖 Further Reading

- See README.md for detailed setup
- See QUICKSTART.md for fast setup
- See supabase-schema.sql for database structure
- See sample-questions.txt for question format

---

**This structure ensures maintainability, scalability, and security.**
