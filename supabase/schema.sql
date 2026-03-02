-- TimePlanner Pro schema (Supabase/PostgreSQL)
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  color text not null default '#2563eb',
  start_time timestamptz not null,
  end_time timestamptz not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_recurring boolean not null default false,
  recurrence_pattern text not null default 'once',
  reminder_minutes int,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  structure_json jsonb not null default '[]'::jsonb
);

alter table public.schedules enable row level security;
alter table public.tasks enable row level security;
alter table public.templates enable row level security;

create policy "users_can_manage_own_schedules" on public.schedules
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users_can_manage_own_tasks" on public.tasks
for all using (
  exists (
    select 1 from public.schedules s
    where s.id = schedule_id and s.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.schedules s
    where s.id = schedule_id and s.user_id = auth.uid()
  )
);

create policy "users_can_manage_own_templates" on public.templates
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);