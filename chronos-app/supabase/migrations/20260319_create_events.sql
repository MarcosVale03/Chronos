create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  guest_limit integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint events_title_length check (char_length(trim(title)) > 0),
  constraint events_guest_limit_nonnegative check (guest_limit is null or guest_limit >= 0),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create index if not exists events_user_id_starts_at_idx
  on public.events (user_id, starts_at asc);

alter table public.events enable row level security;

create or replace function public.set_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_events_updated_at on public.events;

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_events_updated_at();

drop policy if exists "Users can view their own events" on public.events;
create policy "Users can view their own events"
on public.events
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own events" on public.events;
create policy "Users can insert their own events"
on public.events
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own events" on public.events;
create policy "Users can update their own events"
on public.events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own events" on public.events;
create policy "Users can delete their own events"
on public.events
for delete
using (auth.uid() = user_id);