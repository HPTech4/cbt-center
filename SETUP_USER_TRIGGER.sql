-- =====================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- =====================================================
-- This trigger automatically creates a profile in public.users 
-- whenever a new user is registered in auth.users
-- 
-- RUN THIS IN SUPABASE SQL EDITOR
-- =====================================================

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
    'student'  -- Default role is 'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on auth.users table
-- Delete old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- WHAT THIS DOES:
-- =====================================================
-- 1. When a new user signs up in Supabase Auth
-- 2. This trigger automatically creates their profile in public.users
-- 3. Their role is set to 'student' by default
-- 4. Their full_name is extracted from email (part before @)
--
-- EXAMPLE:
-- User registers with: admin@gmail.com
-- Profile created with:
--   - id: (auto from auth.users)
--   - full_name: 'admin'
--   - role: 'student'
-- =====================================================

-- Step 3 (OPTIONAL): If you want the first user to be 'admin', 
-- run this after creating the account:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@gmail.com';

-- Note: You may need to set updated_at timestamp
-- If you get an error about updated_at, add this to the function:
-- new_row.updated_at := NOW();
