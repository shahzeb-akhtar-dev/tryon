-- Supabase Database Schema for TryOn
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (synced with Supabase Auth)
create table if not exists public.users (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tryons table
create table if not exists public.tryons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(uid) on delete cascade not null,
  person_image_url text,
  garment_image_url text,
  result_image_url text,
  fashn_prediction_id text,
  openai_model text,
  openai_quality text,
  status text not null default 'ready',
  category text default 'auto',
  mode text default 'balanced',
  output_format text default 'jpeg',
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- Photos table (recent photos)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(uid) on delete cascade not null,
  image_url text not null,
  created_at timestamptz default now()
);

-- Garments table (saved garments)
create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(uid) on delete cascade not null,
  image_url text not null,
  name text not null,
  created_at timestamptz default now()
);

-- Single-column indexes
create index if not exists idx_tryons_user_id on public.tryons(user_id);
create index if not exists idx_tryons_status on public.tryons(status);
create index if not exists idx_photos_user_id on public.photos(user_id);
create index if not exists idx_garments_user_id on public.garments(user_id);

-- Composite indexes for common query patterns (user_id + created_at DESC)
create index if not exists idx_tryons_user_created on public.tryons(user_id, created_at desc);
create index if not exists idx_photos_user_created on public.photos(user_id, created_at desc);
create index if not exists idx_garments_user_created on public.garments(user_id, created_at desc);

-- Auto-update updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger on_tryons_updated
  before update on public.tryons
  for each row execute procedure public.handle_updated_at();

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.tryons enable row level security;
alter table public.photos enable row level security;
alter table public.garments enable row level security;

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = uid);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = uid);

-- Tryons policies
create policy "Users can view own tryons"
  on public.tryons for select
  using (auth.uid() = user_id);

create policy "Users can insert own tryons"
  on public.tryons for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tryons"
  on public.tryons for update
  using (auth.uid() = user_id);

create policy "Users can delete own tryons"
  on public.tryons for delete
  using (auth.uid() = user_id);

-- Photos policies
create policy "Users can view own photos"
  on public.photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on public.photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.photos for delete
  using (auth.uid() = user_id);

-- Garments policies
create policy "Users can view own garments"
  on public.garments for select
  using (auth.uid() = user_id);

create policy "Users can insert own garments"
  on public.garments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own garments"
  on public.garments for update
  using (auth.uid() = user_id);

create policy "Users can delete own garments"
  on public.garments for delete
  using (auth.uid() = user_id);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (uid, email, display_name, photo_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
