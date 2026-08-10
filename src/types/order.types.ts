export interface Order {
  id: string;
  buyer_id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_address: Record<string, any>;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  variant_id: number;
  quantity: number;
  unit_price: number;
}
