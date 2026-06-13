alter table public.workout_sets
  add column if not exists distance numeric(8, 2) not null default 0 check (distance >= 0),
  add column if not exists distance_unit text not null default 'in';

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'workout_sets_distance_unit_check'
  ) then
    alter table public.workout_sets
      add constraint workout_sets_distance_unit_check
      check (distance_unit in ('in', 'cm', 'm'));
  end if;
end;
$$;
