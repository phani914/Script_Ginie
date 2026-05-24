create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits integer not null default 5,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  game text,
  video_type text,
  language_style text,
  length text,
  tone text,
  output text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id text,
  amount integer not null,
  credits_added integer not null,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.scripts enable row level security;
alter table public.payments enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read own scripts"
  on public.scripts for select
  using (auth.uid() = user_id);

create policy "Users can insert own scripts"
  on public.scripts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
