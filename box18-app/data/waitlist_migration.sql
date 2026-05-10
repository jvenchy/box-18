create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  audience text not null check (audience in ('player', 'club', 'recruiter')),
  city text null,
  university text null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint waitlist_email_key unique (email)
);

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.public_waitlist_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from public.waitlist;
$$;

grant execute on function public.public_waitlist_count() to anon, authenticated;
