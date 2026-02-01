# CBT Practice System - Complete Installation & Setup Guide

A production-ready Computer-Based Testing (CBT) practice platform for WAEC, NECO, and JAMB exam preparation. Built with React, Supabase, and Tailwind CSS.

## 🎯 Features

### Student Features
- ✅ Login authentication (pre-created accounts)
- ✅ Select exam type (WAEC/NECO/JAMB)
- ✅ Select subject to practice
- ✅ 40 randomly selected questions per attempt
- ✅ Countdown timer with persistence
- ✅ Auto-submit when time expires
- ✅ Immediate results after submission
- ✅ Detailed review with corrections and explanations
- ✅ One attempt per subject per session

### Admin Features
- ✅ Create and manage exams
- ✅ Create and manage subjects with time limits
- ✅ Upload 100+ questions per subject
- ✅ Edit and delete questions
- ✅ View all student results
- ✅ Question format parser for bulk upload

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

## 🚀 Installation Steps

### Step 1: Clone & Install Dependencies

```bash
# Navigate to project directory
cd cbt-practice-system

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Run Database Schema**
   - Open Supabase SQL Editor: Project → SQL Editor
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - Wait for all tables, policies, and triggers to be created

3. **Get API Credentials**
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon/public key`

### Step 3: Configure Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Create Users

Since registration is disabled, you need to create users through Supabase:

#### Method 1: Using Supabase Dashboard (Recommended)

1. Go to Authentication → Users → Add User
2. Create an admin user:
   - Email: `admin@example.com`
   - Password: `admin123` (change in production)
   - Auto Confirm User: ✅
3. Create a student user:
   - Email: `student@example.com`
   - Password: `student123`
   - Auto Confirm User: ✅

4. Add user profiles via SQL Editor:
```sql
-- Insert admin profile
INSERT INTO public.users (id, full_name, role)
VALUES (
  'user-id-from-auth-users-table',
  'Admin User',
  'admin'
);

-- Insert student profile
INSERT INTO public.users (id, full_name, role)
VALUES (
  'user-id-from-auth-users-table',
  'Student User',
  'student'
);
```

#### Method 2: Using Supabase API (Programmatic)

```javascript
// Use this in a setup script or admin panel
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'admin123',
  email_confirm: true
})

const { error: profileError } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,
    full_name: 'Admin User',
    role: 'admin'
  })
```

### Step 5: Seed Sample Data (Optional)

The schema automatically creates WAEC, NECO, and JAMB exams. To add subjects and questions:

1. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Add Subjects**
   - Go to "Subjects" tab
   - Click "Add Subject"
   - Select exam, enter subject name and time limit

3. **Upload Questions**
   - Go to "Questions" tab
   - Click "Upload Questions"
   - Use this format:

```
Q: What is the capital of Nigeria?
A) Lagos
B) Abuja
C) Kano
D) Port Harcourt
ANSWER: B
EXPLANATION: Abuja has been the capital of Nigeria since 1991.

Q: What is 5 + 7?
A) 10
B) 11
C) 12
D) 13
ANSWER: C
EXPLANATION: 5 plus 7 equals 12.
```

### Step 6: Run the Application

```bash
# Development mode
npm run dev

# The app will be available at http://localhost:3000
```

## 🎓 Usage Guide

### For Students

1. **Login**
   - Navigate to http://localhost:3000
   - Enter student email and password
   - Click "Sign In"

2. **Select Exam**
   - Choose WAEC, NECO, or JAMB

3. **Select Subject**
   - Choose a subject to practice
   - Click "Start Practice"

4. **Take Exam**
   - Answer 40 randomly selected questions
   - Timer starts immediately
   - Navigate between questions
   - Submit when done (or auto-submit when time ends)

5. **View Results**
   - See your score immediately
   - Click "View Corrections" to review all questions

6. **Review Answers**
   - See correct answers highlighted in green
   - Your wrong answers highlighted in red
   - Read explanations for each question

### For Admins

1. **Login**
   - Navigate to http://localhost:3000
   - Enter admin email and password
   - Redirected to admin dashboard

