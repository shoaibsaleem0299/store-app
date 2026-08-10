-- Categories
create table categories (
  id bigint primary key generated always as identity,
  name text not null,
  parent_id bigint references categories(id)
);

-- Products (parent)
create table products (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  category_id bigint references categories(id),
  brand text,
  base_images jsonb default '[]',
  status text default 'active',
  created_at timestamp default now()
);

-- Option types (Color, Size...) scoped to a product
create table option_types (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  name text not null,
  display_order int default 0
);

-- Option values (Red, Blue, S, M...)
create table option_values (
  id bigint primary key generated always as identity,
  option_type_id bigint references option_types(id) on delete cascade,
  value text not null,
  swatch_image text,
  display_order int default 0
);

-- Variants (actual SKUs)
create table variants (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete cascade,
  sku_code text unique not null,
  price numeric(10,2) not null,
  promo_price numeric(10,2),
  stock_qty int not null default 0,
  image_url text,
  is_active boolean default true
);

-- Variant <-> option value mapping
create table variant_option_values (
  variant_id bigint references variants(id) on delete cascade,
  option_value_id bigint references option_values(id) on delete cascade,
  primary key (variant_id, option_value_id)
);

-- Cart
create table cart_items (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id),
  variant_id bigint references variants(id),
  quantity int not null default 1,
  unique (user_id, variant_id)
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id),
  status text default 'pending',
  total_amount numeric(10,2) not null,
  shipping_address jsonb,
  created_at timestamp default now()
);

create table order_items (
  id bigint primary key generated always as identity,
  order_id uuid references orders(id) on delete cascade,
  variant_id bigint references variants(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

-- Helpful indexes
create index idx_variants_product_price on variants (product_id, price, stock_qty);
create index idx_option_types_product on option_types (product_id);
create index idx_option_values_type on option_values (option_type_id);

-- Row Level Security (enable + basic policies — expand per your auth rules)
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users manage their own cart" on cart_items
  for all using (auth.uid() = user_id);

create policy "Users see their own orders" on orders
  for select using (auth.uid() = buyer_id);
