export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  brand?: string;
  base_images: string[];
  status: "draft" | "active" | "inactive";
  created_at: string;
  variants?: Variant[];
  option_types?: OptionType[];
}

export interface OptionType {
  id: number;
  product_id: number;
  name: string;
  display_order: number;
}

export interface OptionValue {
  id: number;
  option_type_id: number;
  value: string;
  swatch_image?: string;
  display_order: number;
}

export interface Variant {
  id: number;
  product_id: number;
  sku_code: string;
  price: number;
  promo_price?: number;
  stock_qty: number;
  image_url?: string;
  is_active: boolean;
}

export interface CartItem {
  id: number;
  user_id: string;
  variant_id: number;
  quantity: number;
}
