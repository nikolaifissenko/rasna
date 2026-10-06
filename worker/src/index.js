import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Stripe from 'stripe';

import { listDepartures, getDeparture, currentPriceTier, priceForDeparture } from './departures.js';
import {
  spotsUsed,
  createFixedBooking,
  createCustomBooking,
  attachStripeSession,
  getBookingBySessionId,
  updateFlightDetails,
  markPaid,
  markExpired,
  deleteBooking,
  listBookings,
  bookingStatusSummary,
} from './db.js';

const CHECKOUT_EXPIRY_MINUTES = 30; // Stripe's minimum

// Paid bookings are also forwarded to the same Formspree form the
// "Build Your Own Trip" enquiries use, so Nikolai gets an email for each
// one. Override with a FORMSPREE_URL var if the form ever changes.
const DEFAULT_FORMSPREE_URL = 'https://formspree.io/f/xlgynpjo';

const app = new Hono();

app.use('*', async (c, next) => {
  const allowed = (c.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
  return cors({
    origin: allowed.includes('*') ? '*' : allowed,
  })(c, next);
});

async function notifyFormspree(env, booking, session) {
  const departure = booking.departure_id ? getDeparture(booking.departure_id) : null;
  const amount = (session.amount_total ?? booking.amount_total_cents ?? 0) / 100;
  const res = await fetch(env.FORMSPREE_URL || DEFAULT_FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `NEW PAID BOOKING — ${booking.name} x${booking.num_guests}`,
      source: 'Paid booking (Stripe)',
      booking_id: booking.id,
      name: booking.name,
      email: booking.email,
      guests: booking.num_guests,
      trip: departure ? departure.label : booking.preferred_dates || booking.type,
      amount_paid: `${amount.toFixed(2)} ${(session.currency || booking.currency || 'eur').toUpperCase()}`,
      notes: booking.notes || '',
      admin_page: 'https://rasna-booking-api.nikolai-fissenko1.workers.dev/admin',
    }),
  });
  if (!res.ok) console.error(`[booking ${booking.id}] Formspree notify failed: ${res.status} ${await res.text()}`);
}

function stripeClient(env) {
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
}

app.get('/health', (c) => c.json({ ok: true }));

// --- Public, password-free booking status (counts only, no guest data) ---
async function buildStatus(env) {
  const rows = await bookingStatusSummary(env.DB);
  const trips = listDepartures().map((d) => {
    const r = rows.find((x) => x.type === 'fixed' && x.departure_id === d.id);
    return {
      trip: d.label,
      paid_bookings: r ? r.bookings : 0,
      guests: r ? r.guests : 0,
      spots_left: Math.max(0, d.capacity - (r ? r.guests : 0)),
      capacity: d.capacity,
      last_paid_at: r ? r.last_paid_at : null,
    };
  });
  const custom = rows.find((x) => x.type === 'custom');
  return {
    checked_at: new Date().toISOString(),
    total_paid_bookings: rows.reduce((n, r) => n + r.bookings, 0),
    trips,
    custom_trips_paid: custom ? custom.bookings : 0,
  };
}

app.get('/status.json', async (c) => c.json(await buildStatus(c.env)));

