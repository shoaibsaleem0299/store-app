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
