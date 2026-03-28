# StaySteward (formerly GuestVault)
## Developer Handoff Document
**Date:** March 28, 2026
**Prepared by:** Stelliform Digital
**Live URL:** guest-vault.vercel.app (to be migrated to staysteward.com)

---

## 1. WHAT THIS IS

StaySteward is a SaaS platform for Airbnb/VRBO hosts and property managers. It lets hosts:
1. **Capture guest emails** at check-in (WiFi password is the incentive)
2. **Sell upsells** (late checkout, airport transfer, grocery stocking, etc.) through a branded portal
3. **Automate post-stay marketing** (thank you emails, review requests, win-back campaigns)
4. **Track revenue** from upsells, email performance, and guest capture rates

The platform has three surfaces:
- **Host Dashboard** — where hosts manage properties, upsells, marketing, analytics
- **Guest Portal** — what guests see (check-in form, property info, upsell storefront)
- **Marketing Site** — homepage + pricing page for customer acquisition

---

## 2. TECH STACK

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | React 18, TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui | Dark theme, amber (#C9A84C) accent |
| Database | Supabase (PostgreSQL 15+) | Multi-tenant with Row Level Security |
| Auth | Supabase Auth | Email/password for hosts, token-based for guests |
| Payments | Stripe Connect (Express) | Test mode keys configured |
| Hosting | Vercel (Hobby tier) | Auto-deploy on push to main |
| Email | Resend (not yet configured) | Separate account from Stelliform |
| Storage | Supabase Storage | Property images, brand assets |

---

## 3. PROJECT STRUCTURE

```
staysteward/
├── src/
│   ├── app/
│   │   ├── (dashboard)/              # Host dashboard (requires auth)
│   │   │   ├── layout.tsx            # Auth check + DashboardShell wrapper
│   │   │   ├── page.tsx              # Dashboard overview (redirects from /)
│   │   │   ├── properties/page.tsx   # Property CRUD (create, list, edit, delete)
│   │   │   ├── reservations/page.tsx # Reservation management + portal link generation
│   │   │   ├── upsells/page.tsx      # Upsell template CRUD (8 pre-built starters)
│   │   │   ├── orders/page.tsx       # Order list + revenue stats
│   │   │   ├── marketing/page.tsx    # Email sequences + performance stats
│   │   │   ├── analytics/page.tsx    # KPIs: capture rate, revenue, email performance
│   │   │   ├── brand/page.tsx        # Color picker, logo, welcome message, live preview
│   │   │   └── settings/page.tsx     # Org info, portal URL, Stripe status, PMS placeholders
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Email/password login
│   │   │   └── signup/page.tsx       # 2-step: create account → name organization
│   │   │
│   │   ├── portal/[token]/page.tsx   # Guest-facing portal (no auth required)
│   │   │                              # Check-in form → WiFi reveal → upsell storefront
│   │   │                              # Stripe Elements checkout modal
│   │   │
│   │   ├── pricing/page.tsx          # 3-tier pricing page (Free/Growth/Pro)
│   │   ├── page.tsx                  # Root: logged in → dashboard, logged out → marketing homepage
│   │   ├── layout.tsx                # Root layout (dark theme, fonts)
│   │   └── middleware.ts             # Auth protection + routing
│   │
│   ├── app/api/
│   │   ├── properties/              # GET (list), POST (create)
│   │   ├── properties/[id]/         # GET, PATCH, DELETE (soft delete)
│   │   ├── reservations/            # GET (list), POST (create + portal token)
│   │   ├── upsell-templates/        # GET (list + starters), POST (create), PATCH (update)
│   │   ├── orders/                  # GET (list + stats)
│   │   ├── sequences/              # GET (list + starters), POST (create), PATCH (toggle)
│   │   ├── analytics/overview/     # GET (comprehensive metrics)
│   │   ├── brand/                  # GET, POST (brand config)
│   │   ├── portal/[token]/         # GET (load portal data)
│   │   ├── portal/[token]/checkin/ # POST (guest check-in submission)
│   │   └── portal/[token]/orders/  # POST (create upsell order + Stripe PaymentIntent)
│   │
│   ├── components/
│   │   ├── dashboard/DashboardShell.tsx  # Sidebar nav, mobile responsive, logout
│   │   ├── MarketingHome.tsx             # Homepage component
│   │   └── ui/                           # shadcn/ui: button, input, label, card, dialog, etc.
│   │
│   ├── lib/
│   │   ├── supabase/client.ts     # Browser Supabase client
│   │   ├── supabase/server.ts     # Server Supabase client (SSR cookie handling)
│   │   ├── supabase/admin.ts      # Service role client (bypasses RLS)
│   │   ├── stripe/client.ts       # Stripe client initialization
│   │   └── utils.ts               # Tailwind merge utilities
│   │
│   └── types/
│       └── database.ts            # TypeScript interfaces for all 12 tables
│
├── supabase/
│   └── migrations/
│       ├── 001_core_tables.sql    # organizations, properties, reservations, guests
│       ├── 002_upsell_tables.sql  # upsell_templates, property_upsells, upsell_orders
│       └── 003_email_tables.sql   # email_sequences, email_sequence_steps, email_sends
│
├── .env.local                     # Supabase + Stripe keys (not in repo)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. DATABASE SCHEMA

### 4.1 Core Tables (Migration 001)

**organizations** — Top-level tenant. One per host account.
```
id              uuid PK
name            text NOT NULL
slug            text UNIQUE NOT NULL
owner_user_id   uuid FK → auth.users(id)
plan            enum('free','growth','pro','enterprise')
stripe_account_id text
custom_domain   text
brand_config    jsonb  {primary_color, logo_url, font, welcome_message}
settings        jsonb  {timezone, currency, notifications}
created_at      timestamptz
updated_at      timestamptz
deleted_at      timestamptz  (GDPR soft delete)
```

**properties** — Individual rental units.
```
id              uuid PK
organization_id uuid FK → organizations
name            text NOT NULL
slug            text NOT NULL (unique within org)
address         jsonb  {street, city, state, zip, lat, lng}
description     text
images          jsonb[]  [{url, alt, order}]
property_info   jsonb  {wifi_name, wifi_pass, checkout_time, check_in_instructions, house_rules, parking, trash, emergency_contacts}
pms_source      text  ('hostaway' | 'guesty' | 'manual')
pms_external_id text
is_active       boolean DEFAULT true
deleted_at      timestamptz
```

**reservations** — Bookings linked to properties.
```
id              uuid PK
organization_id uuid FK
property_id     uuid FK → properties
channel         enum('airbnb','vrbo','direct','booking')
check_in        date NOT NULL
check_out       date NOT NULL
guest_count     integer
total_amount    decimal(10,2)
status          enum('confirmed','checked_in','checked_out','cancelled')
portal_token    text UNIQUE  (JWT for guest access — no account needed)
portal_accessed_at timestamptz
deleted_at      timestamptz
```

**guests** — Individual people per reservation.
```
id              uuid PK
organization_id uuid FK
reservation_id  uuid FK → reservations
email           text
email_verified  boolean
phone           text
first_name      text
last_name       text
is_primary      boolean  (the booker)
marketing_consent boolean
consent_timestamp timestamptz
consent_ip      inet
source          enum('check_in_portal','pms_sync','wifi','manual')
tags            text[]  (['business','family','repeat'])
deleted_at      timestamptz
```

### 4.2 Upsell Tables (Migration 002)

**upsell_templates** — Services hosts can sell.
```
id              uuid PK
organization_id uuid FK
category        enum('checkout','transport','grocery','cleaning','experience','equipment','chef','custom')
name            text NOT NULL
description     text
image_url       text
price_cents     integer NOT NULL
price_type      enum('fixed','per_person','per_night')
host_revenue_pct decimal DEFAULT 100
is_active       boolean DEFAULT true
display_order   integer
deleted_at      timestamptz
```

**property_upsells** — Junction: which upsells at which properties.
```
property_id       uuid FK → properties
upsell_template_id uuid FK → upsell_templates
override_price    integer (optional per-property price)
is_active         boolean
PRIMARY KEY (property_id, upsell_template_id)
```

**upsell_orders** — Guest purchases.
```
id                  uuid PK
organization_id     uuid FK
reservation_id      uuid FK
guest_id            uuid FK
upsell_template_id  uuid FK
quantity            integer DEFAULT 1
amount_cents        integer NOT NULL
platform_fee_cents  integer NOT NULL  (StaySteward's cut — 5% default)
host_payout_cents   integer NOT NULL
stripe_payment_id   text
stripe_transfer_id  text
status              enum('pending','paid','fulfilled','refunded','failed')
fulfilled_at        timestamptz
deleted_at          timestamptz
```

### 4.3 Email Tables (Migration 003)

**email_sequences** — Automated drip sequences.
```
id              uuid PK
organization_id uuid FK
name            text NOT NULL
trigger_type    enum('post_checkout','post_booking','anniversary','winback_30d','winback_60d','winback_90d','seasonal','manual')
is_active       boolean DEFAULT true
deleted_at      timestamptz
```

**email_sequence_steps** — Individual emails in a sequence.
```
id              uuid PK
sequence_id     uuid FK → email_sequences
step_order      integer
delay_hours     integer  (hours after trigger)
channel         enum('email','sms')
subject         text
body_template   text  (with {{merge_tags}})
```

**email_sends** — Delivery tracking.
```
id                uuid PK
organization_id   uuid FK
guest_id          uuid FK
sequence_step_id  uuid FK
status            enum('queued','sent','delivered','opened','clicked','bounced','failed','unsubscribed')
resend_message_id text
sent_at           timestamptz
opened_at         timestamptz
clicked_at        timestamptz
```

### 4.4 Security

- **Every table** has RLS (Row Level Security) enabled
- **RLS policies** enforce org-level isolation: `organization_id IN (SELECT id FROM organizations WHERE owner_user_id = auth.uid())`
- **Soft deletes** on all tables via `deleted_at` — RLS policies exclude soft-deleted rows
- **Guest portal** uses admin client (service role) since guests don't have accounts
- **Updated_at triggers** on all tables via `update_updated_at()` function

---

## 5. KEY USER FLOWS

### 5.1 Guest Check-In (THE CRITICAL PATH)

This is the most important flow — it's how guest emails are captured.

```
Host sends check-in link via Airbnb message
  ↓
Guest clicks link → /portal/{token}
  ↓
Branded landing page (host's colors, logo, property name)
Above the fold: "Welcome!" + check-in button
  ↓
Check-in form: first name, last name, email*, phone, marketing consent
  ↓
Email validated → form submitted → reservation status → checked_in
  ↓
WiFi password + property info REVEALED (this is the incentive)
  ↓
Upsell storefront shown below property info
  ↓
"Add travel companion" share link for capturing entire party
```

### 5.2 Upsell Purchase

```
Guest browses upsell cards in portal
  ↓
Clicks "Add" on an upsell (e.g., Late Checkout $35)
  ↓
Stripe Elements modal opens (Apple Pay / Google Pay / card)
  ↓
POST /api/portal/{token}/orders → creates PaymentIntent
  ↓
Guest completes payment → order recorded → success toast
  ↓
Platform fee (5%) deducted, rest goes to host's Stripe account
```

### 5.3 Host Onboarding

```
Sign up (email/password) → Name organization → Dashboard
  ↓
Add first property (name, address, WiFi, house rules)
  ↓
Configure upsells (8 pre-built templates or custom)
  ↓
Connect Stripe (Express account — 5 min setup)
  ↓
Customize branding (color, logo, welcome message)
  ↓
Get portal link → paste in PMS auto-message to guests
```

### 5.4 Post-Stay Remarketing

```
Reservation status → checked_out (via PMS webhook or manual)
  ↓
Day 1:  Thank you + review request email
Day 7:  Post-stay survey
Day 30: Win-back #1 — "Book direct and save 15%"
Day 90: Win-back #2 — seasonal angle
Day 365: Stay anniversary — "One year ago today..."
```

---

## 6. WHAT'S BUILT vs. WHAT'S NOT

### Built (MVP Complete)
| Feature | Status | Notes |
|---------|--------|-------|
| Auth (signup + login) | ✅ Working | 2-step signup, Supabase Auth |
| Properties CRUD | ✅ Working | Create, list, edit, soft delete |
| Reservations + portal token | ✅ Working | Manual creation, unique tokens |
| Guest portal + check-in | ✅ Working | Branded, WiFi reveal, tested end-to-end |
| Upsell templates (8 starters) | ✅ Working | Quick-add cards, custom creation |
| Upsell storefront in portal | ✅ Working | Shows after check-in |
| Stripe Elements checkout | ✅ Working | PaymentIntent + 5% platform fee |
| Email sequences (4 pre-built) | ✅ Working | Dashboard + activation + timeline view |
| Analytics dashboard | ✅ Working | Capture rate, revenue, email metrics |
| Orders page | ✅ Working | Revenue stats, order list |
| Brand builder | ✅ Working | Color picker, logo, welcome message, live preview |
| Settings page | ✅ Working | Org info, portal URL, Stripe status |
| Marketing homepage | ✅ Working | Hero, problem stats, how it works, features |
| Pricing page | ✅ Working | 3 tiers, unit economics, FAQ |
| Middleware (auth routing) | ✅ Working | Protected dashboard, public portal |
| Travel companion sharing | ✅ Working | Copy link for additional guests |

### Not Built (Post-MVP)
| Feature | Priority | Notes |
|---------|----------|-------|
| Resend email integration | P0 | Need separate Resend account. Templates built, API not wired. |
| Stripe Connect onboarding | P1 | Button exists but doesn't initiate OAuth flow yet |
| Hostaway PMS integration | P1 | OAuth + webhook + polling sync |
| Stripe billing (host subscriptions) | P1 | Growth/Pro tier billing |
| Email verification (ZeroBounce) | P2 | Real-time on check-in form |
| Twilio SMS | P2 | Check-in reminders, order confirmations |
| Custom domain support | P3 | Vercel API for domain management |
| WiFi splash page integration | P3 | Hardware partnerships |
| Service provider marketplace | P3 | 3rd party vendor self-onboarding |
| Admin panel (internal ops) | P3 | For StaySteward team to manage all tenants |

---

## 7. ENVIRONMENT & DEPLOYMENT

### Accounts
| Service | URL | Tier |
|---------|-----|------|
| GitHub | github.com/Gunna1982/-GuestVault | Public (required for Vercel Hobby) |
| Vercel | guest-vault.vercel.app | Hobby (free) |
| Supabase | nfqxorpgtxyjuououhwl.supabase.co | Free |
| Stripe | Test mode | Test keys in .env.local |

### Environment Variables (in .env.local + Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://nfqxorpgtxyjuououhwl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=https://guest-vault.vercel.app
```

### Development
- **Dev server:** `/var/www/guestvault` on remote Ubuntu server
- **Port:** 3001 (Stelliform uses 3000)
- **Git push:** `cd /var/www/guestvault && git add -A && git commit -m "msg" && git push origin main`
- **Git config:** user.name="young-2202" (Vercel accepts deploys from this user)
- **SSH key:** `~/.ssh/id_ed25519_guestvault`
- **Vercel auto-deploys** on push to main

### Database Migrations
Run in Supabase Dashboard → SQL Editor:
1. `supabase/migrations/001_core_tables.sql` ✅ Applied
2. `supabase/migrations/002_upsell_tables.sql` ✅ Applied
3. `supabase/migrations/003_email_tables.sql` ✅ Applied

---

## 8. DESIGN SYSTEM

### Theme
- **Background:** `#06060C` (near-black) to `#0C0C14`
- **Cards:** `bg-gray-900/50` with `border-gray-800`
- **Accent:** Amber `#C9A84C` (buttons, highlights, brand name)
- **Text:** White for headings, `text-gray-400` for body, `text-gray-500` for subtle
- **Status colors:** Green (pass/active), Amber (warning), Red (error/fail)

### Typography
- **Headings:** System font (Geist), bold
- **Body:** System font (Geist), regular
- **Monospace:** Geist Mono (slugs, codes, URLs)

### Component Library
shadcn/ui components: Button, Input, Label, Card, Dialog, Textarea, Select, Badge, Separator

### Dashboard Layout
- **Sidebar:** 264px fixed left, dark gray (`bg-gray-900`), 10 nav items with icons
- **Mobile:** Hamburger menu, slide-in sidebar with overlay
- **User info:** Bottom of sidebar — avatar, email, plan badge, sign out

---

## 9. NAMING MIGRATION

The product is being renamed from **GuestVault** to **StaySteward**.

**What needs to change:**
1. All UI text references to "GuestVault" → "StaySteward"
2. Domain: `guest-vault.vercel.app` → `staysteward.com`
3. GitHub repo name (optional)
4. Supabase project name (cosmetic only)
5. `package.json` name field
6. Meta titles and descriptions
7. Marketing page content
8. Email templates (when built)

**What does NOT change:**
- Database schema
- API routes
- Component structure
- Business logic
- Stripe account

---

## 10. TESTING CHECKLIST

### Full End-to-End Test
1. **Sign up** at /signup → create account → name organization
2. **Add property** → name, address, WiFi credentials, house rules, parking
3. **Create reservation** → select property, dates, guest count, channel
4. **Copy portal link** → open in incognito
5. **Check in** as guest → fill form → WiFi revealed
6. **Add upsell** → go to Upsells page → quick-add "Late Checkout"
7. **Buy upsell** as guest → click Add in portal → Stripe checkout → complete payment
8. **Check orders** → order appears in host dashboard
9. **Activate email sequence** → Marketing → activate "Post-Stay Thank You"
10. **Customize branding** → Brand page → change color → verify preview updates
11. **Check analytics** → Analytics page → verify capture rate, revenue
12. **Test portal on mobile** → open portal link on phone → verify responsive layout

### What to Watch For
- Portal loads without login (token-based access)
- WiFi password only shows AFTER check-in form submission
- Stripe checkout works with test card: `4242 4242 4242 4242`
- Orders show correct amounts (host payout = total - 5% platform fee)
- Brand color changes reflect immediately in portal preview
- Marketing sequences show step timeline correctly