app.get('/status', async (c) => {
  const s = await buildStatus(c.env);
  const rows = s.trips
    .map(
      (t) =>
        `<tr><td>${escapeHtml(t.trip)}</td><td>${t.paid_bookings}</td><td>${t.guests}</td><td>${t.spots_left} / ${t.capacity}</td><td>${t.last_paid_at ? escapeHtml(t.last_paid_at) + ' UTC' : '—'}</td></tr>`
    )
    .join('');
  return c.html(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rasna booking status</title>
<style>body{font-family:system-ui,sans-serif;margin:1.5rem;color:#222}h1{font-size:1.3rem}.big{font-size:2.2rem;font-weight:700}table{border-collapse:collapse;margin-top:1rem;width:100%;max-width:720px}td,th{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}small{color:#777}</style></head>
<body><h1>Rasna, paid bookings</h1><div class="big">${s.total_paid_bookings}</div>
<table><tr><th>Trip</th><th>Paid bookings</th><th>Guests</th><th>Spots left</th><th>Last payment</th></tr>${rows}</table>
<p>Custom trips paid: ${s.custom_trips_paid}</p><small>Checked ${escapeHtml(s.checked_at)}. Guest details: /admin (password).</small></body></html>`);
});

// --- Departures + live availability ---
app.get('/api/departures', async (c) => {
  const departures = await Promise.all(
    listDepartures().map(async (d) => {
      const used = await spotsUsed(c.env.DB, d.id);
      const tier = currentPriceTier(d);
      return {
        id: d.id,
        label: d.label,
        start_date: d.start_date,
        end_date: d.end_date,
        capacity: d.capacity,
        remaining: Math.max(0, d.capacity - used),
        currency: d.currency || 'eur',
        pricing: d.pricing,
        pricing_windows: d.pricing_windows,
        current_tier: tier,
        price_per_person: d.pricing[tier],
      };
    })
  );
  return c.json({ departures });
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
  if (body.accepted_waiver !== true) errors.push('you must accept the Liability Waiver & Assumption of Risk');
  if (body.accepted_privacy !== true) errors.push('you must accept the Privacy Policy');
  return { errors, numGuests };
}

// Bookings don't have dedicated consent columns (would need a D1 migration),
// so the accepted timestamp rides along in the free-text notes field as a
// paper trail for what the guest agreed to at checkout.
function withConsentNote(notes) {
  const stamp = `[Accepted Liability Waiver & Privacy Policy at ${new Date().toISOString()}]`;
  return notes ? `${stamp} ${notes}` : stamp;
}

async function createCheckoutSession(env, { label, currency, email, bookingId, lineItems }) {
  const stripe = stripeClient(env);
  const siteUrl = env.SITE_URL.replace(/\/$/, '');
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: lineItems.map((li) => ({
      price_data: {
        currency,
        unit_amount: li.unitAmountCents,
        product_data: { name: `Rasna — ${label}${li.suffix ? ` (${li.suffix})` : ''}` },
      },
      quantity: li.quantity,
    })),
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60,
    success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cancel.html`,
    metadata: { booking_id: String(bookingId) },
  });
}

// --- Book a spot on the fixed November departure ---
app.post('/api/bookings/fixed', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { errors, numGuests } = validateCommon(body);
  if (!body.departure_id) errors.push('departure_id is required');
  if (errors.length) return c.json({ error: errors.join(', ') }, 400);

  const departure = getDeparture(body.departure_id);
  if (!departure) return c.json({ error: 'Unknown departure_id' }, 404);

  // Price is locked in at the tier active right now (server clock, not
  // client-supplied) — a booking started right at a tier boundary always
  // gets a consistent, non-gameable price.
  const unitPrice = priceForDeparture(departure);
  const amountTotalCents = Math.round(unitPrice * 100) * numGuests;

  const bookingId = await createFixedBooking(c.env.DB, departure, {
    name: body.name.trim(),
    email: body.email.trim(),
    num_guests: numGuests,
    activities: JSON.stringify(body.activities || []),
    notes: withConsentNote(body.notes || null),
    amount_total_cents: amountTotalCents,
    currency: departure.currency || 'eur',
  });

  if (bookingId === null) {
    const used = await spotsUsed(c.env.DB, departure.id);
    const remaining = Math.max(0, departure.capacity - used);
    return c.json(
      {
        error: remaining <= 0 ? 'This departure is fully booked.' : `Only ${remaining} spot(s) left on this departure.`,
        remaining,
      },
      409
    );
  }

  const lineItems = [
    {
      unitAmountCents: Math.round(unitPrice * 100),
      quantity: numGuests,
      suffix: `${numGuests} guest${numGuests > 1 ? 's' : ''}`,
    },
  ];

  try {
    const session = await createCheckoutSession(c.env, {
      label: departure.label,
      currency: departure.currency || 'eur',
      email: body.email.trim(),
      bookingId,
      lineItems,
    });
    await attachStripeSession(c.env.DB, bookingId, session.id);
    return c.json({ url: session.url });
  } catch (err) {
    await deleteBooking(c.env.DB, bookingId); // don't let a failed Stripe call hold a phantom spot
    console.error('Stripe session creation failed:', err.message);
    return c.json({ error: 'Could not start checkout. Please try again shortly.' }, 502);
  }
});

