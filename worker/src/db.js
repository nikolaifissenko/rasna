// D1 is serverless — unlike the old better-sqlite3 version, requests can
// run concurrently across isolates, so a separate "check remaining
// capacity, then insert" is NOT safe here (two requests could both pass
// the check before either commits). Instead, `createFixedBooking` does
// the check and the insert as a single atomic SQL statement: the INSERT
// only executes if the capacity subquery's WHERE clause passes, and
// SQLite/D1 evaluates + commits that as one indivisible operation.
//
// Only `status = 'paid'` counts toward capacity — an unconfirmed
// checkout-in-progress ("pending") never moves the remaining-spots
// number. Trade-off: two people checking out for the literal last spot
// at the same instant could both complete payment (no temporary hold
// during checkout). Accepted deliberately given the small (8-guest)
// capacity and low concurrent traffic.

export async function spotsUsed(db, departureId) {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(num_guests), 0) AS used
       FROM bookings
       WHERE departure_id = ?1 AND status = 'paid'`
    )
    .bind(departureId)
    .first();
  return row.used;
}

/**
 * Atomically books `numGuests` spots on a fixed departure iff there's
 * room. Returns the new booking id, or null if capacity was exceeded
 * (no row is inserted in that case).
 */
export async function createFixedBooking(db, departure, fields) {
  const row = await db
    .prepare(
      `INSERT INTO bookings
         (type, departure_id, name, email, num_guests, activities, preferred_dates, notes, amount_total_cents, currency, status)
       SELECT 'fixed', ?1, ?2, ?3, ?4, ?5, NULL, ?6, ?7, ?8, 'pending'
       WHERE (
         SELECT COALESCE(SUM(num_guests), 0) FROM bookings
         WHERE departure_id = ?1 AND status = 'paid'
       ) + ?4 <= ?9
       RETURNING id`
    )
    .bind(
      departure.id,
      fields.name,
      fields.email,
      fields.num_guests,
      fields.activities,
      fields.notes,
      fields.amount_total_cents,
      fields.currency,
      departure.capacity
    )
    .first();
  return row ? row.id : null;
}

export async function createCustomBooking(db, fields) {
  const row = await db
    .prepare(
      `INSERT INTO bookings
         (type, departure_id, name, email, num_guests, activities, preferred_dates, notes, amount_total_cents, currency, status)
       VALUES ('custom', NULL, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'pending')
       RETURNING id`
    )
    .bind(
      fields.name,
      fields.email,
      fields.num_guests,
      fields.activities,
      fields.preferred_dates,
      fields.notes,
      fields.amount_total_cents,
      fields.currency
    )
    .first();
  return row.id;
}

export async function attachStripeSession(db, bookingId, sessionId) {
  await db
    .prepare(`UPDATE bookings SET stripe_session_id = ?1, updated_at = datetime('now') WHERE id = ?2`)
    .bind(sessionId, bookingId)
    .run();
}

export async function getBookingBySessionId(db, sessionId) {
  return db.prepare(`SELECT * FROM bookings WHERE stripe_session_id = ?1`).bind(sessionId).first();
}

export async function updateFlightDetails(db, sessionId, fields) {
  const row = await db
    .prepare(
      `UPDATE bookings SET
         arrival_airport = ?1,
         arrival_flight_number = ?2,
         arrival_datetime = ?3,
         transfer_notes = ?4,
         updated_at = datetime('now')
       WHERE stripe_session_id = ?5 AND status = 'paid'
       RETURNING id`
    )
    .bind(fields.arrival_airport, fields.arrival_flight_number, fields.arrival_datetime, fields.transfer_notes, sessionId)
    .first();
  return row ? row.id : null;
}

export async function markPaid(db, bookingId, paymentIntentId) {
  await db
    .prepare(
      `UPDATE bookings SET status = 'paid', stripe_payment_intent_id = ?1, updated_at = datetime('now') WHERE id = ?2`
    )
    .bind(paymentIntentId, bookingId)
    .run();
}

export async function markExpired(db, bookingId) {
  await db
    .prepare(`UPDATE bookings SET status = 'expired', updated_at = datetime('now') WHERE id = ?1 AND status = 'pending'`)
    .bind(bookingId)
    .run();
}

export async function deleteBooking(db, bookingId) {
  await db.prepare(`DELETE FROM bookings WHERE id = ?1 AND status = 'pending'`).bind(bookingId).run();
}

export async function listBookings(db) {
  const result = await db.prepare(`SELECT * FROM bookings ORDER BY created_at DESC`).all();
  return result.results;
}
