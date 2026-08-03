# Google Business Profile — Setup Guide

This is a local-SEO lever the website itself can't provide: showing up in
Google Maps and the local "map pack" when someone searches things like
"Italy tour Tuscia" or "things to do near Viterbo." I can't create or
verify this listing myself — it requires your Google account and Google's
ownership verification (usually a postcard to a physical address, or phone/
email verification if eligible). Everything below is ready to copy-paste;
you just need to click through the Google flow once.

**Before starting:** search "Rasna Experience" (or "Rasna Blera") on
Google yourself first and check whether a Knowledge Panel or Business
Profile already exists — if Google already has an entity pinned to the
name, the flow below is "claim/edit," not "create new," and looks
slightly different (you'd click "Own this business?" on the existing
panel instead of starting fresh at business.google.com).

## 1. Create the listing

Go to **business.google.com** → "Manage now" → sign in with the Google
account you want to own this (your personal Gmail is fine, or create a
dedicated one if you'd rather keep it separate from personal email).

## 2. Business details (copy-paste these)

**Business name:**
```
Rasna
```

**Business category (primary):**
```
Tour operator
```

**Additional categories (add these too):**
```
Travel agency
Tourist information center
```

**Description** (750 char limit):
```
Rasna runs small-group, all-inclusive travel experiences in Blera, an
Etruscan hill town in Italy's Tuscia region — 90 minutes from Rome.
Trips are capped at 8 guests and built around real participation, not
staged tours: harvest olives, descend into rock-cut Etruscan tombs, and
share meals cooked by local families. The fixed-departure Italian Olive
Experience (Nov 9–15) includes accommodation, all meals, guided Etruscan
site visits, and Blera's Festa delle Cantine wine festival, one price,
everything in. Custom trips are also available: pick your activities and
dates and we'll build a personal quote. This is Tuscia, not Tuscany: the
same hill towns and ancient history, without the tour-bus crowds.
```

**Website:**
```
https://rasnaexperience.com
```

**Phone:** +39 349 101 6416 (already listed publicly in the site footer)

**Service area:** since Rasna doesn't have walk-in retail hours at a fixed
storefront, set this up as a **service-area business** (Google will ask
"Do customers visit your business at this location?" → answer **No**, then
"Do you deliver goods and services to customers?" → answer **Yes**), and
set the service area to:
```
Blera, Italy
Tuscia, Italy
Viterbo, Italy
Lazio, Italy
```

**Attributes to enable** (once the listing exists, under "Edit profile" →
"More"):
- Online appointments / online booking — link to `rasnaexperience.com/#contact`
- Languages spoken — English, Italian (add any others you or your hosts speak)

## 3. Verification

Google will offer one of: postcard by mail (to your service address —
takes 1–2 weeks), phone, email, or video verification, depending on your
account and category. Postcard is most common for new service-area
businesses. Whichever it offers, that's the one to use — there's no
"better" option, just whichever Google makes available to your account.

## 4. Photos

Good news: the site already has 50+ real photos in `images/` (Blera, the
tombs, olive harvests, Tarquinia, moments from past visits) — reuse these
directly. Upload 10–15 of the strongest ones (avoid anything scraped from
third-party sources per the licensing caveat in `CLAUDE.md` — stick to
the ones confirmed as your own, e.g. `moment-2.jpg`, `moment-3.jpg`,
`card-etruscantombs.jpg`, and any new ones added since).

## 5. Posts and reviews

- Once live, Google lets you publish short "posts" (like a mini social
  update) directly to the listing — e.g. announcing the November
  departure or a new activity. Low effort, worth doing every few weeks.
- After the first pilot/paying group, ask guests directly for a Google
  review with a link (Google gives you a shareable review link in the
  profile dashboard). Reviews are the single biggest factor in map-pack
  ranking after proximity — a handful of genuine 5-star reviews will do
  more for local visibility than anything else in this document.

## What I did on my end

The site's `TravelAgency` JSON-LD in `index.html` already has Blera's
address; I added `GeoCoordinates` (lat/long) to it as well, so once the
Business Profile is verified, Google can cross-reference the two — this
is what helps the map-pack listing and the website reinforce each other
in search results.
