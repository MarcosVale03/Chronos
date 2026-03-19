create table if not exists public.event_guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  rsvp_status text not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint event_guests_name_length check (char_length(trim(full_name)) > 0),
  constraint event_guests_rsvp_status check (rsvp_status in ('pending', 'yes', 'no', 'maybe'))
);

create index if not exists event_guests_event_id_idx
  on public.event_guests (event_id);

create index if not exists event_guests_user_id_idx
  on public.event_guests (user_id);

alter table public.event_guests enable row level security;

create or replace function public.set_event_guests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_event_guests_updated_at on public.event_guests;

create trigger set_event_guests_updated_at
before update on public.event_guests
for each row
execute function public.set_event_guests_updated_at();

drop policy if exists "Users can view their own event guests" on public.event_guests;
create policy "Users can view their own event guests"
on public.event_guests
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own event guests" on public.event_guests;
create policy "Users can insert their own event guests"
on public.event_guests
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events
    where events.id = event_id
      and events.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own event guests" on public.event_guests;
create policy "Users can update their own event guests"
on public.event_guests
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events
    where events.id = event_id
      and events.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own event guests" on public.event_guests;
create policy "Users can delete their own event guests"
on public.event_guests
for delete
using (auth.uid() = user_id);