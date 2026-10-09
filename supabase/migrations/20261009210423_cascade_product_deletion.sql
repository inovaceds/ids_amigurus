alter table public.inventory_movements
drop constraint inventory_movements_product_id_fkey;

alter table public.inventory_movements
add constraint inventory_movements_product_id_fkey
foreign key (product_id)
references public.products(id)
on delete cascade;
