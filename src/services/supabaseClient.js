import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client (CLEAN & STABLE)
 * No manual timeouts
 * No REST auth
 * No race conditions
 *
 * TEMPORARY: Using hardcoded auth for testing
 */

// Hardcoded users for temporary testing
const MOCK_USERS = {
  "admin@gmail.com": {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@gmail.com",
    password: "1234",
    role: "admin",
    full_name: "Admin User",
    created_at: new Date().toISOString(),
  },
  "student@gmail.com": {
    id: "00000000-0000-0000-0000-000000000002",
    email: "student@gmail.com",
    password: "1234",
    role: "student",
    full_name: "Student User",
    created_at: new Date().toISOString(),
  },
};

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://qvgvjuhtsjzdkpevlyoh.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3ZqdWh0c2p6ZGtwZXZseW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDE1MzIsImV4cCI6MjA4NTI3NzUzMn0.Ihq2oq5ChGBEvbu-EPLeSU7kwK54dgjlYM1yorkVI-Q";

// Validate environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL: Missing Supabase credentials");
  console.error(
    "  - VITE_SUPABASE_URL:",
    supabaseUrl ? "✅ Set" : "❌ Missing",
  );
  console.error(
    "  - VITE_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Set" : "❌ Missing",
  );
  console.error("📝 Fix: Add these to your .env file:");
  console.error("  VITE_SUPABASE_URL=https://your-project.supabase.co");
  console.error("  VITE_SUPABASE_ANON_KEY=your-anon-key");
  throw new Error("Supabase credentials not configured. Check .env file.");
}

const globalScope = globalThis;
const existingClient = globalScope.__cbtSupabaseClient;

export const supabase = existingClient
  ? existingClient
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

