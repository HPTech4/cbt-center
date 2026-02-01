-- =====================================================
-- CBT PRACTICE SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This schema includes all tables, indexes, RLS policies, and triggers
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_users_role ON public.users(role);

-- =====================================================
-- 2. EXAMS TABLE
-- =====================================================
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SUBJECTS TABLE
-- =====================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time_limit_minutes INTEGER NOT NULL DEFAULT 60 CHECK (time_limit_minutes > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, name)
);

-- Index for exam-based queries
CREATE INDEX idx_subjects_exam_id ON public.subjects(exam_id);

-- =====================================================
-- 4. QUESTIONS TABLE
-- =====================================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for subject-based queries
CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);

-- =====================================================
-- 5. ATTEMPTS TABLE
-- =====================================================
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 40,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_remaining_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX idx_attempts_subject_id ON public.attempts(subject_id);
CREATE INDEX idx_attempts_submitted_at ON public.attempts(submitted_at);

-- =====================================================
-- 6. ANSWERS TABLE
-- =====================================================
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX idx_answers_attempt_id ON public.answers(attempt_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);

-- =====================================================
-- 7. ATTEMPT QUESTIONS TABLE (stores the 40 random questions per attempt)
-- =====================================================
CREATE TABLE public.attempt_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id),
  UNIQUE(attempt_id, question_order)
);

-- Index for efficient retrieval
CREATE INDEX idx_attempt_questions_attempt_id ON public.attempt_questions(attempt_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attempts_updated_at BEFORE UPDATE ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_questions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert users
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update users
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- EXAMS TABLE POLICIES
-- =====================================================

-- Everyone can read exams
CREATE POLICY "Everyone can read exams" ON public.exams
  FOR SELECT USING (true);

-- Admins can insert exams
CREATE POLICY "Admins can insert exams" ON public.exams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update exams
CREATE POLICY "Admins can update exams" ON public.exams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete exams
CREATE POLICY "Admins can delete exams" ON public.exams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- SUBJECTS TABLE POLICIES
-- =====================================================

-- Everyone can read subjects
CREATE POLICY "Everyone can read subjects" ON public.subjects
  FOR SELECT USING (true);

-- Admins can insert subjects
CREATE POLICY "Admins can insert subjects" ON public.subjects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update subjects
CREATE POLICY "Admins can update subjects" ON public.subjects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete subjects
CREATE POLICY "Admins can delete subjects" ON public.subjects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- QUESTIONS TABLE POLICIES
-- =====================================================

-- Admins can read all questions
CREATE POLICY "Admins can read questions" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can read questions for their active attempts
CREATE POLICY "Students can read their attempt questions" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attempt_questions aq
      JOIN public.attempts a ON a.id = aq.attempt_id
      WHERE aq.question_id = questions.id
        AND a.user_id = auth.uid()
        AND a.submitted_at IS NULL
    )
  );

-- Admins can insert questions
CREATE POLICY "Admins can insert questions" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update questions
CREATE POLICY "Admins can update questions" ON public.questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete questions
CREATE POLICY "Admins can delete questions" ON public.questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ATTEMPTS TABLE POLICIES
-- =====================================================

-- Students can read their own attempts
CREATE POLICY "Students can read own attempts" ON public.attempts
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all attempts
CREATE POLICY "Admins can read all attempts" ON public.attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can insert their own attempts
CREATE POLICY "Students can insert own attempts" ON public.attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students can update their own attempts (for timer and submission)
CREATE POLICY "Students can update own attempts" ON public.attempts
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- ANSWERS TABLE POLICIES
-- =====================================================

-- Students can read their own answers
CREATE POLICY "Students can read own answers" ON public.answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attempts 
      WHERE id = answers.attempt_id AND user_id = auth.uid()
    )
  );

-- Admins can read all answers
CREATE POLICY "Admins can read all answers" ON public.answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can insert their own answers
CREATE POLICY "Students can insert own answers" ON public.answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts 
      WHERE id = answers.attempt_id 
        AND user_id = auth.uid()
        AND submitted_at IS NULL
    )
  );

-- Students can update their own answers (before submission only)
CREATE POLICY "Students can update own answers" ON public.answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.attempts 
      WHERE id = answers.attempt_id 
        AND user_id = auth.uid()
        AND submitted_at IS NULL
    )
  );

-- =====================================================
-- ATTEMPT_QUESTIONS TABLE POLICIES
-- =====================================================

-- Students can read their own attempt questions
CREATE POLICY "Students can read own attempt questions" ON public.attempt_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attempts 
      WHERE id = attempt_questions.attempt_id AND user_id = auth.uid()
    )
  );

-- Admins can read all attempt questions
CREATE POLICY "Admins can read all attempt questions" ON public.attempt_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert attempt questions
CREATE POLICY "Users can insert attempt questions" ON public.attempt_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts 
      WHERE id = attempt_questions.attempt_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- SEED DATA (Sample Exams)
-- =====================================================

-- Insert sample exams
INSERT INTO public.exams (name, description) VALUES
  ('WAEC', 'West African Examinations Council'),
  ('NECO', 'National Examinations Council'),
  ('JAMB', 'Joint Admissions and Matriculation Board')
ON CONFLICT (name) DO NOTHING;

-- Note: Run this SQL in your Supabase SQL Editor
-- Then create users through Supabase Auth Dashboard or API
