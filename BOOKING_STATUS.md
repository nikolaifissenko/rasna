# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-24_

## What's live

- **Site**: **rasnaexperience.com is live** (confirmed 2026-07-23 — HTTPS
  serving with a valid cert, HTTP 200, correct page). Has the two-tab
  booking UI (fixed November departure + choose-your-own-dates), both
  paying in full via Stripe Checkout. `github.io/rasna` still exists as
  the underlying GitHub Pages host but is no longer the canonical URL.
  `SITE_URL` in the Worker has been flipped to `https://rasnaexperience.com`
  and the github.io fallback dropped from `CORS_ORIGIN` — see
  `worker/wrangler.toml`. Canonical/OG tags, `robots.txt`, `sitemap.xml`
  already pointed at the custom domain.
- **Backend**: `worker/` — Cloudflare Worker + D1 database, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`. Free tier,
  no credit card, auto-deploys on push to `claude/magical-franklin-58SKM`
  (root directory `worker`, project name `rasna-booking-api` in
  Cloudflare).
- **Database**: D1 `rasna-bookings` (id `9b39d9d8-6732-4b3f-8024-1667d171e49f`),
  `bookings` table created.
- **Secrets set in Cloudflare** (Worker → Settings → Variables and
  Secrets): `STRIPE_SECRET_KEY` (**live** key, confirmed below),
  `STRIPE_WEBHOOK_SECRET` (live-mode, confirmed working by Nikolai),
  `ADMIN_PASSWORD` (real, chosen by Nikolai).
- **Stripe**: **LIVE mode** — confirmed 2026-07-23 by hitting the real
  `/api/bookings/fixed` endpoint, which returned a `cs_live_...` Checkout
  session (not `cs_test_...`), so `STRIPE_SECRET_KEY` in Cloudflare is the
  live secret key. This means **real bookings on the site attempt real
  charges** — treat the site as fully live, not a sandbox. The live-mode
  webhook (signature verification in `worker/src/index.js` via
  `stripe.webhooks.constructEventAsync`) is confirmed working end-to-end,
  so paid bookings do flip from `pending` to `paid`.
- **Departure config**: November 9–15, 2026, capacity 8, €1,450/person
  (`worker/src/departures.js`).
- **Admin record**: `https://rasna-booking-api.nikolai-fissenko1.workers.dev/admin`
  (Basic Auth: `admin` / the password set in Cloudflare). CSV export at
  `/admin/bookings.csv`.
- **Post-payment flight-details collection** (for planning airport
  pickups — guests often land at different times, esp. FCO): after
  paying, `success.html` shows an arrival-airport/flight-number/
  arrival-time form. It's optional and re-visitable (the page is
  bookmarkable — the Stripe `session_id` in its URL doubles as the
  guest's access token, no login system). New endpoints:
  `GET /api/bookings/by-session/:sessionId` and
  `PATCH /api/bookings/by-session/:sessionId/flight-details`. Fields
  surfaced in `/admin` and the CSV export so pickup runs (e.g. one
  morning FCO group van + a backup solo run) can be planned from real
  data. Code (`worker/src/index.js`, `worker/src/db.js`,
  `success.html`, migration `worker/migrations/0002_flight_details.sql`)
  is pushed and live-deployed on `claude/magical-franklin-58SKM`.
  **The D1 schema migration has been applied to production
  (confirmed 2026-07-24)** — verified via `PRAGMA table_info(bookings)`
  against the remote DB, all 4 columns present. The flight-details form
  should now save correctly instead of silently failing.

## Verified so far

- API endpoints work against the real deployed Worker + D1 (confirmed
  via curl): `/api/departures` (returns the Nov 9–15 departure, 8/8
  remaining, correct CORS header for `https://rasnaexperience.com`),
  booking creation, Stripe session creation — **now against the live
  key**, confirmed by a `cs_live_...` Checkout URL in the response
  (previously this returned `cs_test_...`).
- Capacity math and atomic-insert race protection verified locally
  (wrangler dev + local D1): 5 concurrent requests at 1 remaining spot
  → exactly 1 succeeded.
- `/admin` correctly requires auth (401 without credentials).
- **Full end-to-end paid checkout on the live site — DONE (confirmed by
  Nikolai, 2026-07-24).** rasnaexperience.com → Book Now → November tab
  → real card → success — went well. This was the last real-money
  verification step; the core booking/payment flow is now confirmed
  working in production, not just via curl.
