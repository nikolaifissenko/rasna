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
