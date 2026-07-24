# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-24_

## 2026-07-24 update: Founding Guest discount + a branch-confusion note

**Founding Guest discount, live now.** 0 of 8 spots were booked on the
Nov 9–15 departure 108 days out despite outreach going out, so this
session added a real incentive to break the ice: the **first 2 paid
guest spots get 15% off (€1,230 instead of €1,450)**. Mechanics:
- Server-side only (`worker/src/departures.js` — `founding_discount_price`/
  `founding_discount_spots`; `worker/src/index.js` — `tieredPricing()`),
  computed off the same `spotsUsed` (paid-only) count that already
  governs capacity, so it can't be gamed from the client and can't
  oversell. A party that straddles the discount boundary (e.g. booking
  3 when 1 discount spot is left) is split correctly across two Stripe
  line items.
- `/api/departures` now also returns `founding_discount_price` and
  `founding_discount_remaining` (purely additive — existing fields
  unchanged, so this was backward-compatible with the live frontend
  the moment it deployed).
- Deployed by pushing to `claude/magical-franklin-58SKM` (confirmed via
  live `curl` against the production Worker URL that the new fields
  appeared within ~2 minutes of the push — Cloudflare's git integration
  for the Worker is still watching that branch, not `main`, consistent
  with the "Deploy topology gotcha" in `CLAUDE.md`).
