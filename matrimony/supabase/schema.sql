-- ============================================================
-- Matrimony App – Phase 1 MVP Schema
-- Run this in the Supabase SQL editor to bootstrap the DB
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);
alter table public.users enable row level security;
create policy "Users can read own row" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own row" on public.users
  for update using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table public.profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid unique not null references public.users(id) on delete cascade,
  name              text not null,
  dob               date not null,
  gender            text not null check (gender in ('male', 'female', 'other')),
  height_cm         int,                    -- e.g. 170
  education         text,
  occupation        text,
  income_range      text,                   -- e.g. '5-10 LPA'
  city              text,
  state             text,
  community         text,                   -- e.g. 'Marathi', 'Punjabi'
  mother_tongue     text,
  religion          text,
  about_me          text,
  photos            text[] default '{}',    -- array of storage URLs
  profile_status    text not null default 'draft'
                      check (profile_status in ('draft', 'pending', 'active', 'suspended')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Active profiles are publicly readable" on public.profiles
  for select using (profile_status = 'active' or auth.uid() = user_id);
create policy "Owner can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Owner can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- FAMILY DETAILS
-- ─────────────────────────────────────────────
create table public.family_details (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid unique not null references public.profiles(id) on delete cascade,
  father_occupation    text,
  mother_occupation    text,
  siblings             text,               -- e.g. '1 brother, 1 sister'
  family_type          text check (family_type in ('nuclear', 'joint', 'extended')),
  family_values        text check (family_values in ('traditional', 'moderate', 'liberal')),
  native_place         text,
  created_at           timestamptz not null default now()
);
alter table public.family_details enable row level security;
create policy "Readable by profile owner or active-profile viewers" on public.family_details
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
      and (p.profile_status = 'active' or p.user_id = auth.uid())
    )
  );
create policy "Owner can manage family details" on public.family_details
  for all using (
    exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- PARTNER PREFERENCES
-- ─────────────────────────────────────────────
create table public.partner_preferences (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid unique not null references public.profiles(id) on delete cascade,
  age_min           int default 21,
  age_max           int default 35,
  height_min_cm     int,
  height_max_cm     int,
  education_pref    text[],               -- array of acceptable values
  community_pref    text[],
  city_pref         text[],
  income_pref       text,
  religion_pref     text[],
  family_type_pref  text[],
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.partner_preferences enable row level security;
create policy "Owner can manage preferences" on public.partner_preferences
  for all using (
    exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
create policy "Active profiles preferences readable" on public.partner_preferences
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
      and (p.profile_status = 'active' or p.user_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────
-- INTERESTS (Express Interest / Like)
-- ─────────────────────────────────────────────
create table public.interests (
  id           uuid primary key default uuid_generate_v4(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'declined')),
  message      text,                      -- optional note with interest
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (sender_id, receiver_id)
);
alter table public.interests enable row level security;
create policy "Parties can read their interests" on public.interests
  for select using (
    exists (
      select 1 from public.profiles p
      where (p.id = sender_id or p.id = receiver_id) and p.user_id = auth.uid()
    )
  );
create policy "Sender can insert interest" on public.interests
  for insert with check (
    exists (select 1 from public.profiles p where p.id = sender_id and p.user_id = auth.uid())
  );
create policy "Receiver can update interest status" on public.interests
  for update using (
    exists (select 1 from public.profiles p where p.id = receiver_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- MESSAGES (only after mutual accept)
-- ─────────────────────────────────────────────
create table public.messages (
  id           uuid primary key default uuid_generate_v4(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  content      text not null,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.messages enable row level security;
-- Only allow messaging between mutually accepted interests
create policy "Can send message only on mutual accept" on public.messages
  for insert with check (
    exists (
      select 1 from public.interests i
      where i.status = 'accepted'
      and (
        (i.sender_id = sender_id and i.receiver_id = receiver_id)
        or (i.sender_id = receiver_id and i.receiver_id = sender_id)
      )
    )
    and exists (
      select 1 from public.profiles p where p.id = sender_id and p.user_id = auth.uid()
    )
  );
create policy "Parties can read their messages" on public.messages
  for select using (
    exists (
      select 1 from public.profiles p
      where (p.id = sender_id or p.id = receiver_id) and p.user_id = auth.uid()
    )
  );
create policy "Receiver can mark read" on public.messages
  for update using (
    exists (select 1 from public.profiles p where p.id = receiver_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- PROFILE VIEWS (Who viewed my profile)
-- ─────────────────────────────────────────────
create table public.profile_views (
  id          uuid primary key default uuid_generate_v4(),
  viewer_id   uuid not null references public.profiles(id) on delete cascade,
  viewed_id   uuid not null references public.profiles(id) on delete cascade,
  viewed_at   timestamptz not null default now()
);
alter table public.profile_views enable row level security;
create policy "Profile owner can see who viewed them" on public.profile_views
  for select using (
    exists (select 1 from public.profiles p where p.id = viewed_id and p.user_id = auth.uid())
  );
create policy "Any active user can log a view" on public.profile_views
  for insert with check (
    exists (select 1 from public.profiles p where p.id = viewer_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- VERIFICATIONS
-- ─────────────────────────────────────────────
create table public.verifications (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  doc_type     text not null check (doc_type in ('aadhaar', 'pan', 'passport', 'selfie')),
  doc_url      text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  reviewed_by  uuid references public.users(id),
  notes        text,
  created_at   timestamptz not null default now(),
  verified_at  timestamptz
);
alter table public.verifications enable row level security;
create policy "Owner can submit verifications" on public.verifications
  for insert with check (
    exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
create policy "Owner can view own verifications" on public.verifications
  for select using (
    exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- REPORTS / BLOCKS
-- ─────────────────────────────────────────────
create table public.reports (
  id            uuid primary key default uuid_generate_v4(),
  reporter_id   uuid not null references public.profiles(id) on delete cascade,
  reported_id   uuid not null references public.profiles(id) on delete cascade,
  reason        text not null,
  details       text,
  status        text not null default 'open' check (status in ('open', 'reviewed', 'resolved')),
  created_at    timestamptz not null default now(),
  unique (reporter_id, reported_id)
);
alter table public.reports enable row level security;
create policy "Reporter can insert" on public.reports
  for insert with check (
    exists (select 1 from public.profiles p where p.id = reporter_id and p.user_id = auth.uid())
  );

create table public.blocks (
  id          uuid primary key default uuid_generate_v4(),
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
create policy "Owner can manage blocks" on public.blocks
  for all using (
    exists (select 1 from public.profiles p where p.id = blocker_id and p.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- TRIGGERS: updated_at auto-update
-- ─────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.touch_updated_at();
create trigger partner_pref_updated_at before update on public.partner_preferences
  for each row execute procedure public.touch_updated_at();
create trigger interests_updated_at before update on public.interests
  for each row execute procedure public.touch_updated_at();

-- ─────────────────────────────────────────────
-- TRIGGER: auto-insert into public.users on signup
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- STORAGE BUCKET (run separately or via Supabase dashboard)
-- ─────────────────────────────────────────────
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
