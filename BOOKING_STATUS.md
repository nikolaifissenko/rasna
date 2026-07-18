# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-18_

## What's live

- **Site**: nikolaifissenko.github.io/rasna (GitHub Pages, deploys from
  `claude/magical-franklin-58SKM`) — has the two-tab booking UI
  (fixed November departure + choose-your-own-dates), both paying in
  full via Stripe Checkout.
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

1. **Run one real end-to-end test through the actual site** (not the
   API directly): nikolaifissenko.github.io/rasna → Book Now →
   November tab → fill form → pay with Stripe test card
   `4242 4242 4242 4242` → confirm it lands on `success.html` → check
   `/admin` shows the booking as `paid` and `/api/departures` shows
   `remaining` decremented. (Last attempt got sidetracked — a Stripe
   **Payment Link** URL was pasted instead of going through the site's
   own booking form; that's a different, unrelated Stripe feature and
   wasn't a real test of this flow.)
2. **Switch Stripe to Live mode** once step 1 passes: get the live
   secret key and create a second (live-mode) webhook destination at
   the same URL/events, then update `STRIPE_SECRET_KEY` and
   `STRIPE_WEBHOOK_SECRET` in Cloudflare with the live values.
3. Optional cleanup: delete the unused `cloudflare/workers-autoconfig`
   branch (harmless leftover from the first, misconfigured Worker
   deploy attempt — never merged, not connected to anything).

## Reference

- Full step-by-step is in `worker/README.md`.
- Repo default/live branch: `claude/magical-franklin-58SKM` (no
  `main`/`master` exists).
- This work was developed on `claude/booking-payment-setup-e8e3jr` and
  merged in via PRs #8, #9, #10, #12.
