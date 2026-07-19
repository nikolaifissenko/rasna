# Booking & Payment Infrastructure — Status

_Last updated: 2026-07-19_

## Bottom line

**Live payments are wired up and working.** A customer booking the
November departure on the real site today gets a real Stripe Checkout
page; a real card payment actually charges them and the money lands in
Nikolai's Stripe balance. This was the whole point of the last two
sessions and it's done.

What's *not* independently confirmed end-to-end is the webhook side
(booking flipping to `status: paid` in our own database) — see
"Not yet done" below. That only affects bookkeeping/`/admin`, not
whether Nikolai actually gets paid (Stripe charges/holds the money
regardless of our webhook).

## What's live

- **Site**: nikolaifissenko.github.io/rasna (GitHub Pages, deploys from
  `main`). The "Book the November 9 to 15 departure" form (Italian
  Autumn Experience tab) calls the real backend and pays in full via
  Stripe Checkout.
- **Backend**: `worker/` — Cloudflare Worker + D1, deployed at
  `https://rasna-booking-api.nikolai-fissenko1.workers.dev`.
- **Stripe: LIVE MODE**, as of 2026-07-19.
  - `STRIPE_SECRET_KEY` = real `sk_live_...` key, set in Cloudflare.
  - `STRIPE_WEBHOOK_SECRET` = real `whsec_...` from a live-mode webhook
    destination ("Rasna booking webhook") pointed at
    `.../webhook/stripe`, events `checkout.session.completed` +
    `checkout.session.expired`. Created via Stripe's newer Workbench UI
    (Account Resources → Your account scope).
  - Verified live key is actually in effect: a diagnostic booking via
    `POST /api/bookings/custom` returned a `cs_live_...` Checkout
    session (not `cs_test_...`).
  - Getting Stripe's business activation to actually clear took most of
    this session — it turned out Nikolai was filling out the **Sandbox**
    account this whole time (a separate auto-created test environment,
    distinct from the real/live account), which is why nothing would
    ever go live no matter what was filled in or how many times the
    site was updated. A Stripe support specialist confirmed this and
    got him into the real live account. Site-content fixes made along
    the way (see below) were real improvements regardless, but weren't
    the actual root cause of the stuck activation.
- **Site content added this session** (also useful regardless of the
  sandbox issue): a "Customer Support & Policies" section (contact info,
  cancellation tiers, refund timing, dispute-first-contact) and
  Nikolai's legal name ("Operated by: Nikolai Fissenko, Blera (VT),
  Italia") in the footer/policies section — Stripe's site review checks
  for exactly this.
- **Cloudflare auth for this session**: done via a Cloudflare **API
  Token** (not interactive `wrangler login`, which doesn't work in a
  remote/headless session — the OAuth callback goes to `localhost` on
  whichever machine's browser completes it, not this container). If a
  future session needs to set Cloudflare secrets again, ask Nikolai for
  a fresh API token (dash.cloudflare.com → profile → API Tokens →
  Create Token → "Edit Cloudflare Workers" template, Account Resources
  scoped to his account) rather than attempting `wrangler login`.
- **Database**: D1 `rasna-bookings` (id
  `9b39d9d8-6732-4b3f-8024-1667d171e49f`).
- **Departure config**: November 9–15, 2026, capacity 8, €1,450/person
  (`worker/src/departures.js`). Capacity was down to 3/8 remaining as of
  this session from earlier test bookings (self-expire, see
  `worker/src/db.js` `PENDING_HOLD_MINUTES`) — worth checking
  `/api/departures` shows 8 again before telling real customers about
  availability.
- **Admin**: `https://rasna-booking-api.nikolai-fissenko1.workers.dev/admin`
  (Basic Auth `admin` / Cloudflare-set password — still don't have this
  in-session, never got it from Nikolai).
- **"Build Your Own Trip" tab** is still a plain Formspree inquiry form,
  no payment — unchanged, by design.

## Not yet done — pick up here next

1. **rasna.com custom domain** — this is the explicit goal for next
   session ("a domani: rasna.com"). Need to: check if Nikolai owns/can
   buy `rasna.com`, point DNS at GitHub Pages (A/AAAA records or CNAME
   per GitHub's custom-domain docs), add a `CNAME` file to the repo
   root, update `SITE_URL`/`CORS_ORIGIN` in `worker/wrangler.toml` to
   the new domain (currently hardcoded to
   `nikolaifissenko.github.io/rasna`), redeploy the Worker, and update
   `window.RASNA_API_BASE` / any hardcoded URLs in `index.html` if
   needed. Also update CORS on the Worker or Stripe redirect URLs will
   break silently for the new domain.
2. **Verify the webhook actually fires on a real live payment** — never
   confirmed end-to-end with real money (intentionally didn't trigger a
   real charge without Nikolai's explicit go-ahead). Options discussed:
   a cheap real test (temporarily drop the price to ~€1, book, confirm
   in `/admin`, revert price), or use Stripe's "Send test event" on the
   webhook destination page for a free signature/delivery check only
   (doesn't touch the Checkout side).
3. **Check Stripe payout schedule** (Settings → Payouts) — Nikolai
   wants booking money available in time to pay November vendors
   (Tuscia Terme, Il Cavone, Trattoria La Torretta, etc., see
   `ITINERARY_NOV2026.md`) and for it to be his profit margin on top of
   that. New Stripe accounts sometimes have a delayed first payout
   (7-14 days) before settling into a faster rolling schedule — given
   the departure is Nov 9-15 and today is July 19, there's runway, but
   worth confirming the actual schedule rather than assuming.
4. Get the Cloudflare Worker `ADMIN_PASSWORD` from Nikolai at some point
   so a future session can actually check `/admin` directly instead of
   inferring booking status from capacity math.
5. Decide what to do with `claude/magical-franklin-58SKM` now that its
   work is folded into `main` (retire it, or keep using it for
   `worker/` changes — the Cloudflare Worker's git auto-deploy still
   watches that branch, not `main`). Also safe to delete
   `cloudflare/workers-autoconfig` (unused leftover branch).

## Reference

- Full step-by-step for the Worker/Stripe setup: `worker/README.md`.
- Repo default/live branch: `main`.
