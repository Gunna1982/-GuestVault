# StaySteward Revenue Features & Profit Centers
## Feature Roadmap for Professional Operators (10–50 Properties)

**Date:** March 28, 2026
**Prepared by:** Stelliform Digital
**Core Problems Solved:** Revenue leakage (OTA commissions), missed ancillary profit, lack of guest data ownership

---

## 1. High-Margin Revenue Profit Centers

### 1.1 Early/Late Automated Manager
- **Revenue:** $25–$100 per instance, 90–100% margin
- **How it works:** System checks PMS for cleaning status and automatically offers early check-in or late checkout at high-intent moments
- **Triggers:**
  - Early check-in: 24 hours before arrival, if cleaning is done early
  - Late checkout: Morning of checkout (7am auto-SMS)
  - "Last-Minute Unlock": If guest hasn't booked early check-in 24hrs before arrival, send discounted offer
- **Dependencies:** PMS integration (Hostaway/Guesty API), cleaning task status monitoring

### 1.2 Gap-Night Filler
- **Revenue:** Discounted nightly rate (better than $0 for unbookable dates)
- **How it works:** Proactively offers guests the ability to extend their stay at a discounted rate if a single "gap night" exists in the calendar
- **Trigger:** Mid-stay, when system detects no booking for the night immediately following checkout
- **Dependencies:** PMS calendar API, dynamic pricing logic

### 1.3 Integrated Affiliate Storefront
- **Revenue:** 7–20% passive commission per booking
- **Partner Categories:**

| Service | Partner | Timing | Commission |
|---------|---------|--------|------------|
| Airport Transfers | Welcome Pickups | 3–5 days before arrival | 10–20% |
| Luggage Storage | Stasher / Bounce | Morning of departure | 10% |
| Tours & Rentals | Viator / GetYourGuide | Pre-arrival | 7–15% |
| Private Chefs | Local partners | Mid-stay | 15–20% |
| Boat Charters | Local partners (FL) | Mid-stay | 10–15% |
| Photography | Local partners | Mid-stay | 15–20% |
| Equipment Rentals | Host / Partner | During stay | 20–100% |

---

## 2. The "Direct Booking" Moat (Advertising & Retention)

### 2.1 Legal Compliance Lead Capture
- **Status:** ✅ BUILT (Migration 004, Portal compliance-first flow)
- **How it works:** Portal functions as Mandatory Online Check-in. Guests provide real email and ID for legal/safety reasons, building host's private CRM
- **Compliance:** Aligns with Airbnb 2025 Off-Platform Policy exceptions for legal/compliance data collection

### 2.2 Branded "Boarding Pass" UI
- **Status:** 🔨 IN PROGRESS (Portal redesign)
- **How it works:** High-end, mobile-responsive web app (no download required) that feels like a luxury hotel boarding pass
- **Goal:** Establish professional branding that makes guests trust the host over the platform
- **Tech:** Next.js SSR for instant load, white-labeled subdomains (welcome.myrental.com)

### 2.3 Direct Re-booking Engine
- **Status:** 📋 PLANNED
- **How it works:** "Book Direct and Save" button within the portal. Guests can extend their stay or book next visit while bypassing OTA fees
- **Positioning:** Relationship-first framing, NOT anti-platform messaging
- **Dependencies:** Direct booking calendar widget, Stripe payment for direct bookings

### 2.4 Automated Review & Social Engine
- **Status:** 📋 PLANNED
- **How it works:**
  - Prompt for 5-star review at "Peak Happy" moment (shortly after arrival or check-out)
  - "Tag us on Instagram" feature for word-of-mouth advertising
- **Trigger:** Day 1 post-checkout (thank you + review request email — already in sequence templates)

---

## 3. Smart Operational Automation (Utility Hook)

### 3.1 Biometric ID Verification
- **Status:** 🔨 PARTIAL (ID type collection built, photo matching not yet)
- **How it works:** Securely collects and matches guest IDs to photos
- **Legal basis:** Required in many markets (Spain, Italy, Portugal, Greece)
- **Value:** Provides "utility" justification for data collection under Airbnb's compliance exception

