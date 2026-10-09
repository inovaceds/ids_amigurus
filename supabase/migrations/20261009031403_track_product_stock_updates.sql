create function public.record_product_stock_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.stock <> old.stock then
    insert into public.inventory_movements (
      product_id,
      type,
      quantity,
      reason,
      created_by
    ) values (
      new.id,
      'adjustment',
      new.stock - old.stock,
      'Ajuste desde la edición del producto',
      (select auth.uid())
    );
  end if;

  return new;
end;
$$;

create trigger products_record_stock_update
after update of stock on public.products
for each row
when (new.stock is distinct from old.stock)
execute function public.record_product_stock_update();
