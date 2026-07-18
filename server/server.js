require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const { loadDepartures, getDeparture } = require('./lib/departures');
const {
  spotsUsed,
  createPendingBooking,
  attachStripeSession,
  getBookingBySessionId,
  markPaid,
  markExpired,
  listBookings,
  deleteBooking,
} = require('./lib/db');

const PORT = process.env.PORT || 4242;
const SITE_URL = (process.env.SITE_URL || 'http://localhost:8080').replace(/\/$/, '');
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
const CUSTOM_PRICE_PER_PERSON = Number(process.env.CUSTOM_PRICE_PER_PERSON || 1450);
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // required to unlock /admin
const CHECKOUT_EXPIRY_MINUTES = 30; // Stripe's minimum

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[rasna-booking-api] WARNING: STRIPE_SECRET_KEY is not set. Checkout will fail until it is.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
app.use(
  cors({
    origin: CORS_ORIGINS.includes('*') ? true : CORS_ORIGINS,
  })
);

// --- Stripe webhook: must read the RAW body, so this is mounted before express.json() ---
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const booking = getBookingBySessionId(session.id);
    if (booking && booking.status === 'pending') {
      markPaid(booking.id, session.payment_intent);
      console.log(`[booking ${booking.id}] paid — ${booking.name} <${booking.email}> x${booking.num_guests}`);
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const booking = getBookingBySessionId(session.id);
    if (booking) {
      markExpired(booking.id);
      console.log(`[booking ${booking.id}] expired — spot released`);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// --- Departures + live availability ---
app.get('/api/departures', (req, res) => {
  const departures = loadDepartures().map((d) => {
    const used = spotsUsed(d.id);
    return {
      id: d.id,
      label: d.label,
      start_date: d.start_date,
      end_date: d.end_date,
      capacity: d.capacity,
      remaining: Math.max(0, d.capacity - used),
      price_per_person: d.price_per_person,
      currency: d.currency || 'eur',
    };
  });
  res.json({ departures });
});

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCommon(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) errors.push('name is required');
  if (!isValidEmail(body.email)) errors.push('a valid email is required');
  const numGuests = Number(body.num_guests);
  if (!Number.isInteger(numGuests) || numGuests < 1 || numGuests > 8) {
    errors.push('num_guests must be an integer between 1 and 8');
  }
  return { errors, numGuests };
}

async function createCheckoutSession({ label, numGuests, pricePerPerson, currency, email, bookingId }) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(pricePerPerson * 100),
          product_data: { name: `Rasna — ${label} (${numGuests} guest${numGuests > 1 ? 's' : ''})` },
        },
        quantity: numGuests,
      },
    ],
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60,
    success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/cancel.html`,
    metadata: { booking_id: String(bookingId) },
  });
}

// --- Book a spot on the fixed November departure ---
app.post('/api/bookings/fixed', async (req, res) => {
  const body = req.body || {};
  const { errors, numGuests } = validateCommon(body);
  if (!body.departure_id) errors.push('departure_id is required');
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const departure = getDeparture(body.departure_id);
  if (!departure) return res.status(404).json({ error: 'Unknown departure_id' });

  // Synchronous check-then-insert: no `await` between the read and the
  // write, so no other request can interleave and oversell the departure.
  const used = spotsUsed(departure.id);
  const remaining = departure.capacity - used;
  if (numGuests > remaining) {
    return res.status(409).json({
      error:
        remaining <= 0
          ? 'This departure is fully booked.'
          : `Only ${remaining} spot(s) left on this departure.`,
      remaining,
    });
  }

  const amountTotalCents = Math.round(departure.price_per_person * 100) * numGuests;
  const bookingId = createPendingBooking({
    type: 'fixed',
    departure_id: departure.id,
    name: body.name.trim(),
    email: body.email.trim(),
    num_guests: numGuests,
    activities: JSON.stringify(body.activities || []),
    preferred_dates: null,
    notes: body.notes || null,
    amount_total_cents: amountTotalCents,
    currency: departure.currency || 'eur',
  });

  try {
    const session = await createCheckoutSession({
      label: departure.label,
      numGuests,
      pricePerPerson: departure.price_per_person,
      currency: departure.currency || 'eur',
      email: body.email.trim(),
      bookingId,
    });
    attachStripeSession(bookingId, session.id);
    res.json({ url: session.url });
  } catch (err) {
    deleteBooking(bookingId); // don't let a failed Stripe call hold a phantom spot
    console.error('Stripe session creation failed:', err.message);
    res.status(502).json({ error: 'Could not start checkout. Please try again shortly.' });
  }
});

// --- Book a custom, self-chosen-dates trip (private group, no shared pool) ---
app.post('/api/bookings/custom', async (req, res) => {
  const body = req.body || {};
  const { errors, numGuests } = validateCommon(body);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });

  const label = 'Custom Expedition';
  const amountTotalCents = Math.round(CUSTOM_PRICE_PER_PERSON * 100) * numGuests;
  const bookingId = createPendingBooking({
    type: 'custom',
    departure_id: null,
    name: body.name.trim(),
    email: body.email.trim(),
    num_guests: numGuests,
    activities: JSON.stringify(body.activities || []),
    preferred_dates: body.preferred_dates || null,
    notes: body.notes || null,
    amount_total_cents: amountTotalCents,
    currency: 'eur',
  });

  try {
    const session = await createCheckoutSession({
      label,
      numGuests,
      pricePerPerson: CUSTOM_PRICE_PER_PERSON,
      currency: 'eur',
      email: body.email.trim(),
      bookingId,
    });
    attachStripeSession(bookingId, session.id);
    res.json({ url: session.url });
  } catch (err) {
    deleteBooking(bookingId); // don't let a failed Stripe call hold a phantom spot
    console.error('Stripe session creation failed:', err.message);
    res.status(502).json({ error: 'Could not start checkout. Please try again shortly.' });
  }
});

// --- Admin: the booking record ---
function requireAdminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).send('Admin is not configured. Set ADMIN_PASSWORD on the server.');
  }
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [user, pass] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Rasna Admin"');
  return res.status(401).send('Authentication required.');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

app.get('/admin', requireAdminAuth, (req, res) => {
  const bookings = listBookings();
  const departures = loadDepartures().map((d) => ({ ...d, used: spotsUsed(d.id) }));

  const depRows = departures
    .map(
      (d) =>
        `<tr><td>${escapeHtml(d.label)}</td><td>${d.used} / ${d.capacity}</td><td>${Math.max(0, d.capacity - d.used)}</td></tr>`
    )
    .join('');

  const bookingRows = bookings
    .map(
      (b) => `<tr>
        <td>${b.id}</td>
        <td>${escapeHtml(b.status)}</td>
        <td>${escapeHtml(b.type)}</td>
        <td>${escapeHtml(b.departure_id || (b.preferred_dates ? 'custom: ' + b.preferred_dates : 'custom'))}</td>
        <td>${escapeHtml(b.name)}</td>
        <td>${escapeHtml(b.email)}</td>
        <td>${b.num_guests}</td>
        <td>${(b.amount_total_cents / 100).toFixed(2)} ${b.currency.toUpperCase()}</td>
        <td>${escapeHtml(b.created_at)}</td>
      </tr>`
    )
    .join('');

  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Rasna — Bookings</title>
    <style>
      body{font-family:system-ui,sans-serif;margin:2rem;background:#f2ebdd;color:#2c1e12}
      table{border-collapse:collapse;width:100%;margin-bottom:2.5rem;background:#fff}
      th,td{border:1px solid #ccc;padding:0.5rem 0.7rem;font-size:0.85rem;text-align:left}
      th{background:#2c1e12;color:#e5d8c2}
      h1,h2{font-weight:600}
      a.btn{display:inline-block;margin-bottom:1rem;padding:0.5rem 1rem;background:#b8593e;color:#fff;text-decoration:none;border-radius:4px}
    </style></head><body>
    <h1>Rasna — Bookings</h1>
    <a class="btn" href="/admin/bookings.csv">Download CSV</a>
    <h2>Departure capacity</h2>
    <table><tr><th>Departure</th><th>Used</th><th>Remaining</th></tr>${depRows || '<tr><td colspan="3">No departures configured</td></tr>'}</table>
    <h2>All bookings</h2>
    <table><tr><th>ID</th><th>Status</th><th>Type</th><th>Departure / Dates</th><th>Name</th><th>Email</th><th>Guests</th><th>Amount</th><th>Created</th></tr>${bookingRows || '<tr><td colspan="9">No bookings yet</td></tr>'}</table>
  </body></html>`);
});

app.get('/admin/bookings.csv', requireAdminAuth, (req, res) => {
  const bookings = listBookings();
  const header = [
    'id', 'status', 'type', 'departure_id', 'name', 'email', 'num_guests',
    'amount_total', 'currency', 'preferred_dates', 'activities', 'notes', 'created_at',
  ];
  const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const b of bookings) {
    lines.push(
      [
        b.id, b.status, b.type, b.departure_id, b.name, b.email, b.num_guests,
        (b.amount_total_cents / 100).toFixed(2), b.currency, b.preferred_dates, b.activities, b.notes, b.created_at,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="rasna-bookings.csv"');
  res.send(lines.join('\n'));
});

app.listen(PORT, () => {
  console.log(`Rasna booking API listening on port ${PORT}`);
});
