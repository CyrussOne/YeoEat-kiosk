import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/menu";

// Fallback products when database is empty (for Lovable environments)
const FALLBACK_PRODUCTS: Product[] = [
  { id: '1', name: 'Classic Burger', name_de: 'Klassischer Burger', description: 'Juicy beef patty with cheese, lettuce, tomato', description_de: 'Saftiges Rindfleisch-Patty mit Käse, Salat, Tomate', price: 8.99, category: 'Burgers', image_url: '/assets/burger.jpg', is_active: true, stock_quantity: null, sku: 'BURGER-001', odoo_product_id: null },
  { id: '2', name: 'Double Cheeseburger', name_de: 'Doppelter Cheeseburger', description: 'Two beef patties with double cheese', description_de: 'Zwei Rindfleisch-Patties mit doppeltem Käse', price: 11.99, category: 'Burgers', image_url: '/assets/burger.jpg', is_active: true, stock_quantity: null, sku: 'BURGER-002', odoo_product_id: null },
  { id: '3', name: 'Veggie Burger', name_de: 'Veggie Burger', description: 'Plant-based patty with fresh vegetables', description_de: 'Pflanzliches Patty mit frischem Gemüse', price: 9.99, category: 'Burgers', image_url: '/assets/burger.jpg', is_active: true, stock_quantity: null, sku: 'BURGER-003', odoo_product_id: null },
  { id: '4', name: 'French Fries', name_de: 'Pommes Frites', description: 'Crispy golden fries', description_de: 'Knusprige goldene Pommes', price: 3.99, category: 'Sides', image_url: '/assets/fries.jpg', is_active: true, stock_quantity: null, sku: 'SIDES-001', odoo_product_id: null },
  { id: '5', name: 'Onion Rings', name_de: 'Zwiebelringe', description: 'Crispy battered onion rings', description_de: 'Knusprig panierte Zwiebelringe', price: 4.99, category: 'Sides', image_url: '/assets/fries.jpg', is_active: true, stock_quantity: null, sku: 'SIDES-002', odoo_product_id: null },
  { id: '6', name: 'Cola', name_de: 'Cola', description: 'Refreshing cold cola', description_de: 'Erfrischende kalte Cola', price: 2.99, category: 'Drinks', image_url: '/assets/drink.jpg', is_active: true, stock_quantity: null, sku: 'DRINK-001', odoo_product_id: null },
  { id: '7', name: 'Orange Juice', name_de: 'Orangensaft', description: 'Fresh squeezed orange juice', description_de: 'Frisch gepresster Orangensaft', price: 3.99, category: 'Drinks', image_url: '/assets/drink.jpg', is_active: true, stock_quantity: null, sku: 'DRINK-002', odoo_product_id: null },
  { id: '8', name: 'Ice Cream Sundae', name_de: 'Eisbecher', description: 'Vanilla ice cream with chocolate sauce', description_de: 'Vanilleeis mit Schokoladensauce', price: 4.99, category: 'Desserts', image_url: '/assets/dessert.jpg', is_active: true, stock_quantity: null, sku: 'DESSERT-001', odoo_product_id: null },
];

/**
 * Get all active products
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    // If database is empty, use fallback data
    if (!data || data.length === 0) {
      console.log('📦 Using fallback products (database is empty)');
      return FALLBACK_PRODUCTS;
    }

    return (data as Product[]) || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    console.log('📦 Using fallback products due to error');
    return FALLBACK_PRODUCTS;
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return (data as Product[]) || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (
  id: string
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

/**
 * Get all products (admin)
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) throw error;
    return (data as Product[]) || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

/**
 * Create a new product (admin)
 */
export const createProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

/**
 * Update a product (admin)
 */
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

/**
 * Delete a product (admin)
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

/**
 * Toggle product active status (admin)
 */
export const toggleProductStatus = async (
  id: string,
  isActive: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error toggling product status:", error);
    return false;
  }
};

/**
 * Search products by name (admin)
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,name_de.ilike.%${query}%`)
      .order("name");

    if (error) throw error;
    return (data as Product[]) || [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};
