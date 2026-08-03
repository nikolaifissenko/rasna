# SEO Brief — for the next session working on rasnaexperience.com

_Written 2026-08-03, handoff from a session doing outreach/marketing work.
This is a brief for whoever (human or Claude session) picks up SEO next —
read `BOOKING_STATUS.md` § SEO and `CLAUDE.md` first for full context on
what's already shipped and the "handle infra yourself" operating principle._

## Where things stand

Already done (don't redo):
- Title/meta description/OG tags target "Italy Experiences" + Tuscia/Etruscan
  long-tail phrases (see `BOOKING_STATUS.md` § SEO for the full reasoning —
  head terms like "Italy experiences" are conceded to TripAdvisor/Viator/GYG on
  purpose, this site goes long-tail).
- `TouristTrip` and `FAQPage` JSON-LD, both validated.
- Visible `#about` and `#faq` sections (real body copy for Google to index).
- `robots.txt` + `sitemap.xml`, canonical tag, transactional pages
  (`success.html`/`cancel.html`) correctly excluded via `noindex`/disallow.

## What's actually missing (verified directly in the code, 2026-08-03)

1. **Zero images on the entire site.** `grep -c '<img' index.html` → 0. For a
   travel product this is a real gap two ways: no visual trust signal for a
   first-time visitor deciding whether to pay €1,450 to a stranger, and zero
   Google Images / Pinterest-style discovery surface. No alt text exists
   because no images exist — that's the actual root cause, not a tagging
   oversight.
2. **No `og:image` / Twitter Card.** Right now sharing the link on
   WhatsApp/Instagram/iMessage (exactly the channels the warm-outreach
   messages are going out on) shows no preview image. Given outreach is
   actively happening this week, this is higher-priority than typical SEO
   because it affects the outreach already in flight, not just organic search.
3. **`sitemap.xml` has one URL** (the homepage). Fine for a single-page site
   as-is, but flag if any content pages get added (see #4) — they need adding
   here too.
4. **No content beyond the single landing page.** Long-tail SEO (the
   explicit strategy per `BOOKING_STATUS.md`) works better with more indexable
   pages targeting specific queries, not just one page trying to rank for
   everything: e.g. "Blera Etruscan tombs," "things to do in Tuscia,"
   "olive harvest experience Italy." Worth assessing whether 1-2 short content
   pages are worth it before the Nov 9 departure, or whether that's better
   left post-pilot once there are real photos/testimonials to fill them with.
5. **No Google Search Console property, no Google Business Profile.** Per
   `BOOKING_STATUS.md`, these were flagged as "real next levers, need
   Nikolai" — neither is code-fixable, both need Nikolai to create the
   property/profile himself and hand over a verification snippet or
   confirm details. Per `CLAUDE.md`'s operating principle: ask him for the
   *minimum* piece of info needed (e.g. just the one verification meta-tag
   line GSC gives him), don't hand him a task list.
6. Not yet checked, worth a pass: Core Web Vitals / PageSpeed score (single
   68KB HTML file, no images yet, so likely fine, but verify once images are
   added since that's the usual place performance regresses), and whether the
   `dist`/tile-serving patterns used in `streetsmart-volt` are relevant here
   (they're not — different repo, different problem).

## Suggested order of work

1. **og:image first** — highest leverage relative to effort, and it
   directly helps outreach that's already going out this week. Needs at
   least one real photo (Blera, olive harvest, a tomb, or even just a
   branded card if no location photos exist yet) sized correctly
   (1200×630 is the standard OG size).
2. **A handful of real photos into the site itself** — even placeholder-
   quality ones beat zero, and this unblocks alt-text SEO plus basic buyer
   trust. Flag to Nikolai if no photos exist yet — that's a content gap he
   needs to fill (his contacts in Blera, or stock photos as a stopgap),
   not something to fabricate.
3. **Google Search Console + Business Profile** — ask Nikolai for exactly
   what's needed (verification tag / profile details), nothing more.
4. **Content pages** — only after 1-3, and only if there's time before Nov 9
   makes it worth it; otherwise defer to post-pilot when real trip photos
   and testimonials exist to make those pages substantive rather than thin.

## Reminder from CLAUDE.md

Nikolai is not technical — handle deploys/config yourself (GitHub Pages
auto-deploys from `claude/magical-franklin-58SKM` on push, no separate step
for static changes). Only ask him for things you can't self-serve, and be
specific about exactly what you need from him.
