-- ====================================
-- YeloEat Kiosk - Complete Database Setup
-- Apply this SQL in Supabase SQL Editor
-- ====================================

-- Copy ALL contents and run in Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/tnqdlzbsbbyituoexhku

-- ====================================
-- PART 1: Create Orders Tables
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create updated_at trigger for orders
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

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

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
-- PART 2: Seed Products
-- ====================================

-- Insert initial menu products
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

-- ====================================
-- PART 4: Create Diagnostic Logs Table
-- ====================================

-- Create diagnostic_logs table for storing system diagnostics
CREATE TABLE IF NOT EXISTS diagnostic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT,
  platform TEXT NOT NULL,
  is_native BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  app_version TEXT,
  log_data JSONB NOT NULL,
  log_text TEXT NOT NULL,
  printer_status TEXT,
  supabase_connected BOOLEAN,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for diagnostic logs
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_created_at ON diagnostic_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_platform ON diagnostic_logs(platform);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_device_id ON diagnostic_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_logs_error_count ON diagnostic_logs(error_count);

-- ====================================
-- SUCCESS! Database is ready
-- ====================================

-- Verify setup
SELECT 'Orders table created' as status, COUNT(*) as count FROM orders
UNION ALL
SELECT 'Order items table created', COUNT(*) FROM order_items
UNION ALL
SELECT 'Products seeded', COUNT(*) FROM products WHERE is_active = true;
