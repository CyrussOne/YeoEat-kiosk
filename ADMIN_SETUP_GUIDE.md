# YeoEat Kiosk - Admin Backend Setup & User Guide

## 🎉 What's Been Built

A comprehensive admin backend system has been created for your YeoEat Kiosk with the following features:

### ✅ Completed Features:

1. **Product Management** (`/admin/products`)
   - Add, edit, and delete menu products
   - Upload product images to Supabase Storage
   - Multi-language support (English & German)
   - Activate/deactivate products
   - Categorize products (Burgers, Sides, Drinks, Desserts)
   - SKU and stock management

2. **Order Management** (`/admin/orders`)
   - View all orders in real-time
   - Filter orders by status (pending, preparing, ready, completed, cancelled)
   - Update order status directly from the admin panel
   - View detailed order information
   - Print receipts
   - Order statistics dashboard

3. **User Management** (`/admin/users`)
   - View all registered users
   - Assign roles to users (admin, manager, cashier, cook, staff, user)
   - Role-based access control
   - Remove roles from users

4. **Enhanced Dashboard** (`/admin/dashboard`)
   - Quick links to all admin pages
   - Statistics overview
   - Product and order counts

5. **Role System Expansion**
   - New roles: admin, manager, cashier, cook, staff, user
   - Each role has specific permissions
   - Role descriptions and permission documentation

---

## 🚀 Quick Start

### 1. Access Admin Panel

Open your browser and navigate to:
```
http://localhost:8080/admin
```

Or in production:
```
https://your-domain.com/admin
```

### 2. Create Admin Account

1. Click on the **"Sign Up"** tab
2. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
3. Click **"Create Account"**
4. Check your email for confirmation link
5. After confirming, you need to **manually assign admin role** (see Step 3)

### 3. Assign Admin Role (First Time Setup)

Since this is the first time, you need to manually assign the admin role via Supabase Dashboard:

1. Go to your **Supabase Dashboard** → SQL Editor
2. Run this query (replace `your-email@example.com` with your actual email):

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert admin role (use the ID from the query above)
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'admin');
```

3. Now you can log in with admin privileges!

---

## 📦 Supabase Setup Required

### Create Storage Bucket for Product Images

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** → **Create a new bucket**
3. Bucket name: `product-images`
4. **Public bucket**: ✅ Yes (check this box)
5. Click **"Create bucket"**

### Set Storage Policies

After creating the bucket, set these policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### Run Database Migrations

Run these migrations in your Supabase SQL Editor:

#### 1. Expand User Roles

```sql
-- Run the content from: /supabase/migrations/20251118000000_expand_user_roles.sql
-- This creates the new role system with 6 roles
```

#### 2. Seed Products (Optional - if database is empty)

```sql
-- Run the content from: /supabase/migrations/20251117000001_seed_products.sql
-- This populates your products table with demo data
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | Full system access | System administrator |
| **Manager** | Manage products, orders, promotions | Store manager |
| **Cashier** | View/update orders, process payments | Front desk staff |
| **Cook** | View/update order status | Kitchen staff |
| **Staff** | View orders and products | General staff |
| **User** | Basic access | Future customer features |

### Permission Matrix

| Permission | Admin | Manager | Cashier | Cook | Staff | User |
|------------|-------|---------|---------|------|-------|------|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Products | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Orders | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Promotions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Process Payments | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Order Status | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 📱 Admin Panel User Guide

### Product Management

#### Adding a New Product

1. Navigate to **Admin Panel** → **Products**
2. Click **"Add Product"** button
3. Fill in product details:
   - **Name (English)**: Required
   - **Name (German)**: Optional but recommended
   - **Description**: Both languages
   - **Price**: In Euros (e.g., 8.99)
   - **Category**: Select from dropdown
   - **Image**: Click to upload (JPG/PNG, max 5MB)
   - **SKU**: Optional product code
   - **Stock Quantity**: Leave empty for unlimited
4. Click **"Create Product"**

#### Editing a Product

1. Find the product in the table
2. Click the **pencil icon** (✏️)
3. Modify the details
4. Click **"Update Product"**

#### Activating/Deactivating Products

