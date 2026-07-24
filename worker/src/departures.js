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
    price_per_person: 1450,
    // Founding-guest discount: the first N *paid guest spots* on this
    // departure (not bookings — a couple booking together fills 2 spots)
    // get a lower price, to break the zero-bookings ice on a brand-new
    // departure. Priced at 15% off, ~€1,230/€1,450 ≈ 15.2%.
    founding_discount_price: 1230,
    founding_discount_spots: 2,
    currency: 'eur',
    active: true,
  },
];

export function listDepartures() {
  return DEPARTURES.filter((d) => d.active !== false);
}

export function getDeparture(id) {
  return listDepartures().find((d) => d.id === id) || null;
}
