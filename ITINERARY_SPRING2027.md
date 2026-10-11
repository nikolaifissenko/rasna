# Rasna — Italian Spring Experience, March 23–30 2027

Third fixed departure, Easter week. **Live on the site 2026-10-11 as a
waitlist only** (`italian-spring-experience-*.html`, `index.html#spring-week`).
No Stripe departure in the worker yet: booking opens once the Easter hosts
are confirmed in writing. Itinerary agreed with Nikolai 2026-10-11.

**Price:** flat €2,250 per person, 7 nights (Tue 23 to Tue 30).

## Day by day
| Day | Morning | Afternoon | Evening |
|---|---|---|---|
| Tue 23 | FCO pickup, transfer to Blera | Settle in | Welcome aperitivo, trattoria dinner |
| Wed 24 | Tomb raider hunt, village down into the tombs | Tarquinia's painted tombs | Dinner in Tarquinia |
| Thu 25 | Wild asparagus foraging, cook what we picked for lunch | Terme della Tuscia | Home-cooked dinner |
| Fri 26 (Good Friday) | Donkey hike to San Giovenale | Panonto (bread and oil, no meat: Good Friday) | Quiet dinner in Blera |
| Sat 27 | Palazzo Farnese, Caprarola | Lunch at Lago di Vico, cheese tasting and cheesemaking (no horses) | Dinner in Blera |
| Sun 28 (Easter) | Slow morning | Easter party at Terrarte | Private *La Chimera* screening in a cantina garden, dinner in the cantina |
| Mon 29 (Pasquetta) | 7:30 pilgrimage, Santa Maria to the grotto of San Vivenzio | Free | Farewell dinner |
| Tue 30 | Last breakfast | FCO transfer | |

## Before opening booking (lock in writing)
- Terrarte for the Easter party (Sunday 28).
- The cantina for the screening and dinner (Sunday 28).
- Cheese host on Holy Saturday (27).
- Donkeys and panonto host on Good Friday (26).
- The Tuesday 30 airport driver.
- Screening: Nikolai's call is a private screening for the group. Keep it
  private (guests only, no tickets, nothing promoted beyond the itinerary
  line), or get the distributor's OK.

Then add a `2027-03-23` departure to `worker/src/departures.js` on
`claude/magical-franklin-58SKM` (flat 2250/2250, like Summer) and swap the
waitlist form on `italian-spring-experience-pricing.html` for the Stripe
booking form copied from the Summer pricing page.

## Risks
- **Easter is a family holiday.** Hosts, restaurants and drivers may not work Easter Sunday or Pasquetta.
- **Weather:** late March can be cold and wet. Keep the Terme afternoon movable.
- **Asparagus** depends on February/March rain. Thin year: artichokes instead.