// --- Book a custom, self-chosen-dates trip (private group, no shared pool) ---
app.post('/api/bookings/custom', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { errors, numGuests } = validateCommon(body);
  if (errors.length) return c.json({ error: errors.join(', ') }, 400);

  const pricePerPerson = Number(c.env.CUSTOM_PRICE_PER_PERSON || 2125);
  const amountTotalCents = Math.round(pricePerPerson * 100) * numGuests;
  const bookingId = await createCustomBooking(c.env.DB, {
    name: body.name.trim(),
    email: body.email.trim(),
    num_guests: numGuests,
    activities: JSON.stringify(body.activities || []),
    preferred_dates: body.preferred_dates || null,
    notes: withConsentNote(body.notes || null),
    amount_total_cents: amountTotalCents,
    currency: 'eur',
  });

  try {
    const session = await createCheckoutSession(c.env, {
      label: 'Custom Expedition',
      currency: 'eur',
      email: body.email.trim(),
      bookingId,
      lineItems: [
        {
          unitAmountCents: Math.round(pricePerPerson * 100),
          quantity: numGuests,
          suffix: `${numGuests} guest${numGuests > 1 ? 's' : ''}`,
        },
      ],
    });
    await attachStripeSession(c.env.DB, bookingId, session.id);
    return c.json({ url: session.url });
  } catch (err) {
    await deleteBooking(c.env.DB, bookingId);
    console.error('Stripe session creation failed:', err.message);
    return c.json({ error: 'Could not start checkout. Please try again shortly.' }, 502);
  }
});

// --- Stripe webhook ---
app.post('/webhook/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const rawBody = await c.req.text();
  const stripe = stripeClient(c.env);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return c.text(`Webhook Error: ${err.message}`, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const booking = await getBookingBySessionId(c.env.DB, session.id);
    if (booking && booking.status === 'pending') {
      await markPaid(c.env.DB, booking.id, session.payment_intent);
      console.log(`[booking ${booking.id}] paid — ${booking.name} <${booking.email}> x${booking.num_guests}`);
      // Don't hold up Stripe's webhook (or fail it) on the notification.
      c.executionCtx.waitUntil(
        notifyFormspree(c.env, booking, session).catch((err) =>
          console.error(`[booking ${booking.id}] Formspree notify error:`, err.message)
        )
      );
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const booking = await getBookingBySessionId(c.env.DB, session.id);
    if (booking) {
      await markExpired(c.env.DB, booking.id);
      console.log(`[booking ${booking.id}] expired — spot released`);
    }
  }

  return c.json({ received: true });
});

// --- Guest self-service: view/submit arrival (flight) details ---
// The Stripe Checkout session_id doubles as an unguessable access token —
// it's already the only thing we hand back to the guest (in the
// success.html redirect URL), so no separate account/auth system is needed.
app.get('/api/bookings/by-session/:sessionId', async (c) => {
  const booking = await getBookingBySessionId(c.env.DB, c.req.param('sessionId'));
  if (!booking || booking.status !== 'paid') return c.json({ error: 'Booking not found' }, 404);

  const departure = booking.departure_id ? getDeparture(booking.departure_id) : null;
  return c.json({
    name: booking.name,
    num_guests: booking.num_guests,
    type: booking.type,
    departure_label: departure ? departure.label : null,
    departure_start_date: departure ? departure.start_date : null,
    arrival_airport: booking.arrival_airport,
    arrival_flight_number: booking.arrival_flight_number,
    arrival_datetime: booking.arrival_datetime,
    transfer_notes: booking.transfer_notes,
  });
});

