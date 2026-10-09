create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

insert into public.categories (name, slug, description) values
  ('Sin categoría', 'sin-categoria', 'Productos pendientes de clasificación'),
  ('Amigurumis', 'amigurumis', 'Personajes y animalitos tejidos a mano'),
  ('Llaveros', 'llaveros', 'Piezas pequeñas para llevar contigo'),
  ('Decoración', 'decoracion', 'Piezas tejidas para decorar espacios'),
  ('Personalizados', 'personalizados', 'Creaciones elaboradas bajo pedido');

alter table public.products
add column category_id uuid references public.categories(id) on delete restrict;

update public.products
set category_id = (select id from public.categories where slug = 'sin-categoria')
where category_id is null;

alter table public.products alter column category_id set not null;
create index products_category_status_idx on public.products(category_id, status, created_at desc);

alter table public.categories enable row level security;
revoke all on table public.categories from anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;

create policy "Active categories are public"
on public.categories for select
to anon, authenticated
using (active or public.is_admin());

create policy "Admins can create categories"
on public.categories for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update categories"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using (public.is_admin());
