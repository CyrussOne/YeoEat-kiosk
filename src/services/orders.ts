import { supabase } from "@/integrations/supabase/client";
import type { CreateOrderData, Order, OrderWithItems } from "@/types/order";
import { TAX_RATE } from "@/utils/constants";

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Calculate order totals including tax
 */
export const calculateOrderTotals = (items: CreateOrderData['items']) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const tax_amount = subtotal * TAX_RATE;
  const total = subtotal + tax_amount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax_amount: Number(tax_amount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

/**
 * Create a new order with items
 */
export const createOrder = async (
  data: CreateOrderData
): Promise<OrderWithItems> => {
  try {
    console.log("createOrder called with data:", data);

    const orderNumber = generateOrderNumber();
    console.log("Generated order number:", orderNumber);

    const totals = calculateOrderTotals(data.items);
    console.log("Calculated totals:", totals);

    const insertData = {
      order_number: orderNumber,
      service_type: data.service_type,
      payment_method: data.payment_method,
      language: data.language,
      ...totals,
    };
    console.log("Inserting order:", insertData);

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(insertData)
      .select()
      .single();

    console.log("Supabase insert response - data:", order, "error:", orderError);

    if (orderError) {
      console.error("❌ SUPABASE ORDER ERROR:");
      console.error("Error message:", orderError.message);
      console.error("Error code:", orderError.code);
      console.error("Error details:", orderError.details);
      console.error("Error hint:", orderError.hint);
      console.error("Full error object:", JSON.stringify(orderError, null, 2));
      throw orderError;
    }
    if (!order) throw new Error("Failed to create order");

    // Create order items
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_name_de: item.product_name_de || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: Number((item.unit_price * item.quantity).toFixed(2)),
    }));

    console.log("Inserting order items:", orderItems);

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    console.log("Supabase items insert response - data:", items, "error:", itemsError);

    if (itemsError) {
      console.error("❌ SUPABASE ORDER ITEMS ERROR:");
      console.error("Error message:", itemsError.message);
      console.error("Error code:", itemsError.code);
      console.error("Error details:", itemsError.details);
      console.error("Error hint:", itemsError.hint);
      console.error("Full error object:", JSON.stringify(itemsError, null, 2));
      throw itemsError;
    }
    if (!items) throw new Error("Failed to create order items");

    return {
      ...order,
      order_items: items,
    } as OrderWithItems;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Get order by ID with items
 */
export const getOrderById = async (
  orderId: string
): Promise<OrderWithItems | null> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;
    return order as OrderWithItems;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

/**
 * Get order by order number with items
 */
export const getOrderByNumber = async (
  orderNumber: string
): Promise<OrderWithItems | null> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .single();

    if (orderError) throw orderError;
    return order as OrderWithItems;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
};

/**
 * Mark order as printed
 */
export const markOrderAsPrinted = async (orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ printed: true })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking order as printed:", error);
    return false;
  }
};

/**
 * Get recent orders (admin)
 */
export const getRecentOrders = async (
  limit: number = 50
): Promise<OrderWithItems[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as OrderWithItems[]) || [];
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
};

/**
 * Get orders by status (admin)
 */
export const getOrdersByStatus = async (
  status: Order["status"]
): Promise<OrderWithItems[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as OrderWithItems[]) || [];
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return [];
  }
};

/**
 * Get order statistics (admin)
 */
export const getOrderStatistics = async () => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total, status, created_at");

    if (error) throw error;
    if (!orders) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = orders.filter(
      (order) => new Date(order.created_at) >= today
    );

    return {
      total_orders: orders.length,
      todays_orders: todaysOrders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total, 0),
      todays_revenue: todaysOrders.reduce((sum, order) => sum + order.total, 0),
      pending_orders: orders.filter((o) => o.status === "pending").length,
      completed_orders: orders.filter((o) => o.status === "completed").length,
    };
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return null;
  }
};
