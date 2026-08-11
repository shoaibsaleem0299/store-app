-- Custom profile table to store user roles and metadata easily
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger function to synchronize auth.users and public.profiles, setting default role to customer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    'customer',
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );

  -- Set role as customer in auth.users app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'customer')
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- RPC to create product with its options and variants in a single transaction
CREATE OR REPLACE FUNCTION public.create_product_with_variants(
  p_name text,
  p_description text,
  p_category_id bigint,
  p_brand text,
  p_base_images jsonb,
  p_option_types jsonb,  -- Array of: { "name": "Color", "values": ["Red", "Blue"] }
  p_variants jsonb       -- Array of: { "sku_code": "...", "price": 10.0, "promo_price": 8.0, "stock_qty": 100, "image_url": "...", "options": { "Color": "Red" } }
)
RETURNS bigint AS $$
DECLARE
  v_product_id bigint;
  v_type_record jsonb;
  v_value_record jsonb;
  v_variant_record jsonb;
  v_type_id bigint;
  v_value_id bigint;
  v_variant_id bigint;
  v_option_name text;
  v_option_val text;
  v_temp_val_id bigint;
BEGIN
  -- 1. Insert product
  INSERT INTO public.products (name, description, category_id, brand, base_images, status)
  VALUES (p_name, p_description, p_category_id, p_brand, p_base_images, 'active')
  RETURNING id INTO v_product_id;

  -- Create temporary table to map names to IDs
  CREATE TEMP TABLE temp_option_value_map (
    type_name text,
    value_name text,
    value_id bigint
  ) ON COMMIT DROP;

  -- 2. Insert option types and option values
  FOR v_type_record IN SELECT * FROM jsonb_array_elements(p_option_types) LOOP
    INSERT INTO public.option_types (product_id, name)
    VALUES (v_product_id, v_type_record->>'name')
    RETURNING id INTO v_type_id;

    FOR v_value_record IN SELECT * FROM jsonb_array_elements(v_type_record->'values') LOOP
      INSERT INTO public.option_values (option_type_id, value)
      VALUES (v_type_id, v_value_record#>>'{}')
      RETURNING id INTO v_value_id;

      INSERT INTO temp_option_value_map (type_name, value_name, value_id)
      VALUES (v_type_record->>'name', v_value_record#>>'{}', v_value_id);
    END LOOP;
  END LOOP;

  -- 3. Insert variants and variant_option_values
  FOR v_variant_record IN SELECT * FROM jsonb_array_elements(p_variants) LOOP
    INSERT INTO public.variants (product_id, sku_code, price, promo_price, stock_qty, image_url, is_active)
    VALUES (
      v_product_id,
      v_variant_record->>'sku_code',
      (v_variant_record->>'price')::numeric(10,2),
      (v_variant_record->>'promo_price')::numeric(10,2),
      (v_variant_record->>'stock_qty')::int,
      v_variant_record->>'image_url',
      true
    )
    RETURNING id INTO v_variant_id;

    -- Map variant option value relations
    FOR v_option_name, v_option_val IN SELECT * FROM jsonb_each_text(v_variant_record->'options') LOOP
      SELECT value_id INTO v_temp_val_id
      FROM temp_option_value_map
      WHERE type_name = v_option_name AND value_name = v_option_val;

      IF v_temp_val_id IS NOT NULL THEN
        INSERT INTO public.variant_option_values (variant_id, option_value_id)
        VALUES (v_variant_id, v_temp_val_id);
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to process order payment and adjust stock atomically
CREATE OR REPLACE FUNCTION public.process_order_payment(
  p_order_id uuid,
  p_status text
)
RETURNS boolean AS $$
DECLARE
  v_item record;
  v_stock int;
BEGIN
  -- If order already paid, exit early
  IF EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND status = 'paid') THEN
    RETURN true;
  END IF;

  -- Check stock for all items first
  FOR v_item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    SELECT stock_qty INTO v_stock FROM public.variants WHERE id = v_item.variant_id FOR UPDATE;
    IF v_stock IS NULL OR v_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for variant ID %', v_item.variant_id;
    END IF;
  END LOOP;

  -- Decrement stock
  FOR v_item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    UPDATE public.variants
    SET stock_qty = stock_qty - v_item.quantity
    WHERE id = v_item.variant_id;
  END LOOP;

  -- Update order status
  UPDATE public.orders
  SET status = p_status
  WHERE id = p_order_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to create order from user's cart atomically and clear cart
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_buyer_id uuid,
  p_shipping_address jsonb
)
RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_total numeric(10,2);
BEGIN
  -- 1. Calculate total amount (checking if cart is empty)
  SELECT COALESCE(SUM(COALESCE(v.promo_price, v.price) * c.quantity), 0) INTO v_total
  FROM public.cart_items c
  JOIN public.variants v ON c.variant_id = v.id
  WHERE c.user_id = p_buyer_id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cart is empty for user %', p_buyer_id;
  END IF;

  -- Add shipping cost if subtotal is below 5000 PKR
  IF v_total < 5000 THEN
    v_total := v_total + 250;
  END IF;

  -- 2. Insert order
  INSERT INTO public.orders (buyer_id, total_amount, shipping_address, status)
  VALUES (p_buyer_id, v_total, p_shipping_address, 'pending')
  RETURNING id INTO v_order_id;

  -- 3. Insert order items
  INSERT INTO public.order_items (order_id, variant_id, quantity, unit_price)
  SELECT v_order_id, c.variant_id, c.quantity, COALESCE(v.promo_price, v.price)
  FROM public.cart_items c
  JOIN public.variants v ON c.variant_id = v.id
  WHERE c.user_id = p_buyer_id;

  -- 4. Delete cart items
  DELETE FROM public.cart_items WHERE user_id = p_buyer_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

