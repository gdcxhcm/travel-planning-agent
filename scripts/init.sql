-- ============================================================================
-- Travel Planning Agent MVP - Supabase initialization script
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  origin text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric not null check (budget > 0),
  preferences jsonb not null default '[]'::jsonb,
  pace text not null check (pace in ('relaxed', 'standard', 'intensive')) default 'standard',
  special_requests text,
  title text not null,
  summary text not null,
  total_budget numeric not null default 0,
  tips jsonb not null default '[]'::jsonb,
  status text not null check (status in ('draft', 'generating', 'success', 'failed', 'exported')) default 'success',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  day_index int not null check (day_index > 0),
  title text not null,
  summary text not null,
  day_budget numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days(id) on delete cascade,
  start_time text not null,
  end_time text not null,
  place_name text not null,
  category text not null,
  notes text not null,
  estimated_cost numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.planner_runs (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references public.trip_plans(id) on delete set null,
  provider text not null,
  latency_ms int not null default 0,
  status text not null check (status in ('success', 'failed')),
  error_message text,
  destination text,
  created_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_trip_plans_updated_at on public.trip_plans;
create trigger update_trip_plans_updated_at
  before update on public.trip_plans
  for each row
  execute function public.update_updated_at_column();

create index if not exists idx_trip_plans_created_at on public.trip_plans(created_at desc);
create index if not exists idx_trip_plans_destination on public.trip_plans(destination);
create index if not exists idx_itinerary_days_trip_plan_id on public.itinerary_days(trip_plan_id);
create index if not exists idx_itinerary_items_day_id on public.itinerary_items(itinerary_day_id);
create index if not exists idx_planner_runs_created_at on public.planner_runs(created_at desc);

-- Development/demo permissions. For a public production app, enable RLS and add user-based policies.
alter table public.trip_plans disable row level security;
alter table public.itinerary_days disable row level security;
alter table public.itinerary_items disable row level security;
alter table public.planner_runs disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.trip_plans to anon, authenticated;
grant select, insert, update, delete on public.itinerary_days to anon, authenticated;
grant select, insert, update, delete on public.itinerary_items to anon, authenticated;
grant select, insert on public.planner_runs to anon, authenticated;
