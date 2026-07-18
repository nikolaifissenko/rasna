# Rasna booking API (Cloudflare Workers + D1)

Handles Stripe Checkout, keeps the booking record, and enforces the
8-person cap on the fixed November departure. Runs on Cloudflare
Workers with a D1 (SQLite-compatible) database — genuinely free, no
credit card, doesn't sleep or pause between bookings. The marketing
site (`index.html` at the repo root, on GitHub Pages) calls this API
over HTTP.

## Go-live checklist

1. **Install the CLI and log in.**
   ```bash
   cd worker
   npm install
   npx wrangler login
   ```
   This opens a browser to sign up/log into Cloudflare (free, no card
   required for this usage) and authorizes the CLI.

2. **Create the D1 database.**
   ```bash
   npx wrangler d1 create rasna-bookings
   ```
   This prints a `database_id`. Open `wrangler.toml` and replace
   `REPLACE_WITH_YOUR_D1_DATABASE_ID` with that value.

3. **Create the bookings table.**
   ```bash
   npm run db:migrate:remote
   ```

4. **Set the three secrets** (never committed to the repo):
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   npx wrangler secret put ADMIN_PASSWORD
   ```
   Each prompts you to paste a value.
   - `STRIPE_SECRET_KEY`: Stripe Dashboard → Developers → API keys.
     Start with the `sk_test_...` key; switch to `sk_live_...` only
     after a successful test booking (step 7).
   - `STRIPE_WEBHOOK_SECRET`: you'll get this in step 5 — come back and
     run this command again to overwrite the placeholder once you have
     it (or do steps 5 and 4c in either order, `wrangler secret put`
     can be re-run any time and updates immediately).
   - `ADMIN_PASSWORD`: pick something strong — unlocks `/admin`, which
     shows guest names, emails, and payment amounts.

5. **Deploy.**
   ```bash
   npm run deploy
   ```
   Wrangler prints the live URL, in the form
   `https://rasna-booking-api.<your-account-subdomain>.workers.dev`.

6. **Point the site at it.** In `index.html`, find:
   ```html
   <script>window.RASNA_API_BASE = 'https://rasna-booking-api.YOUR-SUBDOMAIN.workers.dev';</script>
   ```
   Replace with the real URL from step 5, commit, and push to the
   branch GitHub Pages deploys from.

7. **Create the Stripe webhook.** Stripe Dashboard → Developers →
   Webhooks → Add endpoint:
   - URL: `<your worker URL>/webhook/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the signing secret (`whsec_...`) and run
     `npx wrangler secret put STRIPE_WEBHOOK_SECRET` again with it.

   **Without this, payments go through but bookings never flip from
   "pending" to "paid," and capacity never updates.**

8. **Test with a real (test-mode) payment** before flipping to live
   keys. Visit your live site, book the November departure, and pay
   with Stripe's test card `4242 4242 4242 4242` (any future expiry,
   any CVC). Confirm it redirects to the success page, then check
   `<your worker URL>/admin` (Basic Auth: `admin` / the password from
   step 4) — the booking should show as `paid` and `remaining` on
   `/api/departures` should have decreased.

9. **Switch to live Stripe keys.** Back in Stripe, flip to Live mode,
   grab the live secret key and create a second webhook (same URL,
   same events, live mode). Re-run `wrangler secret put
   STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` with the live values.
   No redeploy needed — secrets take effect immediately.

## What it does

- `GET /api/departures` — live availability for the fixed departure(s)
  configured in `src/departures.js`.
- `POST /api/bookings/fixed` — books N spots on a fixed departure.
  Capacity check and insert happen as a **single atomic SQL statement**
  (see `src/db.js`), so concurrent requests can't oversell a departure
  — verified locally by firing 5 simultaneous requests at a departure
  with 1 spot left: exactly one succeeded, the other four were
  correctly rejected as "fully booked."
- `POST /api/bookings/custom` — same, but for a private "choose your
  own dates" trip (capped at 8 guests per booking, no shared pool).
- `POST /webhook/stripe` — Stripe calls this when checkout completes or
  expires. This is what actually confirms a booking as **paid** — the
  browser redirect alone is never trusted for that.
- `GET /admin` / `GET /admin/bookings.csv` — HTTP Basic Auth view and
  CSV export of every booking. This is the booking record; Stripe's own
  Dashboard is a second, independent record of every payment.

## Configuring the November departure (and any future ones)

Edit `src/departures.js` directly, then `npm run deploy` to publish —
no database migration needed, it's static config baked into the
Worker. Add more objects to the array to open more fixed departures;
each gets its own independent 8-person pool. Set `active: false` to
close one without deleting its booking history.

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in test values
npm run db:migrate:local          # sets up a local D1 emulation, no Cloudflare account needed
npm run dev                       # http://localhost:8787
```

`wrangler dev` emulates D1 locally with no network calls to Cloudflare,
so you can develop and test the whole booking flow (except real Stripe
payments) fully offline.

## Environment variables reference

| Variable | Set via | What it's for |
|---|---|---|
| `STRIPE_SECRET_KEY` | `wrangler secret put` | Server-side Stripe key. |
| `STRIPE_WEBHOOK_SECRET` | `wrangler secret put` | Verifies webhook calls really come from Stripe. |
| `ADMIN_PASSWORD` | `wrangler secret put` | Basic auth password for `/admin`. |
| `SITE_URL` | `wrangler.toml [vars]` | Where the static site lives — Stripe redirects here after payment. |
| `CORS_ORIGIN` | `wrangler.toml [vars]` | Comma-separated origins allowed to call this API from a browser. |
| `CUSTOM_PRICE_PER_PERSON` | `wrangler.toml [vars]` | Price for the "choose your own dates" path. Keep in sync with `PRICE_PER_PERSON` in `index.html` and the Pricing section. |
| `ADMIN_USER` | `wrangler.toml [vars]` | Basic auth username for `/admin` (default `admin`). |
