# Bandhan — Matrimony MVP

A community-first matrimony platform built with **Next.js 16 App Router**, **Tailwind CSS**, and **Supabase**.

---

## Quick Start

```bash
cd matrimony
cp .env.local.example .env.local   # fill in Supabase keys
npm install
npm run dev                         # http://localhost:3000
```

Without Supabase keys the app runs fully on **mock data** — all interactions work in the browser using Zustand local state.

---

## Project Structure

```
matrimony/
├── app/
│   ├── (auth)/            # Login + Register pages
│   │   ├── login/
│   │   └── register/
│   └── (app)/             # Authenticated shell (with NavBar)
│       ├── dashboard/     # Home feed + quick stats
│       ├── search/        # Search + filters
│       ├── interests/     # Received / Sent / Mutual tabs
│       ├── messages/      # Conversation list
│       │   └── [id]/      # Individual chat thread
│       └── profile/
│           ├── create/    # 7-step onboarding wizard
│           ├── edit/      # Edit existing profile
│           ├── me/        # Own profile + settings
│           └── [id]/      # View any profile
├── components/
│   ├── ui/                # Button, Input, Select, Badge, Avatar, Card
│   ├── profile/           # ProfileCard
│   └── NavBar.tsx
├── lib/
│   ├── types.ts           # Domain types + constants (options lists)
│   ├── utils.ts           # cn(), calcAge(), fmtHeight(), timeAgo()
│   ├── store.ts           # Zustand store (auth + data + actions)
│   ├── mock-data.ts       # Demo profiles/interests/messages
│   ├── supabase.ts        # Browser Supabase client
│   └── supabase-server.ts # Server-side Supabase client (RSC/Route handlers)
└── supabase/
    └── schema.sql         # Complete Postgres schema with RLS policies
```

---

## Phase 1 Features (Done)

| Feature | Status |
|---|---|
| Auth UI (login / register) | ✅ |
| 7-step profile creation wizard | ✅ |
| Profile edit | ✅ |
| Profile detail view | ✅ |
| Search + filters (age, gender, community, religion, city, education) | ✅ |
| Express Interest / Accept / Decline | ✅ |
| Mutual matches | ✅ |
| Messaging (after mutual accept) | ✅ |
| NavBar with unread badges | ✅ |
| Profile completeness nudge | ✅ |
| Supabase schema + RLS policies | ✅ |

---

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Create a storage bucket called `photos` (public access)
4. Copy your **Project URL** and **anon key** into `.env.local`

### Replace mock data with real queries

The app is wired to swap in easily. In `lib/store.ts`, replace the mock seeds with `supabase.from('profiles').select(...)` calls. In each page, replace `useStore` reads with server-side fetches using `createServerSupabaseClient()`.

---

## Upcoming (Phase 2 → 4)

- **Phase 2**: ID verification (manual queue), photo moderation, report/block
- **Phase 3**: Horoscope/Kundali matching, "Who viewed me", saved searches + alerts
- **Phase 4**: Subscription tiers, Razorpay payments, admin dashboard

---

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS
- **State**: Zustand (client) + Supabase (server)
- **DB**: Postgres via Supabase with Row-Level Security
- **Auth**: Supabase Auth (email/password, extensible to OTP)
- **Storage**: Supabase Storage (photos bucket)
- **Icons**: Lucide React
- **Forms**: react-hook-form + zod (ready to wire in)
