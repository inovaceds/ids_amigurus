create type public.product_status as enum ('draft', 'published', 'archived');
create type public.inventory_movement_type as enum ('initial', 'entry', 'sale', 'adjustment', 'return');
create type public.app_role as enum ('admin');

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  price_cents bigint not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  type public.inventory_movement_type not null,
  quantity integer not null check (quantity <> 0),
  reason text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index products_status_created_at_idx on public.products(status, created_at desc);
create index product_images_product_position_idx on public.product_images(product_id, position);
create index inventory_movements_product_created_at_idx on public.inventory_movements(product_id, created_at desc);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;

revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_images from anon, authenticated;
revoke all on table public.inventory_movements from anon, authenticated;

grant select on table public.user_roles to authenticated;
grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;
grant select on table public.product_images to anon, authenticated;
grant insert, update, delete on table public.product_images to authenticated;
grant select, insert on table public.inventory_movements to authenticated;

create policy "Users can read their own role" on public.user_roles for select
to authenticated using (user_id = (select auth.uid()));
create policy "Published products are public" on public.products for select
to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins can create products" on public.products for insert
to authenticated with check (public.is_admin());
create policy "Admins can update products" on public.products for update
to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete products" on public.products for delete
to authenticated using (public.is_admin());

create policy "Published product images are public" on public.product_images for select
to anon, authenticated using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and (products.status = 'published' or public.is_admin())
  )
);
create policy "Admins can create product images" on public.product_images for insert
to authenticated with check (public.is_admin());
create policy "Admins can update product images" on public.product_images for update
to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete product images" on public.product_images for delete
to authenticated using (public.is_admin());

create policy "Admins can read inventory movements" on public.inventory_movements for select
to authenticated using (public.is_admin());
create policy "Admins can create inventory movements" on public.inventory_movements for insert
to authenticated with check (public.is_admin() and created_by = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Product images are publicly readable" on storage.objects for select
to anon, authenticated using (bucket_id = 'product-images');
create policy "Admins can upload product images" on storage.objects for insert
to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins can update stored product images" on storage.objects for update
to authenticated using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins can delete stored product images" on storage.objects for delete
to authenticated using (bucket_id = 'product-images' and public.is_admin());
