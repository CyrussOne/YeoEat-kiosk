-- ========================================
-- COMPLETE ADMIN LOGIN FIX FOR YELOEAT KIOSK
-- ========================================
-- Run this entire script in Supabase SQL Editor

-- ========================================
-- STEP 1: Ensure profiles table exists and has trigger
-- ========================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 2: Fix user_roles RLS policies
-- ========================================

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Allow admins to manage roles
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- ========================================
-- STEP 3: Create profiles for existing users
-- ========================================

-- Backfill profiles for any users that don't have them
INSERT INTO profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 4: Verify setup
-- ========================================

-- Show all users with their profiles and roles
SELECT
  au.id,
  au.email,
  au.created_at as user_created,
  au.confirmed_at,
  p.full_name,
  ur.role,
  ur.created_at as role_assigned
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
ORDER BY au.created_at DESC;

-- ========================================
-- STEP 5: ASSIGN ADMIN ROLE TO YOUR USER
-- ========================================
-- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'your-email@example.com'; -- CHANGE THIS!

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User not found with that email!';
  ELSE
    -- Insert admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Admin role assigned to user: %', v_user_id;
  END IF;
END $$;

-- ========================================
-- STEP 6: Verify your admin role
-- ========================================
-- Replace email to check your role

SELECT
  au.email,
  p.full_name,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users au
JOIN profiles p ON p.id = au.id
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE au.email = 'your-email@example.com'; -- CHANGE THIS!

-- ========================================
-- STEP 7: Check RLS policies
-- ========================================

-- View all policies on user_roles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_roles', 'profiles')
ORDER BY tablename, policyname;

-- ========================================
-- DONE!
-- ========================================
-- After running this script:
-- 1. Log out of the admin panel
-- 2. Clear browser cache (Ctrl+Shift+Delete)
-- 3. Log in again
-- 4. Check browser console (F12) for debug messages
-- ========================================
