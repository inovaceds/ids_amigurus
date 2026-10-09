do $$
declare
  registered_users integer;
  initial_admin_id uuid;
begin
  select count(*), min(id::text)::uuid
  into registered_users, initial_admin_id
  from auth.users;

  if registered_users <> 1 then
    raise exception 'Expected exactly one registered user, found %', registered_users;
  end if;

  insert into public.user_roles (user_id, role)
  values (initial_admin_id, 'admin')
  on conflict (user_id) do update set role = excluded.role;
end;
$$;