if (!existingClient) {
  globalScope.__cbtSupabaseClient = supabase;
  console.log("✅ Supabase client initialized:", {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

/* ======================
   AUTH FUNCTIONS (TEMPORARY HARDCODED)
====================== */

/**
 * Sign in user (HARDCODED FOR TESTING)
 * admin@gmail.com / 1234
 * student@gmail.com / 1234
 */
export const signIn = async (email, password) => {
  console.log("🔐 Mock auth: Attempting login for", email);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockUser = MOCK_USERS[email.toLowerCase()];

  if (!mockUser || mockUser.password !== password) {
    throw new Error("Invalid login credentials");
  }

  // Store in localStorage for persistence
  localStorage.setItem("mock_user", JSON.stringify(mockUser));

  console.log("✅ Mock auth: Login successful", mockUser.email, mockUser.role);

  return {
    user: {
      id: mockUser.id,
      email: mockUser.email,
    },
    profile: {
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      full_name: mockUser.full_name,
      created_at: mockUser.created_at,
    },
  };
};

/**
 * Get current logged-in user + profile (HARDCODED)
 */
export const getCurrentUser = async () => {
  const mockUserData = localStorage.getItem("mock_user");

  if (!mockUserData) return null;

  const mockUser = JSON.parse(mockUserData);

  return {
    id: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    full_name: mockUser.full_name,
    created_at: mockUser.created_at,
  };
};

/**
 * Sign out (HARDCODED)
 */
export const signOut = async () => {
  localStorage.removeItem("mock_user");
  console.log("✅ Mock auth: Logged out");
};

/* ======================
   STUDENT / CBT LOGIC
====================== */

export const getExams = async () => {
  const { data, error } = await supabase.from("exams").select("*");
  if (error) throw error;
  return data;
};

export const getSubjects = async (examId) => {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("exam_id", examId);
  if (error) throw error;
  return data;
};

export const hasAttemptedSubject = async (userId, subjectId) => {
  const { data, error } = await supabase
    .from("attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .not("submitted_at", "is", null);

  if (error) throw error;
  return data.length > 0;
};

export const createAttempt = async (userId, subjectId) => {
  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .eq("subject_id", subjectId);

  if (!questions || questions.length < 40) {
    throw new Error("Not enough questions");
  }

  const selected = questions.sort(() => 0.5 - Math.random()).slice(0, 40);

  const { data: subject } = await supabase
    .from("subjects")
    .select("time_limit_minutes")
    .eq("id", subjectId)
    .single();

  const { data: attempt } = await supabase
    .from("attempts")
    .insert({
      user_id: userId,
      subject_id: subjectId,
      total_questions: 40,
      time_remaining_seconds: subject.time_limit_minutes * 60,
    })
    .select()
    .single();

  await supabase.from("attempt_questions").insert(
    selected.map((q, i) => ({
      attempt_id: attempt.id,
      question_id: q.id,
      question_order: i + 1,
    })),
  );

  return attempt;
};

/**
 * Update time remaining for an exam attempt
 * Called by Timer component to persist time to database
 */
export const updateTimeRemaining = async (attemptId, seconds) => {
  const { error } = await supabase
    .from("attempts")
    .update({ time_remaining_seconds: seconds })
    .eq("id", attemptId);

  if (error) throw error;
};

/**
 * Save answer to database
 */
export const saveAnswer = async (attemptId, questionId, selectedOption) => {
  const { error } = await supabase.from("answers").upsert(
    {
      attempt_id: attemptId,
      question_id: questionId,
      selected_option: selectedOption,
    },
    {
      onConflict: "attempt_id,question_id",
    },
  );

  if (error) throw error;
};

/**
 * Get questions for an exam attempt
 */
export const getAttemptQuestions = async (attemptId) => {
  const { data, error } = await supabase
    .from("attempt_questions")
    .select("question_id, question_order, questions(*)")
    .eq("attempt_id", attemptId)
    .order("question_order");

  if (error) throw error;
  return data;
};

/**
 * Get answers for an exam attempt
 */
export const getAttemptAnswers = async (attemptId) => {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("attempt_id", attemptId);

  if (error) throw error;
  return data;
};

/**
 * Submit exam attempt
 */
export const submitAttempt = async (attemptId) => {
  const { error } = await supabase
    .from("attempts")
    .update({ submitted_at: new Date().toISOString() })
    .eq("id", attemptId);

  if (error) throw error;
};

/**
 * Get attempt details
 */
export const getAttempt = async (attemptId) => {
  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get attempt with questions and answers
 * Used by Exam.jsx to load full exam data
 */
export const getAttemptWithQuestions = async (attemptId) => {
  // Get attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (attemptError) throw attemptError;

  // Get questions for this attempt
  const { data: attemptQuestions, error: questionsError } = await supabase
    .from("attempt_questions")
    .select("question_id, question_order, questions(*)")
    .eq("attempt_id", attemptId)
    .order("question_order");

  if (questionsError) throw questionsError;

  // Get answers for this attempt
  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("*")
    .eq("attempt_id", attemptId);

  if (answersError) throw answersError;

  // Format questions with answers
  const questions = attemptQuestions.map((aq) => ({
    ...aq.questions,
    order: aq.question_order,
    selected_option: answers.find((a) => a.question_id === aq.question_id)
      ?.selected_option,
  }));

  return {
    attempt,
    questions,
  };
};

/**
 * Get attempt result with scoring
 * Used by Result.jsx and Review.jsx to show exam results
 */
export const getAttemptResult = async (attemptId) => {
  // Get attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (attemptError) throw attemptError;

  // Get questions and answers
  const { data: attemptQuestions, error: questionsError } = await supabase
    .from("attempt_questions")
    .select("question_id, question_order, questions(*)")
    .eq("attempt_id", attemptId)
    .order("question_order");

  if (questionsError) throw questionsError;

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("*")
    .eq("attempt_id", attemptId);

  if (answersError) throw answersError;

  // Calculate score
  let correctCount = 0;
  const questions = attemptQuestions.map((aq) => {
    const answer = answers.find((a) => a.question_id === aq.question_id);
    const isCorrect = answer?.selected_option === aq.questions.correct_option;

    if (isCorrect) correctCount++;

    return {
      ...aq.questions,
      order: aq.question_order,
      selected_option: answer?.selected_option,
      is_correct: isCorrect,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);

  return {
    attempt: {
      ...attempt,
      score,
      correct_count: correctCount,
      total_questions: questions.length,
    },
    questions,
  };
};

/* ======================
   ADMIN FUNCTIONS
====================== */

export const getAllSubjects = async () => {
  const { data, error } = await supabase.from("subjects").select("*");
  if (error) throw error;
  return data;
};

export const createExam = async ({ name, description }) => {
  const { data, error } = await supabase
    .from("exams")
    .insert({ name, description })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createSubject = async ({ examId, name, timeLimitMinutes }) => {
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      exam_id: examId,
      name,
      time_limit_minutes: timeLimitMinutes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createQuestions = async (subjectId, questions) => {
  const payload = questions.map((question) => ({
    subject_id: subjectId,
    question_text: question.question_text,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_option: question.correct_option,
    explanation: question.explanation ?? null,
  }));

  const { error } = await supabase.from("questions").insert(payload);
  if (error) throw error;
};

export const getQuestionsBySubject = async (subjectId) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId);

  if (error) throw error;
  return data;
};

export const getAllAttempts = async () => {
  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (questionId) => {
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) throw error;
};

export const updateQuestion = async (questionId, updates) => {
  const { data, error } = await supabase
    .from("questions")
    .update({
      question_text: updates.question_text,
      option_a: updates.option_a,
      option_b: updates.option_b,
      option_c: updates.option_c,
      option_d: updates.option_d,
      correct_option: updates.correct_option,
      explanation: updates.explanation ?? null,
    })
    .eq("id", questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
