# Rasna booking API

Small Node/Express server that handles Stripe Checkout, keeps the booking
record (SQLite), and enforces the 8-person cap on the fixed November
departure. The marketing site (`index.html` at the repo root) stays static
and calls this API over HTTP.

## Go-live checklist (do this to open real bookings)

A `render.yaml` blueprint at the repo root is already wired up to deploy
this API to [Render](https://render.com) with a persistent disk, pointed
at `https://rasna-booking-api.onrender.com` — `index.html` already
expects that exact URL. These are the only steps left, and only you can
do them (they need your accounts and payment details):

1. **Deploy the API.** On [render.com](https://dashboard.render.com/blueprints),
   New → Blueprint → connect the `rasna` GitHub repo → Render reads
   `render.yaml` and proposes the `rasna-booking-api` service with a 1GB
   disk. Requires Render's **Starter** plan (~$7/mo) — the free tier has
   no persistent disk, and the SQLite file would be wiped on every
   restart without one.
2. **Add the three secrets Render will prompt for** (it won't deploy
   without them, and these are exactly the ones marked `sync: false` in
   `render.yaml` so they're never committed to the repo):
   - `STRIPE_SECRET_KEY` — from Stripe Dashboard → Developers → API keys.
     Start with `sk_test_...`, switch to `sk_live_...` once you've done a
     real test booking (step 5).
   - `STRIPE_WEBHOOK_SECRET` — from step 3 below.
   - `ADMIN_PASSWORD` — pick something strong; unlocks `/admin`, which
     shows guest names, emails, and payment amounts.
3. **Create the Stripe webhook.** Stripe Dashboard → Developers →
   Webhooks → Add endpoint → URL `https://rasna-booking-api.onrender.com/webhook/stripe`,
   events `checkout.session.completed` and `checkout.session.expired`.
   Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` on
   Render (step 2). **Without this, payments go through but bookings
   never flip from "pending" to "paid," and capacity never updates.**
4. **Merge the PR** (or make sure `index.html` on your GitHub Pages
   branch already points `window.RASNA_API_BASE` at
   `https://rasna-booking-api.onrender.com`) so the live site talks to
   the deployed API.
5. **Test with a real (test-mode) payment** before flipping to live
   keys — see §7 below. Card `4242 4242 4242 4242`, any future expiry,
   any CVC.
6. **Switch to live Stripe keys** on Render once the test booking shows
   up correctly on `/admin` and Stripe decrements `remaining` on
   `/api/departures`.

Everything else in this file is reference detail for the steps above.

## What it does

- `GET /api/departures` — live availability for the fixed departure(s)
  configured in `config/departures.json`.
- `POST /api/bookings/fixed` — books N spots on a fixed departure. Checks
  remaining capacity, creates a pending booking row, starts a Stripe
  Checkout Session for the full amount, returns the checkout URL.
- `POST /api/bookings/custom` — same, but for a private "choose your own
  dates" trip (capped at 8 guests per booking, doesn't share a capacity
  pool with anyone else).
- `POST /webhook/stripe` — Stripe calls this when checkout completes or
  expires. This is what actually confirms a booking as **paid** — a
  browser redirect alone is never trusted for that.
- `GET /admin` — HTTP Basic Auth page showing every booking and each
  departure's fill level. `GET /admin/bookings.csv` for a CSV export.

Bookings live in a SQLite file (`data/bookings.db` by default) — that
file **is** the record. Stripe's own Dashboard is a second, independent
record of every payment.

## 1. Local setup

```bash
cd server
npm install
cp .env.example .env   # fill in real values, see below
npm start               # listens on :4242 by default
```

## 2. Stripe setup (you said you already have an account)

1. Grab your **secret key** from the Stripe Dashboard → Developers → API
   keys. Use a `sk_test_...` key while testing, switch to `sk_live_...`
   only once you're ready to take real payments.
2. Set `STRIPE_SECRET_KEY` in `.env` to that value.
3. Create a webhook endpoint: Dashboard → Developers → Webhooks → Add
   endpoint, URL = `https://<your-api-domain>/webhook/stripe`, and select
   at least these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Copy the webhook's **signing secret** (`whsec_...`) into
   `STRIPE_WEBHOOK_SECRET`.
5. For local testing without a public URL, use the Stripe CLI instead:
   `stripe listen --forward-to localhost:4242/webhook/stripe` — it prints
   a temporary `whsec_...` to use locally.

**Without a correctly configured webhook, bookings will stay "pending"
forever and never flip to "paid" — the admin page and capacity count
both depend on it.**

## 3. Configuring the November departure (and any future ones)

Edit `config/departures.json` directly — no code changes needed, just
restart the server (or redeploy) after editing:

```json
[
  {
    "id": "2026-11-09",
    "label": "November 9–15, 2026",
    "start_date": "2026-11-09",
    "end_date": "2026-11-15",
    "capacity": 8,
    "price_per_person": 1450,
    "currency": "eur",
    "active": true
  }
]
```

This is the current, confirmed launch departure. Add more objects to
the array to open more fixed departures later; each gets its own
independent 8-person pool. Set `"active": false` to close a departure
without deleting its history.

## 4. Environment variables

See `.env.example` for the full list. The important ones:

| Variable | What it's for |
|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe key. Never expose this in the frontend. |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook calls really come from Stripe. |
| `SITE_URL` | Where the static site is hosted — Stripe redirects here after payment (`/success.html`, `/cancel.html`). |
| `CORS_ORIGIN` | Comma-separated list of origins allowed to call this API from a browser (your site's real domain in production). |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Basic auth for `/admin`. Pick a strong password — this page shows guest names, emails, and payment amounts. |
| `CUSTOM_PRICE_PER_PERSON` | Price used for the "choose your own dates" path. Keep this in sync with `PRICE_PER_PERSON` in `index.html`'s `<script>` and the price shown in the Pricing section. |

## 5. Hosting

This is a plain Node process with a local SQLite file — it needs a host
with a **persistent disk**, not a stateless serverless function (the
SQLite file would vanish between invocations).

**Default path: Render, via `render.yaml`** (see the go-live checklist
above) — it already declares the service, the disk, and the env var
names; you just supply the three secrets in Render's dashboard.

Alternatives, if you'd rather not use Render:
- **Railway** — similar: a service with a volume.
- **Fly.io** — a small VM with a volume.
- Any VPS you already have — `npm install && npm start` behind a
  reverse proxy (Caddy/nginx) with TLS, run under `pm2` or a systemd
  service so it restarts on crash/reboot.

If you use one of these instead of Render, remember to:
1. Deploy this `server/` directory as its own service.
2. Set all the env vars above on that host (never commit `.env`).
3. Point the Stripe webhook at that service's public URL.
4. Update `RASNA_API_BASE` in `index.html` (see below) to that service's
   URL instead of the Render one it currently points to.

The static site (`index.html`, `success.html`, `cancel.html` at the repo
root) can keep living wherever it already does — GitHub Pages, Netlify,
Vercel static hosting, etc. It just needs to know the API's URL.

## 6. Pointing the site at this API

In `index.html`, the booking script reads:

```js
const API_BASE = window.RASNA_API_BASE || 'http://localhost:4242';
```

Once the API is deployed, set `window.RASNA_API_BASE` to its real URL
before the main script runs — easiest way is adding one line near the
top of `<body>` in `index.html`:

```html
<script>window.RASNA_API_BASE = 'https://your-api-domain.example';</script>
```

(The `localhost:4242` fallback is only there so the page still works
during local development.)

## 7. Smoke-testing before going live

1. Use a Stripe **test mode** key, run through both booking tabs, and
   pay with Stripe's test card `4242 4242 4242 4242` (any future expiry,
   any CVC).
2. Confirm the booking shows up as `paid` on `/admin`.
3. Confirm `/api/departures` shows `remaining` decremented.
4. Book past capacity (e.g. push a departure to 8/8 with test bookings)
   and confirm the UI shows "Fully booked" and the API returns 409.
5. Only then switch `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` to live
   values.
