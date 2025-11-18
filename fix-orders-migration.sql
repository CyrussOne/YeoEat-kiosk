-- ====================================
-- YeloEat Kiosk - FIXED Database Setup
-- This version handles existing objects
-- ====================================

-- ====================================
-- STEP 1: Clean up existing objects (if any)
-- ====================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- ====================================
-- STEP 2: Create Orders Tables
-- ====================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  service_type TEXT NOT NULL CHECK (service_type IN ('eat-in', 'take-away')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cashier')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('en', 'de')),
  printed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_name_de TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- STEP 3: Create Indexes
-- ====================================

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ====================================
-- STEP 4: Create Trigger Function and Trigger
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- STEP 5: Enable Row Level Security
-- ====================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ====================================
-- STEP 6: Create RLS Policies
-- ====================================

-- RLS Policies for orders
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ====================================
-- STEP 7: Add Comments
-- ====================================

COMMENT ON TABLE orders IS 'Stores all kiosk orders with payment and service type information';
COMMENT ON TABLE order_items IS 'Line items for each order, linked to products';

-- ====================================
-- STEP 8: Verify Setup
-- ====================================

SELECT
  'orders' as table_name,
  COUNT(*) as row_count,
  'Table exists and RLS enabled' as status
FROM orders
UNION ALL
SELECT
  'order_items',
  COUNT(*),
  'Table exists and RLS enabled'
FROM order_items;

-- Check if products exist
SELECT
  'products' as table_name,
  COUNT(*) as active_products,
  'Products available for orders' as status
FROM products
WHERE is_active = true;
