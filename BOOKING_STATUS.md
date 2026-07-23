# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-23_

## What's live

- **Site**: nikolaifissenko.github.io/rasna (GitHub Pages, deploys from
  `claude/magical-franklin-58SKM`) — has the two-tab booking UI
  (fixed November departure + choose-your-own-dates), both paying in
  full via Stripe Checkout. Custom domain **rasnaexperience.com** is
  purchased and DNS is pointed at GitHub Pages (confirmed resolving),
  but GitHub hasn't finished issuing the HTTPS certificate /
  activating the domain yet — still 404s as of this update. Until it's
  confirmed serving, `SITE_URL` in the Worker deliberately still points
  at the github.io URL (with the new domain also allowed in
  `CORS_ORIGIN`) so live bookings don't break mid-transition — see
  `worker/wrangler.toml`. **Once rasnaexperience.com is confirmed live,
  flip `SITE_URL` to it and update the canonical/OG tags, `robots.txt`,
  `sitemap.xml` if not already pointed there (they were pre-emptively
  updated to the new domain already).**
- **Backend**: `worker/` — Cloudflare Worker + D1 database, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`. Free tier,
  no credit card, auto-deploys on push to `claude/magical-franklin-58SKM`
  (root directory `worker`, project name `rasna-booking-api` in
  Cloudflare).
- **Database**: D1 `rasna-bookings` (id `9b39d9d8-6732-4b3f-8024-1667d171e49f`),
  `bookings` table created.
- **Secrets set in Cloudflare** (Worker → Settings → Variables and
  Secrets): `STRIPE_SECRET_KEY` (sandbox/test key), `STRIPE_WEBHOOK_SECRET`
  (sandbox), `ADMIN_PASSWORD` (real, chosen by Nikolai).
- **Stripe**: Sandbox/test mode only so far. Webhook destination created
  pointing at `.../webhook/stripe` for `checkout.session.completed` and
  `checkout.session.expired`.
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
  is pushed and live-deployed on `claude/magical-franklin-58SKM`, but
  **the D1 schema migration has NOT been applied to the remote/production
  database yet** — see blocker below. Until it is, the form appears
  and looks like it works, but saving silently fails (shows a friendly
  "something went wrong" to the guest); it does not affect the core
  booking/payment flow, which doesn't touch these columns.

## Verified so far

- API endpoints work against the real deployed Worker + D1 (confirmed
  via curl): `/api/departures`, booking creation, Stripe session
  creation with the real sandbox key (got back a real
  `checkout.stripe.com/c/pay/cs_test_...` URL).
- Capacity math and atomic-insert race protection verified locally
  (wrangler dev + local D1): 5 concurrent requests at 1 remaining spot
  → exactly 1 succeeded.
- `/admin` correctly requires auth (401 without credentials).
- One leftover throwaway test booking exists in the live D1 from a
  direct API curl test — status `pending`, auto-expires on its own
  (Stripe session expiry ~30 min), no cleanup needed.

## Not yet done — pick up here next

0. **BLOCKER — apply the pending D1 migration to production.**
   `worker/migrations/0002_flight_details.sql` (adds 4 nullable columns
   to `bookings`: `arrival_airport`, `arrival_flight_number`,
   `arrival_datetime`, `transfer_notes`) is written and applied locally,
   but not yet run against the remote database. Needs
   `wrangler d1 migrations apply rasna-bookings --remote` from `worker/`,
   which needs `CLOUDFLARE_API_TOKEN` (D1 Edit permission) **and**
   `CLOUDFLARE_ACCOUNT_ID` set in the environment — a narrowly-scoped
   D1-only token can't auto-resolve the account via the Cloudflare API,
   so the account ID has to be supplied explicitly. Per `CLAUDE.md`:
   don't ask Nikolai to run this himself — ask for the token + account
   ID (find the latter in the Cloudflare dashboard → Workers & Pages →
   right sidebar) and run it directly. Never write the token itself
   into this repo.
1. **Run one real end-to-end test through the actual site** (not the
   API directly): nikolaifissenko.github.io/rasna → Book Now →
   November tab → fill form → pay with Stripe test card
   `4242 4242 4242 4242` → confirm it lands on `success.html` → check
   `/admin` shows the booking as `paid` and `/api/departures` shows
   `remaining` decremented. (Last attempt got sidetracked — a Stripe
   **Payment Link** URL was pasted instead of going through the site's
   own booking form; that's a different, unrelated Stripe feature and
   wasn't a real test of this flow.)
2. **Switch Stripe to Live mode** once step 1 passes AND once
   rasnaexperience.com is confirmed fully live (see domain note
   above) — flipping live before the domain is ready risks a real
   paying guest landing on a broken confirmation page right after
   paying. Get the live secret key and create a second (live-mode)
   webhook destination at the same URL/events, then update
   `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Cloudflare with
   the live values.
3. Once rasnaexperience.com is confirmed serving with a valid cert:
   flip `SITE_URL` in `worker/wrangler.toml` from the github.io
   fallback to `https://rasnaexperience.com`, and drop the github.io
   entry from `CORS_ORIGIN`.
4. Optional cleanup: delete the unused `cloudflare/workers-autoconfig`
   branch (harmless leftover from the first, misconfigured Worker
   deploy attempt — never merged, not connected to anything).

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

## ⚠️ Lodging risk for the Nov 9–15, 2026 departure

Antonella's B&B — the lead lodging option for this departure — is
**unavailable that week**. No accommodation is confirmed for a departure
that's already open to real (sandbox-mode) Stripe bookings, capacity 8. See
`BUSINESS_PLAN.md` RISCHIO CALENDARIO and `CONTATTI_LOCALI.md` (Antonella
entry) for alternatives being evaluated (Beccone Albergo, Poggio al Sasso).
Should be resolved before switching Stripe to Live mode (see step 2 below).

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

**Not yet done**: no outreach copy has actually been drafted yet
(DM/email template, forum post, Instagram bio/captions) — next
concrete step whenever marketing work resumes.

## Reference

- Full step-by-step is in `worker/README.md`.
- Repo default/live branch: `claude/magical-franklin-58SKM` (no
  `main`/`master` exists).
- This work was developed on `claude/booking-payment-setup-e8e3jr` and
  `claude/week-booking-stripe-payments-1lt3f1`, merged in via PRs #8,
  #9, #10, #12 and direct merges to the live branch.