- Click the **power icon** (⚡) to toggle product status
- Inactive products won't appear in the kiosk menu

#### Deleting a Product

1. Click the **trash icon** (🗑️)
2. Confirm deletion
3. **Note**: This permanently deletes the product

### Order Management

#### Viewing Orders

1. Navigate to **Admin Panel** → **Orders**
2. Orders are displayed in a table with:
   - Order number
   - Date & time
   - Number of items
   - Service type (Eat In / Take Away)
   - Payment method
   - Total amount
   - Status

#### Filtering Orders

- Use the **search box** to find orders by order number
- Use the **status filter** dropdown to filter by status:
  - All Orders
  - Pending
  - Preparing
  - Ready
  - Completed
  - Cancelled

#### Updating Order Status

1. Click on the **status dropdown** for any order
2. Select the new status
3. Status automatically updates in real-time

#### Viewing Order Details

1. Click the **eye icon** (👁️) to view full order details
2. See all items, quantities, and prices
3. View customer information

#### Printing Receipts

1. Click the **receipt icon** (🧾) on any order
2. Browser print dialog will open
3. Print or save as PDF

### User Management

#### Viewing Users

1. Navigate to **Admin Panel** → **Users**
2. See all registered users with their roles

#### Assigning Roles

1. Click **"Assign Role"** button for a user
2. Select the role from the dropdown
3. Click **"Assign Role"**
4. User will immediately have the new permissions

#### Removing Roles

1. Click on the role badge (×) next to a user's name
2. Confirm removal
3. Role is immediately revoked

---

## 🔧 Troubleshooting

### Issue: Images Not Uploading

**Solution:**
1. Check that `product-images` bucket exists in Supabase Storage
2. Verify bucket is set to **public**
3. Check storage policies are correctly applied
4. Ensure your Supabase project has storage enabled

### Issue: Can't See Orders

**Solution:**
1. Verify you have admin, manager, or cashier role
2. Check RLS policies are correctly applied
3. Run the migrations to update policies

### Issue: Can't Assign Roles

**Solution:**
1. You must be logged in as an admin
2. Check that `role_descriptions` table exists
3. Run the user roles migration

### Issue: Products Not Showing in Kiosk

**Solution:**
1. Check product is marked as **active**
2. Verify product has a valid category
3. Check if products are in Supabase or using fallback data (check console logs)

---

## 🎯 Best Practices

### For Admins

1. **Backup regularly**: Export your database regularly
2. **Monitor orders**: Check the orders page multiple times per day
3. **Update product images**: Use high-quality images (300x300px minimum)
4. **Review user roles**: Regularly audit who has access to what

### For Managers

1. **Keep products updated**: Update prices and availability regularly
2. **Monitor inventory**: Use stock quantity field to track items
3. **Process orders promptly**: Update order status in real-time

### For Cashiers

1. **Check order status**: Always verify order status before processing payment
2. **Print receipts**: Always print receipt after payment
3. **Update status**: Mark orders as completed after handoff

---

## 🚀 Next Steps

The following features are planned for future development:

1. **Promotions Management** - Create discount campaigns
2. **Company Settings** - Customize business information
3. **Receipt Customization** - Design custom receipt layout
4. **Odoo Integration** - Sync with ERP system
5. **Analytics Dashboard** - Revenue charts and reports
6. **Multi-location Support** - Manage multiple kiosks
7. **Real-time Notifications** - Push notifications for new orders
8. **Customer App** - Mobile app for customers to order ahead

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check application logs in browser console (F12)

---

## 🔐 Security Notes

1. **Always use HTTPS in production**
2. **Never share admin credentials**
3. **Regularly update passwords**
4. **Review RLS policies periodically**
5. **Keep Supabase API keys secure** (never commit to git)
6. **Use environment variables** for sensitive data

---

## 📊 Database Schema Reference

### Main Tables

- **products** - Menu items with translations
- **orders** - Customer orders
- **order_items** - Order line items
- **user_roles** - User role assignments
- **profiles** - User profile information
- **role_descriptions** - Role definitions and permissions
- **promotions** - Promotional campaigns (not yet used)
- **company_settings** - Business configuration
- **printer_settings** - Printer configuration
- **receipt_layout** - Receipt customization

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
