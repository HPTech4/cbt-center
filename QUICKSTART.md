# 🚀 CBT Practice System - Quick Start Guide

Get your CBT system running in 5 minutes!

## Prerequisites Check ✅

```bash
node --version  # Should be 18 or higher
npm --version   # Should be 9 or higher
```

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 minutes)

```bash
npm install
```

### 2️⃣ Set Up Supabase (3 minutes)

1. **Create Supabase Project**
   - Visit: https://app.supabase.com
   - Click "New Project"
   - Wait 2 minutes for setup

2. **Run Database Schema**
   - Go to: SQL Editor in Supabase
   - Copy ALL content from `supabase-schema.sql`
   - Paste and click "RUN"
   - ✅ Wait for success message

3. **Get Your Keys**
   - Go to: Settings → API
   - Copy `Project URL`
   - Copy `anon public` key

### 3️⃣ Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and paste your keys
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4️⃣ Create First Users

**In Supabase Dashboard:**

1. Go to: Authentication → Users → Add User
2. Create Admin:
   - Email: `admin@test.com`
   - Password: `admin123`
   - ✅ Auto Confirm User
   - Click "Create"
   
3. Create Student:
   - Email: `student@test.com`
   - Password: `student123`
   - ✅ Auto Confirm User
   - Click "Create"

4. **Add Profiles (Important!)**
   - Go to: SQL Editor
   - Run this query **TWICE** (change the UUID each time):

```sql
-- Get the user IDs from Authentication → Users table
-- Run this for ADMIN (replace the UUID with actual admin user ID)
INSERT INTO public.users (id, full_name, role)
VALUES (
  'paste-admin-user-id-here',
  'Admin User',
  'admin'
);

-- Run this for STUDENT (replace the UUID with actual student user ID)
INSERT INTO public.users (id, full_name, role)
VALUES (
  'paste-student-user-id-here',
  'Student User',
  'student'
);
```

### 5️⃣ Start the App

```bash
npm run dev
```

Visit: http://localhost:3000

## First Login 🎉

### Login as Admin
- Email: `admin@test.com`
- Password: `admin123`

**What to do:**
1. Go to "Subjects" tab
2. Click "Add Subject"
3. Select "WAEC"
4. Name: "Mathematics"
5. Time Limit: 60 minutes
6. Click "Create"

7. Go to "Questions" tab
8. Click "Upload Questions"
9. Select "WAEC - Mathematics"
10. Copy content from `sample-questions.txt`
11. Paste and click "Upload"
12. ✅ You should see "40 questions uploaded"

### Login as Student
- Logout admin
- Email: `student@test.com`
- Password: `student123`

**What to do:**
1. Click "WAEC"
2. Click "Mathematics"
3. Click "Start Practice"
4. Answer questions
5. Submit exam
6. View results
7. View corrections

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables set
- [ ] Admin user created
- [ ] Student user created
- [ ] User profiles added to database
- [ ] App runs on localhost:3000
- [ ] Admin can login
- [ ] Subject created
- [ ] Questions uploaded (40+)
- [ ] Student can login
- [ ] Student can take exam
- [ ] Results display correctly

## 🚨 Common Issues

### "Invalid login credentials"
- Check user exists in Authentication → Users
- Check password is correct
- Make sure you added profile in `public.users` table

### "No subjects available"
- Login as admin
- Add a subject first

### "Not enough questions"
- Need at least 40 questions per subject
- Check question format in upload

### "Supabase connection error"
- Verify .env file exists
- Check credentials are correct
- Restart dev server

## 📱 Test the Full Flow

1. ✅ Login as student
2. ✅ Select WAEC exam
3. ✅ Select Mathematics subject
4. ✅ Start practice (timer starts)
5. ✅ Answer some questions
6. ✅ Submit exam
7. ✅ See score on result page
8. ✅ Click "View Corrections"
9. ✅ See all answers with explanations
10. ✅ Go back home
11. ✅ Try to retake same subject (should be blocked)

## 🎓 Next Steps

1. **Add More Subjects**
   - English, Physics, Chemistry, Biology, etc.
   
2. **Upload More Questions**
   - Each subject needs 100+ questions for variety

3. **Create More Students**
   - Follow Step 4 for each student

4. **Customize**
   - Change colors in `tailwind.config.js`
   - Modify time limits per subject
   - Add more exam types

## 🔗 Important Links

- Supabase Dashboard: https://app.supabase.com
- Local App: http://localhost:3000
- Documentation: README.md

## Need Help?

1. Check README.md for detailed docs
2. Review Supabase logs for errors
3. Check browser console (F12)

---

**You're all set! Happy testing! 🎉**
