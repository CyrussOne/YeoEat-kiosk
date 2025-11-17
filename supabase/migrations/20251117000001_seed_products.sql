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
