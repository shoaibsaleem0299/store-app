CREATE OR REPLACE FUNCTION public.update_product_with_variants(
  p_product_id bigint,
  p_name text,
  p_description text,
  p_category_id bigint,
  p_brand text,
  p_base_images jsonb,
  p_option_types jsonb,
  p_variants jsonb
)
RETURNS void AS $$
DECLARE
  v_type_record jsonb;
  v_value_record jsonb;
  v_variant_record jsonb;
  v_type_id bigint;
  v_value_id bigint;
  v_variant_id bigint;
  v_option_name text;
  v_option_val text;
  v_temp_val_id bigint;
  v_incoming_ids bigint[];
BEGIN
  -- 1. Update basic product info
  UPDATE public.products
  SET name = p_name,
      description = p_description,
      category_id = p_category_id,
      brand = p_brand,
      base_images = p_base_images
  WHERE id = p_product_id;

  -- 2. Clear out old option types (this cascades to option_values and variant_option_values)
  DELETE FROM public.option_types WHERE product_id = p_product_id;

  -- Create temporary table to map names to IDs
  CREATE TEMP TABLE temp_option_value_map (
    type_name text,
    value_name text,
    value_id bigint
  ) ON COMMIT DROP;

  -- 3. Insert new option types and option values
  FOR v_type_record IN SELECT * FROM jsonb_array_elements(p_option_types) LOOP
    INSERT INTO public.option_types (product_id, name)
    VALUES (p_product_id, v_type_record->>'name')
    RETURNING id INTO v_type_id;

    FOR v_value_record IN SELECT * FROM jsonb_array_elements(v_type_record->'values') LOOP
      INSERT INTO public.option_values (option_type_id, value)
      VALUES (v_type_id, v_value_record#>>'{}')
      RETURNING id INTO v_value_id;

      INSERT INTO temp_option_value_map (type_name, value_name, value_id)
      VALUES (v_type_record->>'name', v_value_record#>>'{}', v_value_id);
    END LOOP;
  END LOOP;

  -- Extract all incoming IDs to an array
  SELECT array_agg((value->>'id')::bigint) INTO v_incoming_ids 
  FROM jsonb_array_elements(p_variants)
  WHERE (value->>'id') IS NOT NULL;

  -- 4. Mark removed variants as inactive
  IF v_incoming_ids IS NOT NULL THEN
    UPDATE public.variants
    SET is_active = false
    WHERE product_id = p_product_id AND id != ALL(v_incoming_ids);
  ELSE
    UPDATE public.variants
    SET is_active = false
    WHERE product_id = p_product_id;
  END IF;

  -- 5. Insert/Upsert variants and variant_option_values
  FOR v_variant_record IN SELECT * FROM jsonb_array_elements(p_variants) LOOP
    v_variant_id := NULL;

    IF (v_variant_record->>'id') IS NOT NULL THEN
      -- Update existing variant by ID
      UPDATE public.variants SET
        sku_code = v_variant_record->>'sku_code',
        price = (v_variant_record->>'price')::numeric(10,2),
        promo_price = (v_variant_record->>'promo_price')::numeric(10,2),
        stock_qty = (v_variant_record->>'stock_qty')::int,
        image_url = v_variant_record->>'image_url',
        is_active = true
      WHERE id = (v_variant_record->>'id')::bigint
      RETURNING id INTO v_variant_id;
    END IF;

    IF v_variant_id IS NULL THEN
      -- Insert new variant (or fallback if ID not found)
      INSERT INTO public.variants (product_id, sku_code, price, promo_price, stock_qty, image_url, is_active)
      VALUES (
        p_product_id,
        v_variant_record->>'sku_code',
        (v_variant_record->>'price')::numeric(10,2),
        (v_variant_record->>'promo_price')::numeric(10,2),
        (v_variant_record->>'stock_qty')::int,
        v_variant_record->>'image_url',
        true
      )
      ON CONFLICT (sku_code) DO UPDATE SET
        price = EXCLUDED.price,
        promo_price = EXCLUDED.promo_price,
        stock_qty = EXCLUDED.stock_qty,
        image_url = EXCLUDED.image_url,
        is_active = true
      RETURNING id INTO v_variant_id;
    END IF;

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

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
