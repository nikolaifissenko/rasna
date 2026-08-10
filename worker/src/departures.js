// Fixed departures open for booking. Edit directly, then run
// `npm run deploy` (or `wrangler deploy`) to publish the change — no
// database migration needed, this is just static config.
export const DEPARTURES = [
  {
    id: '2026-11-09',
    label: 'November 9–15, 2026',
    start_date: '2026-11-09',
    end_date: '2026-11-15',
    capacity: 8,
    currency: 'eur',
    active: true,
    // Two-axis pricing, replacing the old flat price_per_person +
    // founding-guest-discount model (2026-08-10): room type (private vs.
    // sharing a double) x booking window (earlier books cost less).
    // `room_type` on a booking is per-booking, not per-guest — a group
    // books entirely as "private" (each guest gets/pays for their own
    // room) or entirely as "shared" (guests pair up into doubles).
    pricing: {
      shared: { early_bird: 1400, regular: 1600, final: 1800 },
      private: { early_bird: 1700, regular: 1900, final: 2100 },
    },
    // Inclusive cutoffs: a booking made on early_bird_until's date still
    // gets the early_bird price; the day after rolls into "regular".
    pricing_windows: {
      early_bird_until: '2026-09-15',
      regular_until: '2026-10-25',
    },
  },
];

export function listDepartures() {
  return DEPARTURES.filter((d) => d.active !== false);
}

export function getDeparture(id) {
  return listDepartures().find((d) => d.id === id) || null;
}

// Which pricing tier applies right now (or at an arbitrary `now`, for
// tests) — 'early_bird' | 'regular' | 'final'.
export function currentPriceTier(departure, now = new Date()) {
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const { early_bird_until, regular_until } = departure.pricing_windows;
  if (today <= early_bird_until) return 'early_bird';
  if (today <= regular_until) return 'regular';
  return 'final';
}

export function priceForRoomType(departure, roomType, now = new Date()) {
  const tier = currentPriceTier(departure, now);
  return departure.pricing[roomType][tier];
}
