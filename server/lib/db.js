const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bookings.db');

require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'custom')),
    departure_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    num_guests INTEGER NOT NULL,
    activities TEXT,
    preferred_dates TEXT,
    notes TEXT,
    amount_total_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'eur',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','expired','canceled')),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_departure ON bookings(departure_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(stripe_session_id);
`);

// How many minutes a pending (unpaid) booking is allowed to hold a spot
// before we stop counting it against capacity. This mirrors the Stripe
// Checkout Session expiry we set when creating the session, and acts as
// a safety net in case a `checkout.session.expired` webhook is ever missed.
const PENDING_HOLD_MINUTES = 40;

/**
 * Spots currently used (paid, or pending-and-still-within-hold-window)
 * for a given fixed departure. Synchronous by design: better-sqlite3 is
 * a blocking driver, so a check-then-insert done without any `await` in
 * between is effectively atomic within this single Node process — no
 * separate locking is needed to prevent overbooking.
 */
function spotsUsed(departureId) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(num_guests), 0) AS used
       FROM bookings
       WHERE departure_id = ?
         AND (
           status = 'paid'
           OR (status = 'pending' AND datetime(created_at) > datetime('now', ?))
         )`
    )
    .get(departureId, `-${PENDING_HOLD_MINUTES} minutes`);
  return row.used;
}

function createPendingBooking(fields) {
  const stmt = db.prepare(`
    INSERT INTO bookings
      (type, departure_id, name, email, num_guests, activities, preferred_dates, notes, amount_total_cents, currency, status)
    VALUES
      (@type, @departure_id, @name, @email, @num_guests, @activities, @preferred_dates, @notes, @amount_total_cents, @currency, 'pending')
  `);
  const info = stmt.run(fields);
  return info.lastInsertRowid;
}

function attachStripeSession(bookingId, sessionId) {
  db.prepare(`UPDATE bookings SET stripe_session_id = ?, updated_at = datetime('now') WHERE id = ?`).run(
    sessionId,
    bookingId
  );
}

function getBookingBySessionId(sessionId) {
  return db.prepare(`SELECT * FROM bookings WHERE stripe_session_id = ?`).get(sessionId);
}

function getBookingById(id) {
  return db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id);
}

function markPaid(bookingId, paymentIntentId) {
  db.prepare(
    `UPDATE bookings SET status = 'paid', stripe_payment_intent_id = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(paymentIntentId, bookingId);
}

function markExpired(bookingId) {
  db.prepare(
    `UPDATE bookings SET status = 'expired', updated_at = datetime('now') WHERE id = ? AND status = 'pending'`
  ).run(bookingId);
}

function listBookings() {
  return db.prepare(`SELECT * FROM bookings ORDER BY created_at DESC`).all();
}

function deleteBooking(bookingId) {
  db.prepare(`DELETE FROM bookings WHERE id = ? AND status = 'pending'`).run(bookingId);
}

module.exports = {
  db,
  spotsUsed,
  createPendingBooking,
  attachStripeSession,
  getBookingBySessionId,
  getBookingById,
  markPaid,
  markExpired,
  listBookings,
  deleteBooking,
};
