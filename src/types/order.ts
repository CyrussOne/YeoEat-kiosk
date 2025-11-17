export interface Order {
  id: string;
  order_number: string;
  service_type: 'eat-in' | 'take-away';
  payment_method: 'card' | 'cashier';
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  language: 'en' | 'de';
  printed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_name_de: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CreateOrderData {
  service_type: 'eat-in' | 'take-away';
  payment_method: 'card' | 'cashier';
  language: 'en' | 'de';
  items: Array<{
    product_id?: string;
    product_name: string;
    product_name_de?: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