- Surfaced on the actual live site (`main`'s `index.html`): a
  "Founding Guest discount" badge and updated pricing copy on the
  `#festival-book` card, populated live from `/api/departures` — see
  the `founding-badge` element and the discount branch in the
  `fetch(API_BASE + '/api/departures')` handler.
- Verified end-to-end locally before shipping (wrangler dev + local D1
  + Playwright screenshots against `main`'s actual `index.html`):
  discount correctly present at 0 paid bookings, tiered-split math
  confirmed exact.
- Margin impact documented in `FINANCIAL_PLAN.md` (also newly documents
  Stripe's transaction fee, which was missing from the cost breakdown
  entirely until today).

**Branch-confusion note, worth reading if you're a future session:**
this session initially spent significant effort developing static-site
content (an About section, an FAQ, pricing UI) directly on
`claude/magical-franklin-58SKM`'s `index.html` — not realizing, despite
that branch being named in the session's designated-branch instructions,
that **`main` is the one GitHub Pages actually serves** (see `CLAUDE.md`
top-of-file branch-drift warnings, which existed before this session
started but weren't checked first). That work is inert — sitting on a
branch nobody reads — but harmless (it didn't overwrite anything, see
"Deploy topology gotcha" in `CLAUDE.md`). It was not reverted, just
abandoned in place. The corresponding *backend* changes (`worker/src/`)
pushed to that same branch are correct and live, since the Worker really
does deploy from there. **Lesson for next time**: before doing any
static-site work, verify which branch is live by diffing against
`origin/main` first, exactly as `CLAUDE.md`'s top section already warns —
don't trust a session's designated-branch instructions over that check.

## Bottom line

**Everything is live and fully up to date — no known open bugs.**
`rasnaexperience.com` is live with valid HTTPS, Stripe is in live mode
with a real `sk_live_...` key, and a real `cs_live_...` Checkout
session was confirmed via a diagnostic API call (no real charge run).
The GitHub Pages build that was stuck for a while (see old item 1
below) resolved on its own — confirmed live as of 2026-07-20 03:05
UTC, "Back to Rasna" links and SEO metadata are correct on the live
site now. As of 2026-07-20 ~03:47 UTC, post-payment flight-details
collection (see below) is also confirmed live end-to-end on the real
site and API. Re-verified live-mode Checkout independently on
2026-07-23 (another `cs_live_...` session via a diagnostic API call,
throwaway pending row left to auto-expire); Nikolai has separately
confirmed the live-mode webhook fires correctly on real payments,
closing out old item 4 below. **New open item**: lodging for the Nov
9–15, 2026 departure needs the room mix locked down with Da Beccone —
see "Lodging" below and `BUSINESS_PLAN.md` RISCHIO CALENDARIO, more
urgent now that Stripe is confirmed live.

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
  `8/8 remaining`. (Re-confirmed 2026-07-20 ~03:54 UTC after Nikolai's
  own live-site test booking — a `pending`, unpaid `cs_live_...` hold,
  `id 21`, no `stripe_payment_intent_id` set — was deleted directly
  from D1. No charge was made.)
- **Capacity math changed 2026-07-20**: `remaining` on
  `/api/departures` now only counts `status = 'paid'` bookings
  (`worker/src/db.js`, `spotsUsed` + `createFixedBooking`). Previously
  a `pending` booking also counted for ~40 minutes (a hold meant to
  stop two concurrent checkouts from both landing on the last spot) —
  removed at Nikolai's explicit request, since an abandoned/incomplete
  checkout was making the site show fewer spots than were actually
  taken. **Trade-off, accepted deliberately**: two people completing
  checkout for the literal last spot at the same instant could both
  succeed (no more temporary hold). Low risk given the small (8-guest)
  capacity and low concurrent traffic. Verified live against production
  (inserted then removed test `pending` rows, confirmed `remaining`
  doesn't move; confirmed a `paid` row still decrements it). Deployed
  by cherry-picking the single-file `worker/src/db.js` commit onto
  `claude/magical-franklin-58SKM` (per the branch split above) rather
  than pushing all of `main` there.
- **Departure config**: November 9–15, 2026, capacity 8, €1,450/person
  (`worker/src/departures.js`).
- **Admin**: `https://rasna-booking-api.nikolai-fissenko1.workers.dev/admin`
  (Basic Auth `admin` / Cloudflare-set password — still not obtained by
  any session; see open items).
- **Post-payment flight-details collection** (for planning airport
  pickups — guests land at staggered times, mostly via FCO): after
  paying, `success.html` shows a bookmarkable form for arrival airport,
  flight number, and arrival time — the Stripe `session_id` in the URL
  doubles as the guest's access token, no login system needed. New
  endpoints `GET`/`PATCH /api/bookings/by-session/:sessionId(/flight-details)`,
  surfaced in `/admin` and the CSV export. Code lives in
  `worker/src/index.js`, `worker/src/db.js`, `success.html`, migration
  `worker/migrations/0002_flight_details.sql`. **Confirmed fully live
  2026-07-20**: pushed to `main` (site) and `claude/magical-franklin-58SKM`
  (Worker, per the branch split in item 3 below), migration applied to
  the remote D1 database with a scoped `CLOUDFLARE_API_TOKEN` +
  `CLOUDFLARE_ACCOUNT_ID` (D1 Edit permission; a D1-only token can't
  auto-resolve the account, the account ID has to be supplied
  explicitly), and verified end-to-end against the live Worker (schema
  query + a real GET/PATCH round trip). The token used for this
  migration was narrowly scoped to D1:Edit only (separate from the
  broader Workers Scripts+D1 token mentioned below) — should also be
  revoked once no longer needed, same as that one.
- **Lodging (added 2026-07-23)**: the B&B originally slated for the
  Nov 9–15, 2026 departure (Antonella, B&B La Ripa) is **unavailable
  that week**. **Da Beccone is confirmed as the alternative** (rates
  collected — see `CONTATTI_LOCALI.md` §8 and `FINANCIAL_PLAN.md` §1
  for the margin recalculation against real rates). What's still open:
  the **room mix** (doubles vs. singles) for this specific group of 8
  — needs to be locked down with Da Beccone before Nov 9, since
  single-occupancy guests meaningfully change the per-guest margin
  (see `BUSINESS_PLAN.md` RISCHIO CALENDARIO for the full picture).
  This is more urgent than it sounds given Stripe is already live: a
  real guest could book and pay before lodging is settled.
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

4. ~~Verify the webhook fires on a real live payment.~~ **Resolved
   2026-07-23** — Nikolai confirmed the live-mode webhook works
   correctly on real payments.

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
8. **A separate session on 2026-07-23 worked on `claude/session-context-k9kxoq`
   (based on the stale `claude/magical-franklin-58SKM` lineage) without
   realizing `main` was the real live/default branch** — it independently
   redid work already done here (Stripe live-mode confirmation, domain
   cutover, capacity-counting fix) and separately did real, non-duplicate
   work on lodging (`CONTATTI_LOCALI.md`/`FINANCIAL_PLAN.md`/`BUSINESS_PLAN.md`
   Da Beccone/La Ripa updates) that had no equivalent on `main`. That
   lodging work has been manually ported onto `main` in this update. It
   also correctly fixed `claude/magical-franklin-58SKM`'s `worker/wrangler.toml`
   `SITE_URL`/`CORS_ORIGIN` (which had drifted stale relative to `main`'s
   copy — the one actually driving the deployed Worker, see item 3), though
   it dropped the `nikolaifissenko.github.io` CORS fallback that `main`
   deliberately keeps — restored to match. `claude/session-context-k9kxoq`
   itself is now safe to ignore/delete; its useful content is here. If
   spinning up parallel sessions on this repo again, point them at `main`
   explicitly, not a `claude/*` branch name that might be stale — see item
   2's original collision for why this matters.

## Reference

- Full step-by-step for the Worker/Stripe setup: `worker/README.md`.
- Repo default/live branch: `main`.
- Custom domain: `rasnaexperience.com`.
- Site content changes (the 2026-07-23 About page rewrite, the "Italian
  Autumn Experience" → "Italian Olive Experience" rename, the Planned
  Events nav-jump fix, new SEO infrastructure, and the pending Google
  Search Console verification for next session) are tracked in
  `CLAUDE.md`, not here — this file stays scoped to booking/payment
  backend status.
