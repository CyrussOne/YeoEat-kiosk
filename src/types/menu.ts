export interface MenuItem {
  id: string;
  name: string;
  nameDE?: string;
  description: string;
  descriptionDE?: string;
  price: number;
  image: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  name_de: string | null;
  description: string;
  description_de: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  sku: string;
  odoo_product_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
