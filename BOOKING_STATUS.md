# Booking & Payment Infrastructure — Status

_Last updated: 2026-08-12_

## 2026-08-12 update: hero no longer links straight to the booking form

**No backend/pricing/payment changes** — a frontend link-target change
only, noted here because it changes where the booking funnel starts.
The homepage hero's primary button briefly pointed straight at
`italian-olive-experience-pricing.html#festival-book` (and there was a
brief `location.replace()` experiment that redirected any bare
homepage visit straight to that same booking page). Both reverted per
explicit feedback ("it needs to take you to the experience page not
the booking page") — the hero CTA now scrolls to `index.html#festival-week`
(the hub, which as of this same session also has the full itinerary
embedded in it — see `CLAUDE.md`). Guests now reach the booking form
by clicking through from the hub's "Pricing & Booking" card or the
sub-nav, not directly from the hero. The form itself, its Worker/D1/Stripe
wiring, and current pricing are all unchanged — see the entries below.

## 2026-08-11 update: booking form moved off index.html onto its own page

**No backend/pricing changes this update** — this is a frontend
location change only, flagged here because it affects where the
booking flow actually lives. `index.html` was split into a family of
dedicated November Experience pages (see `CLAUDE.md`'s "Current
architecture of the November Experience pages" for the full picture).
As part of that:
- The live `#festival-form` booking form and the `.price-cards`
  pricing display — previously inline on `index.html` at
  `#festival-book`/`#price-chart` — now live on
  **`italian-olive-experience-pricing.html`**, same element IDs
  (`#festival-book`, `#price-chart-table`, etc.), same
  `fetch('/api/departures')` + `POST /api/bookings/fixed` JS, ported
  verbatim. **No API/Worker changes** — this page hits the exact same
  endpoints the old inline form did.
- `index.html` no longer has a booking form or price chart at all — it
  links out to the new page instead. If debugging "the booking form
  isn't showing on the homepage," that's expected now, not a bug.
- The founder pull-quote (`.quote-band`) also moved, to right after the
  booking form on the new pricing page.
- `italian-olive-experience-itinerary.html`'s own mini pricing section
  (added 2026-08-10) now links to `italian-olive-experience-pricing.html`
  instead of `index.html#price-chart`/`#festival-book`.

## 2026-08-10 update: replaced flat pricing with room-type x booking-window tiers

**This supersedes the "price raised to €1,800/€1,400 Founding Guest"
entry directly below** — that model (flat price_per_person +
first-2-spots founding discount) no longer exists. A fresh session
(fourth branch-drift incident, see `CLAUDE.md`) rebuilt pricing at
Nikolai's request, inspired by a competitor trip-guide PDF he shared
that had a proper room-type x booking-window price matrix.

**Live pricing right now** (`worker/src/departures.js` on
`claude/magical-franklin-58SKM`, deployed):

| | Early Bird (through Sep 15) | Regular (Sep 16–Oct 25) | Final (after Oct 25) |
|---|---|---|---|
| Shared room (per person) | €1,400 | €1,500 | €1,600 |
| Private room (per person) | €1,600 | €1,700 | €1,800 |

First matrix drafted had private room going up to €2,100 (a flat +€300
premium over shared at every tier) — Nikolai corrected this immediately
("the prices are too high the price is between 1400 and 1800"), so the
whole grid was compressed to fit inside the already-published
€1,400–1,800 range instead. If revisiting these numbers, keep the max
at €1,800 unless he explicitly says otherwise.

**Mechanics:**
- `room_type` (`'shared'` or `'private'`) is now a **required** field on
  `POST /api/bookings/fixed` — validated server-side
  (`isValidRoomType`), 400s if missing/invalid. It's per-*booking*, not
  per-guest: a group booking 3 guests as "private" pays the private
  rate x3, not a mix.
- Which of the three date-tiers applies is computed from **the Worker's
  server clock** at the moment of booking (`currentPriceTier()` in
  `departures.js`), never trusted from the client — a booking can't be
  gamed by claiming an earlier tier.
- `/api/departures` now returns the full `pricing` object (all 6
  numbers), `pricing_windows` (the two cutoff dates), `current_tier`,
  and convenience fields `price_shared`/`price_private` for whichever
  tier is active right now. The old `price_per_person`,
  `founding_discount_price`, `founding_discount_spots`,
  `founding_discount_remaining` fields are **gone** — anything reading
  them will get `undefined`.
- **D1 migration 0003_room_type.sql applied to the remote production
  database** this session (`ALTER TABLE bookings ADD COLUMN
  room_type TEXT`) — confirmed via `PRAGMA table_info(bookings)`
  showing the column. `room_type` is also now a column in the
  `/admin` bookings table and the CSV export, so actual room
  assignment/fulfillment is trackable.
- Frontend (`main`): the November Experience page
  (`index.html#price-chart`) shows a two-card pricing display (Shared /
  Private, olive/terracotta accents respectively) with the currently
  active tier highlighted, populated live from `/api/departures` so it
  can never drift from what Stripe actually charges. The booking form
  (`#festival-form`) has a new required "Room type" dropdown alongside
  guest count, sent as `room_type` in the POST body.
  `italian-olive-experience-itinerary.html`'s pricing section mirrors
  the same live shared/private/tier values and links to the full chart.

**Not done / explicitly deferred:**
- **No capacity cap per room type.** The 8-guest total cap (via `SUM
  ("num_guests") WHERE status='paid'`) still works exactly as before,
  but nothing stops all 8 guests from booking "private" even if the
  real B&B only has, say, 2 private rooms. Nikolai confirmed the actual
  room mix isn't locked down yet (Da Beccone vs. a candidate called
  Casamatta — see `CONTATTI_LOCALI.md` — he's sending room photos in a
  future session). Once the real inventory is known, this probably
  needs a real per-room-type capacity check in `createFixedBooking`'s
  atomic insert, similar to how total capacity works now.
- **Photography & privacy policy**: not added. A competitor reference
  guide had one (guests consent to being photographed for marketing,
  can opt out); unclear whether Rasna actually does this, so nothing
  was added rather than inventing a policy. Ask Nikolai directly if it
  comes up again.
- **Force majeure wording**: left as-is. Rasna's existing "unavoidable
  and extraordinary circumstances" clause (`index.html#policies`)
  already gives a full refund; the reference guide's version was a
  credit-or-partial-refund (more business-protective, less
  guest-friendly). Didn't downgrade guest terms without an explicit ask.
- **`about-nikolai-bar.jpg`** (used on `about.html` as
  `.about-photo-accent`) has a video-UI mute/profile icon visibly baked
  into the actual JPEG — looks like it was extracted from an Instagram
  Story/video rather than a clean photo. Noticed while picking a photo
  for the new "Meet your host" block on the November page (used
  `about-nikolai-portrait.jpg` instead specifically to avoid this).
  Not fixed on `about.html` itself — out of scope this session, flagging
  for whenever new/cleaner Nikolai photos are available.

**Credential handling note:** Nikolai pasted a live Cloudflare API
token + R2 S3 credentials directly in chat when asked for a D1-scoped
token. The token turned out to have broader access than a pure R2
token (it could list/edit D1 databases too — used it to run the
migration above). Recommended he revoke/rotate it since it was
pasted in plaintext chat; unknown whether he's done so. It was used
only via shell env vars for the single `wrangler d1 migrations apply`
command and never written to any file in the repo.

## 2026-08-10 (earlier) update: price raised to €1,800 / €1,400 Founding Guest

Still 0/8 paid on the Nov 9–15 departure. Per Nikolai's direction
("whatever you think is commercially viable"), raised the real Stripe
price: `worker/src/departures.js` on `claude/magical-franklin-58SKM`
now has `price_per_person: 1800` (was 1450) and
`founding_discount_price: 1400` (was 1230, still first 2 spots, now
~22% off instead of ~15%). Pushed as a single-file commit on top of that
branch's existing tip — did not touch anything else on the branch (see
`CLAUDE.md`'s "Deploy topology gotcha" for why that matters here).

All `main` copy that quoted the old price was updated in the same
session: `index.html`'s `Offer` JSON-LD, both FAQ answers, and
`#festival-book-subtitle`'s static fallback text. Nothing dynamic needed
touching — `#festival-book`'s founding-badge/price display and the new
`italian-olive-experience-itinerary.html` pricing block both read
`price_per_person`/`founding_discount_price` live from `/api/departures`,
so they picked up the new numbers automatically once the Worker
redeployed (Cloudflare's git integration watches
`claude/magical-franklin-58SKM`, confirmed ~2 min turnaround in the
2026-07-24 entry below).

**This session also hit the branch-drift trap again** (third time, see
`CLAUDE.md`'s 2026-08-10 entry for the full account) — real effort was
spent building a "meet the people" section, a standalone
cancellation-policy.html, and pricing UI against the dead
`claude/magical-franklin-58SKM`-lineage designated branch before
catching it. That work is inert, not reverted, same as prior incidents.
The cancellation-policy work was redone correctly: `main`'s existing
inline policy (`index.html#policies`) already covered the refund tiers,
so no new page was needed — it was just missing the unavoidable-
circumstances and Rasna-cancels carve-outs, now added.

## 2026-08-03 update: warm-outreach drafts + SEO handoff

Still 0/8 paid on the Nov 9–15 departure as of the last check. This
session's work was outreach-side, not code:

- **American-friends-in-Blera channel**: Nikolai confirmed he's already
  personally talked to them about the project — that channel (see the
  Marketing section below) can be considered contacted, not just planned.
- **3 named warm-outreach messages drafted** (casual/personal tone, framed
  as "sharing something I'm building, curious what you think," explicitly
  not a hard sell, per Nikolai's direction) — **drafted only, not yet
  confirmed sent**:
  - A returning tour client who texted to book another golf-cart tour in
    Sept for a friend — reply handles the Sept booking and adds the Rasna
    link/pitch.
  - Samantha + her husband (past golf-cart tour clients).
  - Rachel, a fellow guide Nikolai's worked with — pitched as wanting her
    professional opinion specifically, not just a personal share.
  - None of these are logged as "sent" — confirm with Nikolai before
    treating them as done in future updates.
- **`SEO_BRIEF.md` added to `main`** — audit of current SEO state (what's
  done: real photography, OG/Twitter tags, JSON-LD, robots.txt/sitemap)
  and what's still open (Google Search Console verification blocked on
  Nikolai, an unresolved image-licensing question, a PageSpeed check) for
  whichever session picks up SEO work next. Note: an earlier version of
  this same file was mistakenly written against and pushed to the stale
  `claude/magical-franklin-58SKM` branch before catching the branch-drift
  mistake (see this file's 2026-07-24 entry below for the same trap
  happening previously) — that copy has been removed; `main`'s version
  is the correct one.

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

**2026-08-10 note: this section is stale below (dates from before the
pricing overhaul at the top of this file) — for current pricing/status,
read the top entry first.** Short version as of now: booking flow is
live end-to-end with the new room-type x booking-window pricing,
D1 migration applied, no known bugs, but room-type capacity isn't
enforced yet (see top entry).

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
- **Lodging (updated 2026-08-13): Casamatta is now the confirmed
  lodging partner, replacing Da Beccone, and capacity is confirmed
  sufficient.** The B&B originally slated for the Nov 9–15, 2026
  departure (Antonella, B&B La Ripa) was unavailable that week; Da
  Beccone was then confirmed as the alternative (rates collected
  2026-07-23). Nikolai has now confirmed he's officially working with
  **Casamatta** instead — two independent apartments at Vicolo di
  Civitella 22/26, Blera (pieno centro storico): one sleeping 6 with 2
  bathrooms, one sleeping 3 with 1 bathroom, both with their own
  kitchen, WiFi, and independent entrance. **9 beds total covers the
  8-guest cap.** See `CONTATTI_LOCALI.md` §8 for the full listing
  details (this supersedes an earlier, informally-collected 3-apartment
  estimate from 2026-07-24 — see that section for the discrepancy
  note). **Rate confirmed the same day: €60/guest/night, flat** (not
  room-type-dependent) — `FINANCIAL_PLAN.md` §1 now runs the real
  margin numbers against this rate for the 6-night Nov departure
  (~32%–46% depending on tier/room, healthier than the old Da Beccone
  worst case). **Nothing left open on lodging for this departure** —
  partner, capacity, and rate are all confirmed.
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
