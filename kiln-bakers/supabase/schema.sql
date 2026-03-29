-- Run this in Supabase SQL Editor

create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  description text,
  image text,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  bill_no text not null unique,
  items jsonb not null,
  subtotal numeric(10,2) not null default 0,
  discount_amt numeric(10,2) not null default 0,
  tax_amt numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  payment_status text not null default 'pending',
  payment_method text not null default 'Cash',
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id int primary key,
  store_name text not null,
  store_address text not null,
  store_phone text not null,
  tax_rate numeric(5,2) not null default 5,
  upi_id text not null,
  upi_name text not null,
  whatsapp_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table already exists, add the column (safe to run multiple times):
alter table app_settings add column if not exists whatsapp_number text not null default '';

insert into app_settings (id, store_name, store_address, store_phone, tax_rate, upi_id, upi_name, whatsapp_number)
values (1, 'Kiln Bakers', '12, Baker Street, Chennai – 600001', '+91 98765 43210', 5, 'kilnbakers@upi', 'Kiln Bakers', '')
on conflict (id) do nothing;

-- Optional: enable RLS and define policies to allow public anon read/write for this POS app.
-- For production, use authentication and stricter policies.
alter table products enable row level security;
alter table orders enable row level security;
alter table app_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'products' and policyname = 'allow_all_products') then
    create policy allow_all_products on products for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'allow_all_orders') then
    create policy allow_all_orders on orders for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_settings' and policyname = 'allow_all_settings') then
    create policy allow_all_settings on app_settings for all using (true) with check (true);
  end if;
end $$;
