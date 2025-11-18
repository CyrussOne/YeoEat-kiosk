-- ====================================
-- Create Admin User for YeloEat Kiosk
-- ====================================

-- STEP 1: Create the user account
-- You need to do this in the Supabase Dashboard > Authentication > Users
-- OR use the signup page at your-app-url/admin

-- Email: admin@yeloeat.com
-- Password: YeloEat2024!Admin

-- After creating the user, copy their User ID and run STEP 2 below

-- ====================================
-- STEP 2: Grant Admin Role
-- ====================================

-- Replace 'USER_ID_HERE' with the actual user ID from Supabase Auth
-- You can find it in: Supabase Dashboard > Authentication > Users > copy the ID

INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ====================================
-- VERIFY ADMIN ACCESS
-- ====================================

-- Check if admin role was created successfully
SELECT * FROM user_roles WHERE role = 'admin';

-- ====================================
-- ALTERNATIVE: If you already signed up
-- ====================================

-- If you already created an account via the signup page,
-- find your user ID and grant yourself admin access:

-- 1. Get your user ID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Copy your user ID and insert admin role:
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('your-user-id-here', 'admin');