- Two leftover throwaway pending bookings exist in the live D1 from
  direct API curl tests (one sandbox-era, one from the 2026-07-23
  live-mode check) — both `pending`, both auto-expire on their own
  (Stripe session expiry ~30 min), no cleanup needed; pending bookings
  don't count against capacity.

## Not yet done — pick up here next

All previous blockers are cleared: D1 migration applied to production
(2026-07-24, token/account ID provided by Nikolai and used directly,
not persisted anywhere in the repo), lodging risk resolved (Da Beccone
confirmed room availability for the group of 8), and a real end-to-end
paid checkout on the live site succeeded. Remaining items are lower
priority / optional:

1. Send the drafted outreach copy (`OUTREACH_DRAFTS.md`) — warm DM/email,
   forum post, Instagram bio/captions — still unsent as of last update.
2. Optional cleanup: delete the unused `cloudflare/workers-autoconfig`
   branch (harmless leftover from the first, misconfigured Worker
   deploy attempt — never merged, not connected to anything). Attempted
   2026-07-24 — blocked by a 403 from this session's git remote
   permissions (repo scope here doesn't allow branch deletion); low
   priority, revisit if it becomes annoying.

## SEO

- Title/meta description/OG tags and hero copy now name **Tuscia**
  and **Etruscan** explicitly instead of leaning on generic "Italy" —
  the realistic ranking target is long-tail geo searches ("Blera
  tours," "Etruscan small-group Italy"), not head terms like "Italy
  experiences," which are owned by TripAdvisor/Viator/GetYourGuide
  and out of reach for a brand-new site regardless of domain name.
- Added `TouristTrip` JSON-LD structured data, a canonical tag,
  `robots.txt`, and `sitemap.xml` (transactional `success.html` /
  `cancel.html` excluded from both via `noindex` / disallow).
- Domain **rasnaexperience.com** was chosen specifically to reinforce
  this: "experience" matches real travel-search intent, unlike the
  brand-only alternative considered (`rasnalife.com`).

## ⚠️ Lodging risk for the Nov 9–15, 2026 departure (resolved)

Antonella's B&B (La Ripa) — the original lead lodging option for this
departure — is **unavailable that week**. **Da Beccone is confirmed as
the alternative** (rates collected, margin checked against real numbers —
see `CONTATTI_LOCALI.md` §8 and `FINANCIAL_PLAN.md` §1). **Update
2026-07-24**: Nikolai called Da Beccone directly re-confirmed pricing —
room availability for the group of 8 "shouldn't be a problem." Exact
doubles/singles breakdown wasn't nailed down to specific numbers on the
call, but availability is no longer a live-booking risk. Worth a final
written confirmation (exact room count/type) closer to the date, but
this no longer blocks anything.

## Marketing — filling the November departure (8 spots, €1,450/pp)

SEO/Instagram are background, months-long channels — not realistic
to count on for filling *this* first departure by Nov 9, 2026 (no
track record, no photos/testimonials yet since no trip has run). What
was recommended, in priority order:

1. **Warm outreach first**: message the 10–15 people most likely to
   say yes directly (past travel contacts, friends), framed as a
   founding-guest offer (small perk in exchange for honest feedback +
   photos/testimonials afterward) — this trip effectively *is* the
   pilot referenced in `BUSINESS_PLAN.md` Phase 2.
2. **The American friends' houseguests in Blera** — a stronger
   channel than cold outreach, since their guests are already
   self-selected travelers and a personal introduction from the host
   carries real trust. Better as a personal mention/forward from the
   friends than a cold link.
3. **Niche channels** (r/ItalyTravel, r/solotravel, small-group/slow-
   travel newsletters) over broad ones — much less competition than
   generic Instagram posting with no existing following.
4. **Instagram**: treat as a trust/credibility layer (a real-looking
   profile so warm leads don't hesitate before paying), not a
   discovery engine on this timeline. If used as an actual acquisition
   channel, small **paid** Meta ads (interest-targeted, capped spend)
   are more realistic than organic growth within a ~16-week window.

**Done (2026-07-24)**: outreach copy is drafted (see `OUTREACH_DRAFTS.md`)
and the Da Beccone room-mix call has been made — see lodging risk
section above. Warm-outreach DM/email, forum post, and Instagram copy
are still unsent; report back what gets responses so the copy can be
tightened.

## Reference

- Full step-by-step is in `worker/README.md`.
- Repo default/live branch: `claude/magical-franklin-58SKM` (no
  `main`/`master` exists).
- This work was developed on `claude/booking-payment-setup-e8e3jr` and
  `claude/week-booking-stripe-payments-1lt3f1`, merged in via PRs #8,
  #9, #10, #12 and direct merges to the live branch.
