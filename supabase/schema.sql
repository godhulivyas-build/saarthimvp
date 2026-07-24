-- Sarthi: Buyer Directory (Sarthi Network)
-- Run this once in Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run).

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  buyer_type text not null check (
    buyer_type in ('wholesaler', 'restaurant', 'hotel', 'retail_chain', 'processor', 'trader', 'cold_storage')
  ),
  state text not null,
  district text not null,
  village_or_area text,
  lat double precision,
  lng double precision,
  contact_phone text not null,
  contact_name text,
  -- crops: [{ "crop": "Tomato", "pricePerQuintal": 2100, "updatedAt": "2026-07-22T00:00:00Z" }, ...]
  crops jsonb not null default '[]'::jsonb,
  notes text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.buyers enable row level security;

-- Public discovery: anyone (including anonymous farmers browsing) can read buyer listings.
create policy "buyers are publicly readable"
  on public.buyers for select
  using (true);

-- Self-onboarding: any trader/restaurant/mall can register themselves without an account.
-- New rows default verified = false; you verify manually in the Table Editor once you've
-- confirmed the business is real (phone call, WhatsApp, etc.) before promoting trust in the UI.
create policy "anyone can self-onboard as a buyer"
  on public.buyers for insert
  with check (true);

create index if not exists buyers_district_idx on public.buyers (district);

-- Sarthi: Farmer Listings (the mirror side — what farmers have to sell)
-- Browsed by traders, restaurants, malls, AND individual households who want
-- fresh produce directly from farmers.

create table if not exists public.farmer_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_name text not null,
  contact_phone text not null,
  state text not null,
  district text not null,
  village_or_area text,
  lat double precision,
  lng double precision,
  crop text not null,
  quantity_quintal double precision not null,
  asking_price_per_quintal double precision not null,
  ready_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.farmer_listings enable row level security;

-- Public discovery: anyone (traders, restaurants, or individual buyers) can browse listings.
create policy "farmer listings are publicly readable"
  on public.farmer_listings for select
  using (true);

-- Self-listing: any farmer can list their produce without an account.
create policy "anyone can self-list produce"
  on public.farmer_listings for insert
  with check (true);

create index if not exists farmer_listings_district_idx on public.farmer_listings (district);
create index if not exists farmer_listings_crop_idx on public.farmer_listings (crop);

-- Sarthi: Transporters (drivers/vehicle owners who move produce from farm to buyer)

create table if not exists public.transporters (
  id uuid primary key default gen_random_uuid(),
  driver_name text not null,
  vehicle_type text not null check (
    vehicle_type in ('mini_truck', 'pickup', 'tractor_trolley', 'large_truck', 'auto')
  ),
  capacity_quintal double precision not null,
  price_per_km double precision,
  price_per_quintal double precision,
  state text not null,
  district text not null,
  village_or_area text,
  lat double precision,
  lng double precision,
  contact_phone text not null,
  notes text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transporters enable row level security;

create policy "transporters are publicly readable"
  on public.transporters for select
  using (true);

create policy "anyone can self-register as a transporter"
  on public.transporters for insert
  with check (true);

create index if not exists transporters_district_idx on public.transporters (district);