app.patch('/api/bookings/by-session/:sessionId/flight-details', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const fields = {
    arrival_airport: typeof body.arrival_airport === 'string' ? body.arrival_airport.trim().slice(0, 100) || null : null,
    arrival_flight_number: typeof body.arrival_flight_number === 'string' ? body.arrival_flight_number.trim().slice(0, 20) || null : null,
    arrival_datetime: typeof body.arrival_datetime === 'string' ? body.arrival_datetime.trim().slice(0, 40) || null : null,
    transfer_notes: typeof body.transfer_notes === 'string' ? body.transfer_notes.trim().slice(0, 500) || null : null,
  };
  const bookingId = await updateFlightDetails(c.env.DB, c.req.param('sessionId'), fields);
  if (bookingId === null) return c.json({ error: 'Booking not found' }, 404);
  return c.json({ ok: true });
});

// --- Admin: the booking record ---
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function requireAdminAuth(c, next) {
  if (!c.env.ADMIN_PASSWORD) {
    return c.text('Admin is not configured. Set the ADMIN_PASSWORD secret.', 503);
  }
  const header = c.req.header('Authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [user, pass] = atob(encoded).split(':');
    if (user === c.env.ADMIN_USER && pass === c.env.ADMIN_PASSWORD) return next();
  }
  c.header('WWW-Authenticate', 'Basic realm="Rasna Admin"');
  return c.text('Authentication required.', 401);
}

app.get('/admin', requireAdminAuth, async (c) => {
  const bookings = await listBookings(c.env.DB);
  const departures = await Promise.all(
    listDepartures().map(async (d) => ({ ...d, used: await spotsUsed(c.env.DB, d.id) }))
  );

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
        <td>${escapeHtml(b.arrival_airport || '')}</td>
        <td>${escapeHtml(b.arrival_flight_number || '')}</td>
        <td>${escapeHtml(b.arrival_datetime || '')}</td>
        <td>${escapeHtml(b.transfer_notes || '')}</td>
        <td>${escapeHtml(b.created_at)}</td>
      </tr>`
    )
    .join('');

  return c.html(`<!doctype html><html><head><meta charset="utf-8"><title>Rasna — Bookings</title>
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
    <table><tr><th>ID</th><th>Status</th><th>Type</th><th>Departure / Dates</th><th>Name</th><th>Email</th><th>Guests</th><th>Amount</th><th>Arrival Airport</th><th>Flight #</th><th>Arrival Time</th><th>Transfer Notes</th><th>Created</th></tr>${bookingRows || '<tr><td colspan="13">No bookings yet</td></tr>'}</table>
  </body></html>`);
});

app.get('/admin/bookings.csv', requireAdminAuth, async (c) => {
  const bookings = await listBookings(c.env.DB);
  const header = [
    'id', 'status', 'type', 'departure_id', 'name', 'email', 'num_guests',
    'amount_total', 'currency', 'preferred_dates', 'activities', 'notes',
    'arrival_airport', 'arrival_flight_number', 'arrival_datetime', 'transfer_notes', 'created_at',
  ];
  const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const b of bookings) {
    lines.push(
      [
        b.id, b.status, b.type, b.departure_id, b.name, b.email, b.num_guests,
        (b.amount_total_cents / 100).toFixed(2), b.currency, b.preferred_dates, b.activities, b.notes,
        b.arrival_airport, b.arrival_flight_number, b.arrival_datetime, b.transfer_notes, b.created_at,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  c.header('Content-Type', 'text/csv');
  c.header('Content-Disposition', 'attachment; filename="rasna-bookings.csv"');
  return c.body(lines.join('\n'));
});

export default app;
