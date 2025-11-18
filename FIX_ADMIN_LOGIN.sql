-- Fix Admin Login Issue
-- This adds policies so users can read their own roles

-- Step 1: Allow users to read their own roles
CREATE POLICY IF NOT EXISTS "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Step 2: Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_roles';

-- Step 3: Test if you can now read your own role
-- Replace 'your-email@example.com' with your actual email
SELECT
  p.email,
  p.full_name,
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.id = auth.uid();
