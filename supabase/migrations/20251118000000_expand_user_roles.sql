-- Expand user roles from (admin, user) to include more granular roles
-- This migration safely updates the app_role enum

-- Step 1: Create new enum with all roles
DO $$
BEGIN
  -- Drop and recreate the enum type with new values
  -- First, we need to handle existing data

  -- Create a temporary type
  CREATE TYPE app_role_new AS ENUM ('admin', 'manager', 'cashier', 'cook', 'staff', 'user');

  -- Alter the column to use the new type
  ALTER TABLE user_roles
    ALTER COLUMN role TYPE app_role_new
    USING role::text::app_role_new;

  -- Drop the old enum and rename the new one
  DROP TYPE app_role;
  ALTER TYPE app_role_new RENAME TO app_role;

EXCEPTION
  WHEN duplicate_object THEN
    -- If the types already exist, just continue
    NULL;
END $$;

-- Step 2: Update the has_role function to work with new roles
DROP FUNCTION IF EXISTS has_role(Database.public.Enums.app_role, UUID);
CREATE OR REPLACE FUNCTION has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a function to check if user has any admin-level access
CREATE OR REPLACE FUNCTION is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update RLS policies to allow managers to view orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins and managers can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager', 'cashier')
    )
  );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins and staff can update orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager', 'cook', 'cashier')
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Staff can view all order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'manager', 'cashier', 'cook')
    )
  );

-- Step 5: Add role descriptions table for documentation
CREATE TABLE IF NOT EXISTS role_descriptions (
  role app_role PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  permissions TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert role descriptions
INSERT INTO role_descriptions (role, display_name, description, permissions) VALUES
  ('admin', 'Administrator', 'Full system access - can manage all settings, users, products, and orders',
   ARRAY['manage_users', 'manage_products', 'manage_orders', 'view_reports', 'manage_settings', 'manage_roles']),
  ('manager', 'Manager', 'Can manage products, orders, and view reports but cannot manage users or system settings',
   ARRAY['manage_products', 'manage_orders', 'view_reports', 'manage_promotions']),
  ('cashier', 'Cashier', 'Can process orders and view order history',
   ARRAY['view_orders', 'update_order_status', 'process_payments']),
  ('cook', 'Cook/Kitchen Staff', 'Can view and update order status for kitchen operations',
   ARRAY['view_orders', 'update_order_status']),
  ('staff', 'Staff', 'Basic staff access - can view orders and products',
   ARRAY['view_orders', 'view_products']),
  ('user', 'User', 'Regular user access (for future features)',
   ARRAY['place_orders'])
ON CONFLICT (role) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Add comments
COMMENT ON TYPE app_role IS 'User roles: admin (full access), manager (manage operations), cashier (process orders), cook (kitchen), staff (view only), user (customer)';
COMMENT ON TABLE role_descriptions IS 'Describes each role and their permissions for the admin UI';