2. **Manage Exams**
   - Add new exam types (e.g., GCE, SAT)

3. **Manage Subjects**
   - Add subjects under each exam
   - Set time limits for each subject

4. **Manage Questions**
   - Upload questions in bulk using the specified format
   - Edit existing questions
   - Delete questions
   - View all questions for a subject

5. **View Results**
   - See all student attempts
   - View scores and percentages
   - Track student performance

## 📊 Database Schema

```
users
├── id (UUID, PK)
├── full_name (TEXT)
├── role (TEXT) - 'student' or 'admin'
└── timestamps

exams
├── id (UUID, PK)
├── name (TEXT)
└── description (TEXT)

subjects
├── id (UUID, PK)
├── exam_id (UUID, FK)
├── name (TEXT)
└── time_limit_minutes (INTEGER)

questions
├── id (UUID, PK)
├── subject_id (UUID, FK)
├── question_text (TEXT)
├── option_a/b/c/d (TEXT)
├── correct_option (TEXT)
└── explanation (TEXT)

attempts
├── id (UUID, PK)
├── user_id (UUID, FK)
├── subject_id (UUID, FK)
├── score (INTEGER)
├── total_questions (INTEGER)
├── started_at (TIMESTAMP)
└── submitted_at (TIMESTAMP)

answers
├── id (UUID, PK)
├── attempt_id (UUID, FK)
├── question_id (UUID, FK)
├── selected_option (TEXT)
└── is_correct (BOOLEAN)

attempt_questions
├── id (UUID, PK)
├── attempt_id (UUID, FK)
├── question_id (UUID, FK)
└── question_order (INTEGER)
```

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- Students can only access their own attempts
- Students cannot see correct answers until submission
- Admins have full access to all data
- Secure authentication via Supabase Auth
- Role-based access control

## 🎨 Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📝 Question Upload Format

Questions should follow this exact format:

```
Q: Your question text here?
A) First option
B) Second option
C) Third option
D) Fourth option
ANSWER: B
EXPLANATION: Your explanation here (optional)

Q: Next question?
A) Option A
B) Option B
C) Option C
D) Option D
ANSWER: A
EXPLANATION: Why A is correct
```

**Important Rules:**
- Start each question with "Q:" or a number like "1."
- Options must be "A)", "B)", "C)", "D)"
- Must specify "ANSWER: X" where X is A, B, C, or D
- Explanation is optional but recommended
- Separate questions with a blank line

## 🚨 Troubleshooting

### "Failed to load exams"
- Check your Supabase credentials in `.env`
- Ensure the database schema was run successfully
- Check Supabase logs for errors

### "Not enough questions available"
- Upload at least 40 questions per subject
- Check that questions are properly formatted

### Timer not persisting
- Check browser console for errors
- Ensure Supabase connection is stable

### Cannot login
- Verify user exists in Supabase Authentication
- Verify user profile exists in `public.users` table
- Check that password is correct

### RLS Policy Errors
- Ensure all RLS policies were created from the schema
- Check Supabase logs for policy violations

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Production Deployment

### Deploy to Vercel/Netlify

1. **Build the app**
```bash
npm run build
```

2. **Set environment variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Auto-deploy on push

### Important for Production

- Change default user passwords
- Use strong passwords
- Enable Supabase email confirmations
- Set up proper backup procedures
- Monitor Supabase usage
- Consider upgrading Supabase plan for better performance

## 📄 License

This project is for educational purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs
3. Check browser console for errors

## ✅ Checklist for Launch

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] Student users created
- [ ] Sample exams created
- [ ] Sample subjects created
- [ ] Questions uploaded (40+ per subject)
- [ ] Admin can login
- [ ] Student can login
- [ ] Student can take exam
- [ ] Timer works correctly
- [ ] Auto-submit works
- [ ] Results display correctly
- [ ] Review page works
- [ ] Production deployment configured

## 🎉 You're Ready!

Your CBT Practice System is now fully set up and ready to use. Students can start practicing, and admins can manage content.

Happy learning! 📚
#   c b t - c e n t e r  
 