### 3.2 Dynamic Property Guidebook
- **Status:** 📋 PLANNED
- **How it works:** Replaces static PDFs with searchable, interactive guide
- **Features:**
  - Google Places integration for local restaurant recommendations with real-time ratings and directions
  - Searchable house rules and property info
  - Interactive map with nearby points of interest
- **Goal:** Make the portal SO useful that 90%+ of guests choose it voluntarily

### 3.3 Smart Access Integration
- **Status:** 📋 PLANNED
- **How it works:** Once ID verification and payment complete, portal automatically pushes smart lock code to guest
- **Integrations:** Guesty, Hostaway, Yale, August smart locks
- **Dependencies:** PMS API, smart lock API partnerships

### 3.4 "Insider" WiFi Marketing
- **Status:** ✅ BUILT (WiFi-gated check-in flow)
- **Enhancement planned:** Gate WiFi behind "Join our Loyalty Program" checkbox to capture 100% of guests in group (not just booking guest)
- **Current:** WiFi revealed after check-in form completion for primary guest. Travel companion link captures additional guests.

---

## 4. AI-Driven Engagement

### 4.1 Context-Aware AI Assistant
- **Status:** 📋 PLANNED (V2)
- **How it works:** 24/7 AI chatbot trained on property's specific guidebook
- **Answers:** "Where is the extra linens?", "How do I use the pool heater?", "What's the WiFi password?"
- **Impact:** Reduces support tickets by up to 90%
- **Tech:** RAG over property guidebook data, embedded in portal

### 4.2 Personalized "Nurture" Sequences
- **Status:** ✅ BUILT (Email sequence templates in API)
- **Enhancement planned:** Segment by purchase history (romance, family, business, high-spender)
- **Current sequences:** Day 1 thank you, Day 7 survey, Day 30 win-back, Day 60 updates, Day 90 seasonal, Day 365 anniversary

---

## Feature Adoption Timeline (The Revenue Journey)

| Timing | Feature Triggered | Goal |
|--------|-------------------|------|
| 7–14 days before | ID Verification & Legal Check-in | Data Capture |
| 3–7 days before | Airport Transfer & Grocery Offer | Partner Commission |
| 48 hours before | Pre-arrival reminder + convenience upsells | Guest Engagement |
| 24 hours before | Early Check-in "Unlock" Offer | Direct Profit |
| Day of arrival | Smart lock code + property guide reveal | Utility Hook |
| Mid-stay | Local Tours, Equipment, Mid-stay Cleaning | Guest Experience |
| Check-out AM | Late Checkout & Luggage Storage | Final Upsell |
| 72 hours post | Direct Booking Discount & Review Request | Future Advertising |
| Day 30 | "We saved your spot" win-back | Direct Rebooking |
| Day 60 | "Something new" property updates | Brand Retention |
| Day 90 | Seasonal offer with promo code | Revenue Recovery |
| Day 365 | Anniversary nostalgia trigger | Long-term Loyalty |

---

## Implementation Priority

### Phase 1 — BUILT (Current)
- ✅ Compliance-first check-in portal (legal lead capture)
- ✅ WiFi-gated data capture
- ✅ Upsell storefront with Stripe checkout
- ✅ Email sequence automation (6 templates)
- ✅ Unsubscribe mechanism (CAN-SPAM/GDPR)
- ✅ Compliance indicator + Airbnb-safe message templates
- ✅ Privacy Policy + Terms of Service
- ✅ Rental agreement acceptance flow

### Phase 2 — NEXT (Weeks 1–4)
- 🔨 Early/Late automated manager (PMS cleaning status check)
- 🔨 Branded "Boarding Pass" UI upgrade
- 🔨 Biometric ID verification (photo upload + matching)
- 🔨 Gap-night filler logic

### Phase 3 — GROWTH (Weeks 5–12)
- 📋 Affiliate storefront (Welcome Pickups, Stasher, Viator integrations)
- 📋 Direct re-booking engine
- 📋 Dynamic property guidebook with Google Places
- 📋 Smart access integration (smart locks)
- 📋 Review & social engine

### Phase 4 — SCALE (Months 4–6)
- 📋 Context-aware AI assistant
- 📋 Segmented remarketing (romance, family, business, high-spender)
- 📋 Service provider two-sided marketplace
- 📋 Multi-market activation
