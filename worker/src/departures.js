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
    // Flat per-person pricing, same for every guest — one early-bird
    // price up to a cutoff date, then one full price after (2026-08-14,
    // per Nikolai). No room-type split.
    pricing: {
      early_bird: 1825,
      full: 2125,
    },
    // Inclusive cutoff: a booking made on early_bird_until's date still
    // gets the early-bird price; the day after rolls into "full".
    pricing_windows: {
      early_bird_until: '2026-09-15',
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
// tests) — 'early_bird' | 'full'.
export function currentPriceTier(departure, now = new Date()) {
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const { early_bird_until } = departure.pricing_windows;
  return today <= early_bird_until ? 'early_bird' : 'full';
}

export function priceForDeparture(departure, now = new Date()) {
  const tier = currentPriceTier(departure, now);
  return departure.pricing[tier];
}
