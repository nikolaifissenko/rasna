# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-18_

## What happened before this update — read this first

The booking backend (Cloudflare Worker + D1 + Stripe Checkout) was built
and merged into `claude/magical-franklin-58SKM`, but that branch was
**never actually what GitHub Pages serves**. The live site
(nikolaifissenko.github.io/rasna) deploys from `main`, which had
diverged independently with a full site redesign (images, about page,
itinerary calendar, etc.) and never received the booking work. So every
previous "verified" test only exercised the Worker API directly or a
branch no visitor could reach — nothing was actually live.

This update reconciles that: the working backend is now wired into
`main`'s real booking form (the "Book the November 9 to 15 departure"
form under the Italian Autumn Experience tab), without touching any of
the design/content work that only existed on `main`.

## What's live

- **Site**: nikolaifissenko.github.io/rasna (GitHub Pages, deploys from
  `main` — confirmed by matching the live HTML). The festival-week
  booking form now calls the real backend and pays in full via Stripe
  Checkout, instead of the old Formspree + static `buy.stripe.com`
  deposit link.
- **Backend**: `worker/` — Cloudflare Worker + D1 database, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`. Free tier,
  no credit card, auto-deploys on push to `claude/magical-franklin-58SKM`
  (root directory `worker`, project name `rasna-booking-api` in
  Cloudflare). **Note**: the Worker's Cloudflare deploy trigger still
  watches `claude/magical-franklin-58SKM`, not `main` — that branch
  should keep being used for any future `worker/` changes, or the
  Cloudflare Pages/Workers project's connected branch should be
  repointed at `main` to match where the site code now lives.
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
- **The "Build Your Own Trip" tab is unchanged** — it's still a plain
  Formspree inquiry form (no payment), by design. Only the fixed
  November departure takes real payment.

## Verified so far

- API endpoints work against the real deployed Worker + D1 (confirmed
  via curl): `/api/departures`, booking creation, Stripe session
  creation with the real sandbox key.
- Capacity math and atomic-insert race protection verified locally
  (wrangler dev + local D1): 5 concurrent requests at 1 remaining spot
  → exactly 1 succeeded.
- `/admin` correctly requires auth (401 without credentials).
- **Real end-to-end test through the live site, browser-driven**
  (headless Chromium, not curl): nikolaifissenko.github.io/rasna →
  filled the "Book the November 9 to 15 departure" form → real Stripe
  Checkout session opened → paid with test card `4242 4242 4242 4242`
  → redirected to `success.html?session_id=cs_test_...` with the
  "Grazie! Your payment went through" message. `/api/departures`
  `remaining` dropped from 8 to 3 during testing (one genuine paid
  booking + three abandoned test attempts that briefly hold a spot
  each — those auto-release themselves ~30 min after creation per
  `PENDING_HOLD_MINUTES` in `worker/src/db.js`, no cleanup needed).
  Have not independently confirmed via `/admin` that the paid booking
  shows `status: paid` (don't have the admin password in this
  session) — the webhook-driven status flip is inferred from reaching
  `success.html` with a real session id, not directly observed in the
  database.

## Not yet done — pick up here next

1. Optional: confirm via `/admin` (Basic Auth: `admin` / the Cloudflare
   password) that the test booking from 2026-07-18 shows `status: paid`
   with a `stripe_session_id`, for full end-to-end confidence beyond
   what the automated browser test could see.
2. **Switch Stripe to Live mode**: get the live secret key and create a
   second (live-mode) webhook destination at the same URL/events, then
   update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Cloudflare
   with the live values.
3. Decide what to do with `claude/magical-franklin-58SKM` now that its
   work has been folded into `main` — either repoint the Cloudflare
   Worker's auto-deploy at `main` and retire that branch, or keep using
   it just for `worker/` changes. Also safe to delete the unused
   `cloudflare/workers-autoconfig` branch (harmless leftover from the
   first, misconfigured Worker deploy attempt).

## Reference

- Full step-by-step is in `worker/README.md`.
- Repo default/live branch: `main`.
