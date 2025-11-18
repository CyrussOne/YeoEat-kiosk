# Supabase Setup Guide for YeoEat Kiosk

## 🎯 Quick Setup Checklist

- [ ] Create Supabase Storage bucket for product images
- [ ] Run user roles expansion migration
- [ ] Seed products table (optional)
- [ ] Create first admin user
- [ ] Assign admin role to first user
- [ ] Test image upload
- [ ] Test order creation

---

## 📦 Step 1: Create Storage Bucket

### Via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Settings:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **YES** (very important!)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*`
4. Click **"Create bucket"**

### Set Storage Policies (SQL Editor)

```sql
-- Policy 1: Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

---

## 🔐 Step 2: Run Database Migrations

### Migration 1: Expand User Roles

Go to **SQL Editor** and run:

```sql
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
DROP FUNCTION IF EXISTS has_role(app_role, UUID);
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
```

### Migration 2: Seed Products (Optional)

**Only run this if your products table is empty!**

```sql
-- Seed products table with initial menu data
INSERT INTO products (name, name_de, description, description_de, price, category, image_url, is_active, sku) VALUES
  -- Burgers
  ('Classic Burger', 'Klassischer Burger', 'Juicy beef patty with cheese, lettuce, tomato', 'Saftiges Rindfleisch-Patty mit Käse, Salat, Tomate', 8.99, 'Burgers', '/assets/burger.jpg', true, 'BURGER-001'),
  ('Double Cheeseburger', 'Doppelter Cheeseburger', 'Two beef patties with double cheese', 'Zwei Rindfleisch-Patties mit doppeltem Käse', 11.99, 'Burgers', '/assets/burger.jpg', true, 'BURGER-002'),
  ('Veggie Burger', 'Veggie Burger', 'Plant-based patty with fresh vegetables', 'Pflanzliches Patty mit frischem Gemüse', 9.99, 'Burgers', '/assets/burger.jpg', true, 'BURGER-003'),

  -- Sides
  ('French Fries', 'Pommes Frites', 'Crispy golden fries', 'Knusprige goldene Pommes', 3.99, 'Sides', '/assets/fries.jpg', true, 'SIDES-001'),
  ('Onion Rings', 'Zwiebelringe', 'Crispy battered onion rings', 'Knusprig panierte Zwiebelringe', 4.99, 'Sides', '/assets/fries.jpg', true, 'SIDES-002'),

  -- Drinks
  ('Cola', 'Cola', 'Refreshing cold cola', 'Erfrischende kalte Cola', 2.99, 'Drinks', '/assets/drink.jpg', true, 'DRINK-001'),
  ('Orange Juice', 'Orangensaft', 'Fresh squeezed orange juice', 'Frisch gepresster Orangensaft', 3.99, 'Drinks', '/assets/drink.jpg', true, 'DRINK-002'),

  -- Desserts
  ('Ice Cream Sundae', 'Eisbecher', 'Vanilla ice cream with chocolate sauce', 'Vanilleeis mit Schokoladensauce', 4.99, 'Desserts', '/assets/dessert.jpg', true, 'DESSERT-001')
ON CONFLICT (sku) DO NOTHING;
```

---

## 👤 Step 3: Create First Admin User

### Create Account

1. Go to `http://localhost:8080/admin` (or your production URL)
2. Click **"Sign Up"** tab
3. Enter:
   - Full Name: Your name
   - Email: your-email@example.com
   - Password: (minimum 6 characters)
4. Click **"Create Account"**
5. **Check your email** and click the confirmation link

### Assign Admin Role

After creating and confirming your account, run this in **SQL Editor**:

```sql
-- Step 1: Find your user ID
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- Step 2: Copy the ID from the result above and use it here
-- Replace 'YOUR-USER-ID-HERE' with the actual UUID
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'admin');

-- Step 3: Verify the role was assigned
SELECT
  p.email,
  p.full_name,
  ur.role
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'your-email@example.com';
```

### Alternative: Assign Role via Dashboard

If you prefer, you can also assign roles via the Supabase Dashboard:

1. Go to **Table Editor** → **user_roles**
2. Click **"Insert row"**
3. Fill in:
   - `user_id`: Copy from auth.users table
   - `role`: Select `admin`
4. Click **"Save"**

---

## ✅ Step 4: Verify Setup

### Test 1: Login

1. Go to `http://localhost:8080/admin`
2. Login with your credentials
3. You should be redirected to `/admin/dashboard`

### Test 2: Upload Image

1. Navigate to **Products**
2. Click **"Add Product"**
3. Try uploading an image
4. If it works, your storage is correctly configured!

### Test 3: Create Order

1. Go to kiosk homepage: `http://localhost:8080`
2. Select language
3. Select service type
4. Add items to cart
5. Complete checkout
6. Check **Orders** page in admin panel

---

## 🔍 Troubleshooting

### Error: "relation 'role_descriptions' does not exist"

**Solution**: Run Migration 1 (Expand User Roles) again

### Error: "Bucket 'product-images' does not exist"

**Solution**:
1. Go to Supabase Storage
2. Create bucket named `product-images`
3. Make sure it's set to **public**

### Error: "Row Level Security policy violation"

**Solution**: Run the policy update queries from Migration 1

### Error: "User is not authorized"

**Solution**:
1. Make sure you assigned admin role to your user
2. Verify by running:
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR-USER-ID';
```

### Images Upload but Don't Display

**Solution**:
1. Check bucket is set to **public**
2. Verify storage policies are applied
3. Check browser console for CORS errors

---

## 🎯 Post-Setup Tasks

After setup is complete:

1. **Change default passwords** for all admin accounts
2. **Add your actual products** with real images
3. **Test the entire flow** from kiosk to admin
4. **Configure printer settings** (if using physical printer)
5. **Set up company information** (coming soon feature)
6. **Train your staff** on using the admin panel

---

## 📝 Environment Variables

Make sure your `.env` file has these variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

**Never commit `.env` file to git!**

---

## 🚀 Production Deployment

Before deploying to production:

1. ✅ Run all migrations in production Supabase
2. ✅ Create production storage bucket
3. ✅ Set up production environment variables
4. ✅ Enable HTTPS (required for Supabase Auth)
5. ✅ Test thoroughly in production environment
6. ✅ Set up backups for your database
7. ✅ Configure domain for your Supabase project

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **Auth Guide**: https://supabase.com/docs/guides/auth
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

**Setup completed successfully?** You're ready to manage your kiosk! 🎉
