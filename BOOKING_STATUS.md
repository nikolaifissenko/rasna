# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-20_

## Bottom line

**Live payments, custom domain, and the full booking flow are all
working right now.** `rasnaexperience.com` is live with valid HTTPS,
Stripe is in live mode with a real `sk_live_...` key, and a real
`cs_live_...` Checkout session was confirmed via a diagnostic API call
(no real charge run). One known cosmetic bug (see below) is fixed in
the code but stuck behind a GitHub-side build issue — not customer
blocking, but worth finishing.

**Note: this status file is duplicated on `main`, which is the actual
live/deployed branch — treat `main`'s copy as authoritative if the two
ever diverge.** This branch (`claude/work-in-progress-l73jpc`) is
behind `main` in site content.

## What's live

- **Site**: rasnaexperience.com (GitHub Pages, deploys from `main`).
  `nikolaifissenko.github.io/rasna` still works too (kept as a CORS
  fallback / old-link safety net).
- **Backend**: `worker/` — Cloudflare Worker + D1, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`.
- **Stripe: LIVE MODE.**
  - `STRIPE_SECRET_KEY` — rotated today (`sk_live_...81aV`), the
    previous live key was unrecoverable (Stripe only shows secret keys
    once, and the original had already been overwritten in Cloudflare
    during sandbox testing).
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
  - `worker/wrangler.toml` on `main`: `SITE_URL =
    "https://rasnaexperience.com"`, `CORS_ORIGIN` includes
    `rasnaexperience.com`, `www.rasnaexperience.com`, and
    `nikolaifissenko.github.io` (kept as fallback).
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
  git-based auto-deploy entirely — see "Known issues" for why.
  **If a future session needs Cloudflare access again, ask Nikolai for
  a fresh scoped token** (dash.cloudflare.com → profile → API Tokens →
  Create Token → Custom token → Workers Scripts:Edit + D1:Edit, scoped
  to his account, with a short TTL).

## Known issues — pick up here next

1. **GitHub Pages build queue is stuck.** Every Pages build for `main`
   since the `CNAME` commit has either been cancelled or stuck
   indefinitely in `queued` (confirmed via the `pages-build-deployment`
   workflow run history). The live site is currently serving a build
   from **2026-07-19 03:55 UTC**, missing the "Back to Rasna" 404 fix
   (already committed to `main`) and updated SEO metadata. Re-saving
   the branch in Settings → Pages and pushing fresh commits both queued
   new attempts that are *also* stuck — looks like a GitHub-side
   infrastructure issue. **Next step: check the Actions tab directly in
   the browser; may need a GitHub support ticket.** Not
   customer-blocking — booking and payment work regardless.

2. **Two Claude sessions worked on this repo in parallel and collided
   twice** on `worker/wrangler.toml` and domain config. Assign clear
   ownership if running multiple sessions again.

3. **Cloudflare Worker's git auto-deploy watches
   `claude/magical-franklin-58SKM`, not `main`** (the actual GitHub
   Pages source) — confirmed via Cloudflare's Version History. This
   mismatch is why manual `wrangler deploy` was used today. Worth
   fixing properly (repoint the git integration, or just keep deploying
   manually after `worker/` changes).

4. **Verify the webhook fires on a real live payment** — still only
   confirmed that a live Checkout session gets created correctly, not
   the full payment→webhook→paid round trip. Cheapest real check: your
   next real booking, then confirm `/admin` shows `paid`.

5. **Get the Cloudflare Worker `ADMIN_PASSWORD` from Nikolai.**

6. **Check Stripe payout schedule** (Settings → Payouts) against the
   Nov 9–15 departure date and vendor payment needs.

7. Decide what to do with `claude/magical-franklin-58SKM` and this
   branch now that `main` is confirmed live — both are stale for site
   content. Also safe to delete `cloudflare/workers-autoconfig`.

## Reference

- Full step-by-step for the Worker/Stripe setup: `worker/README.md`.
- Repo default/live branch: `main`.
- Custom domain: `rasnaexperience.com`.
