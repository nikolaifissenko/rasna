# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-20_

## Bottom line

**Everything is live and fully up to date — no known open bugs.**
`rasnaexperience.com` is live with valid HTTPS, Stripe is in live mode
with a real `sk_live_...` key, and a real `cs_live_...` Checkout
session was confirmed via a diagnostic API call (no real charge run).
The GitHub Pages build that was stuck for a while (see old item 1
below) resolved on its own — confirmed live as of 2026-07-20 03:05
UTC, "Back to Rasna" links and SEO metadata are correct on the live
site now.

## What's live

- **Site**: rasnaexperience.com (GitHub Pages, deploys from `main`).
  `nikolaifissenko.github.io/rasna` still works too (kept as a CORS
  fallback / old-link safety net).
- **Backend**: `worker/` — Cloudflare Worker + D1, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`.
- **Stripe: LIVE MODE.**
  - `STRIPE_SECRET_KEY` — rotated today (`sk_live_...51ThkF5...81aV`,
    ends `...81aV`), the previous live key was unrecoverable (Stripe
    only shows secret keys once, and the original had already been
    overwritten in Cloudflare during sandbox testing).
  - `STRIPE_WEBHOOK_SECRET` — live-mode signing secret, re-revealed
    from the existing live webhook endpoint pointed at
    `.../webhook/stripe` (`checkout.session.completed` +
    `checkout.session.expired`).
  - Verified live: a diagnostic `POST /api/bookings/fixed` returned a
    `cs_live_...` Checkout URL. The resulting pending booking row was
    deleted immediately after (no real payment attempted).
- **Custom domain: rasnaexperience.com — confirmed working.**
  - DNS: all 4 required GitHub Pages A records present and correct.
  - HTTPS: confirmed serving (verified via 6 consecutive successful
    checks). `CNAME` file committed to `main`.
  - `worker/wrangler.toml`: `SITE_URL = "https://rasnaexperience.com"`,
    `CORS_ORIGIN` includes `rasnaexperience.com`,
    `www.rasnaexperience.com`, and `nikolaifissenko.github.io` (kept as
    fallback).
- **Database**: D1 `rasna-bookings`
  (id `9b39d9d8-6732-4b3f-8024-1667d171e49f`). Cleaned of all test
  bookings as of this session — `/api/departures` correctly shows
  `8/8 remaining`.
- **Departure config**: November 9–15, 2026, capacity 8, €1,450/person
  (`worker/src/departures.js`).
- **Admin**: `https://rasna-booking-api.nikolai-fissenko1.workers.dev/admin`
  (Basic Auth `admin` / Cloudflare-set password — still not obtained by
  any session; see open items).
- **Cloudflare deploy method**: a scoped API token (Workers Scripts:
  Edit + D1: Edit, account-scoped, with an expiration) was used this
  session to deploy the Worker directly via `wrangler deploy` /
  `wrangler secret put` / `wrangler d1 execute`, bypassing Cloudflare's
  git-based auto-deploy entirely. This was necessary because — see
  "Known issues" below — Cloudflare's git integration was pointed at
  the wrong branch and/or unreliable. **If a future session needs
  Cloudflare access again, ask Nikolai for a fresh scoped token**
  (dash.cloudflare.com → profile → API Tokens → Create Token → Custom
  token → Workers Scripts:Edit + D1:Edit, scoped to his account, with a
  short TTL). The token used today should be revoked once no longer
  needed.

## Known issues — pick up here next

_(Item 1, "GitHub Pages build queue stuck," resolved on its own later
in this session — the build completed and the live site now correctly
serves the "Back to Rasna" fix and updated SEO metadata. No action
needed. Numbering below kept as-is from when it was written.)_

2. **Two Claude sessions worked on this repo in parallel today and
   collided twice** — once on `worker/wrangler.toml` (one session
   switched `SITE_URL`/`CORS_ORIGIN` fully to the new domain before it
   was actually serving, breaking live bookings on the still-active
   `github.io` site for a stretch), and generally around who "owns"
   which branch. **If running multiple sessions on this repo again,
   explicitly assign which session touches `worker/`, domain config,
   and deploys** — everything else is lower risk.

3. **Cloudflare Worker's git auto-deploy watches
   `claude/magical-franklin-58SKM`, not `main`** (confirmed via the
   Cloudflare dashboard's Version History showing deploys triggered
   from that branch). `main` is the actual GitHub Pages source. This
   mismatch is exactly why manual `wrangler deploy` was used today
   instead of relying on git auto-deploy. **Worth fixing properly**:
   either repoint Cloudflare's git integration at `main`/`worker`, or
   just keep doing manual `wrangler deploy` after any `worker/` change
   going forward (simpler, already proven reliable today).

4. **Verify the webhook fires on a real live payment.** Still never
   confirmed end-to-end with actual money — only verified that a live
   Checkout session gets created correctly. The cheapest real
   confirmation is your next real customer booking: check `/admin`
   afterward to make sure it shows `paid`, not stuck `pending`.

5. **Get the Cloudflare Worker `ADMIN_PASSWORD` from Nikolai** so a
   future session can check `/admin` directly instead of inferring
   booking status from capacity math or direct D1 queries.

6. **Check Stripe payout schedule** (Settings → Payouts) — booking
   money needs to be available in time to pay November vendors (Tuscia
   Terme, Il Cavone, Trattoria La Torretta, etc.). New Stripe accounts
   sometimes have a delayed first payout (7–14 days). Given departure
   is Nov 9–15 and today is Jul 20, there's runway, but worth
   confirming rather than assuming.

7. Decide what to do with `claude/magical-franklin-58SKM` and
   `claude/work-in-progress-l73jpc` now that `main` is confirmed as the
   actual live branch — both are now stale/redundant for site content,
   though `magical-franklin-58SKM` still matters until item 3 above is
   resolved. Also safe to delete `cloudflare/workers-autoconfig`
   (unused leftover branch, never merged).

## Reference

- Full step-by-step for the Worker/Stripe setup: `worker/README.md`.
- Repo default/live branch: `main`.
- Custom domain: `rasnaexperience.com`.
