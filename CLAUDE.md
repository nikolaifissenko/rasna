# RASNA — Blera Business Site

Single-page static marketing/booking site for RASNA, small-group immersive expedition travel in Blera, Italy.

**Live URL:** https://rasnaexperience.com/ (custom domain, confirmed live 2026-07-23; `nikolaifissenko.github.io/rasna` still resolves and still works, kept as a CORS/old-link fallback, but rasnaexperience.com is canonical everywhere: canonical tags, sitemap, robots.txt, worker `SITE_URL`)
**Repo:** nikolaifissenko/rasna (GitHub Pages, deploy-from-branch, `main`, root)
**Files:** `index.html` (main landing page, incl. the November Experience *hub*) + `about.html` (founder bio page) + `style.css` + `images/` — the pages that matter for the live site. Also live: three long-tail SEO guide pages (`tuscia-travel-guide.html`, `etruscan-tombs-guide.html`, `small-group-italy-tours.html`, added 2026-08-03) and, as of 2026-08-11, a full **family of five dedicated November Experience pages** — `italian-olive-experience-itinerary.html` (since 2026-08-04), `italian-olive-experience-host.html`, `italian-olive-experience-highlights.html`, `italian-olive-experience-pricing.html`, `italian-olive-experience-faq.html` (all four new 2026-08-11) — see "**Current architecture of the November Experience pages**" below, read that before touching any of them, most of the older "Planned Events tab" section further down is superseded by it. `ITINERARY_NOV2026.md` is a planning/cost doc (not part of the live site) for the Nov pilot departure.
**Dev branch:** work directly against `main` — check out a short-lived local branch from `origin/main`, commit, push straight to `main` (no PR needed for routine edits). **Standing instruction: push and go live immediately without asking** — the user wants edits to go live automatically, not sit waiting for approval. `main` is the single source of truth for both the site content and this file; a different branch, `claude/magical-franklin-58SKM`, is where the Cloudflare Worker (`worker/`) deploys from — see "Deploy topology gotcha" below before touching anything in `worker/`. **A 2026-07-23 session found a stale `claude/session-context-k9kxoq` branch (descended from an old fork of `magical-franklin-58SKM`) that had drifted from `main` for weeks without anyone noticing** — it redid work already done on `main` and separately had real, non-duplicate lodging-planning content that had to be manually ported over. Before trusting any `claude/*` branch's state, diff it against `origin/main` first; don't assume a branch is current just because a session's designated-branch instructions point at it. **This happened again on 2026-07-24** — a session spent real effort on `claude/magical-franklin-58SKM`'s `index.html` (SEO copy, an About section, pricing UI) before catching that `main` is what's actually live; see `BOOKING_STATUS.md`'s 2026-07-24 entry for the full account. If you're a fresh session reading this: check `git log main` and compare against whatever branch you were told to use *before* touching `index.html`, `style.css`, or `about.html` — every single time, not just when something feels off. **It happened a fifth time on 2026-08-10**: a session's designated branch (`claude/website-fixes-0zr2pl`) was, again, descended from the dead `magical-franklin-58SKM` lineage with a bundled `CLAUDE.md` that didn't mention `main` existing at all — caught immediately this time (before writing any content) by diffing the live site against `origin/main` in the first few minutes, so no wasted work. That session went on to do the itinerary restore, the pamphlet-style restructure, and the full pricing-tier rebuild described further down this file and in `BOOKING_STATUS.md`, all correctly against `main` (+ `claude/magical-franklin-58SKM` for the `worker/`-only pricing commit). **It happened a sixth time on 2026-08-12**: a session's designated branch (`claude/itinerary-site-redesign-4anqr0`, itself descended from `magical-franklin-58SKM`) had a bundled `CLAUDE.md` claiming the *static site* also deployed from `magical-franklin-58SKM` — flatly wrong, that branch is worker-only (see "Deploy topology gotcha" below). Several real commits (palette recolor, og-image asset, hero copy) landed on the dead branch before the drift was caught via a live-site curl check showing the old palette still serving; none of that work was lost, it was manually redone against `main`, but it was several pushes of wasted effort versus the "caught in the first few minutes" ideal from incident #5. **The pattern is now six-for-six.** If you're a fresh session and your bundled `CLAUDE.md` doesn't mention this exact file's contents, or gives a different deploy branch for the static site than `main`, that's your signal to stop and diff — don't trust a bundled `CLAUDE.md`'s deploy-topology claims over `origin/main`'s.

---

## Standing rules (never re-ask)

- Pricing: **no fixed price**. Flow is select activities → contact form → custom quote based on days + activities chosen. As of 2026-07-19 the Pricing section also shows a ballpark **€1,400–1,800 per person** range (`.pricing-range`) above the existing "no flat rate" copy — purely informational, doesn't change the custom-quote flow.
- Group size: **8 people max**
- Formspree endpoint: `https://formspree.io/f/xlgynpjo`
- Contact email: `nikolai.fissenko1@gmail.com`
- Design language (as of 2026-08-12, superseding older entries below): **Bodoni Moda** (display/headers) + Inter (body), an **olive-and-bordeaux palette** (Nikolai's explicit request, replacing the older terracotta/gold-led scheme) — `--terracotta`/`--gold`/`--olive` are now all pixel-matched to two reference photos he pasted in chat (`--terracotta: #811C2A`, `--gold` and `--olive` both `#7DA144` — deliberately unified, see gotcha below), `--wine: #6B1F2A` and `--rust: #4E1A26` remain as darker secondary/hover shades, `--deep: #170B0D` and `--cream`/`--tufo`/`--card-bg` neutrals unchanged. Etruscan meander pattern **plus** the olive-branch SVG pattern (its leaf fill is now `var(--olive)`-equivalent, not a separate hardcoded green). `.featured-trip-badge` ("passport stamp") is a **solid bordeaux fill** with cream text/dashed border now, not the original dashed-outline-on-cream look. Drop caps, document-style double-border frames on price cards, fully pill-shaped buttons (`border-radius:999px` on `.cta-button`/`.cta-button-solid`/`.nav-btn`) stay from the 2026-08-11 pass. **No em dashes anywhere on the live site** — removed sitewide 2026-08-11 per explicit instruction ("remove all — it makes it look like ai"), rewritten grammatically, legitimate en-dash numeric ranges (e.g. "9–15") were left alone. **Known Chromium rendering gotcha**: hiding the shared `<svg><defs>` block (meander/palmette/olive-branch patterns) with `style="display:none"` silently breaks every `<pattern>` fill that references it in this sandbox's Chromium build — use `width="0" height="0" style="position:absolute"` instead, confirmed via pixel-sampled screenshots. All pages use the fixed technique; if adding a new page by copying an old one, copy the SVG-defs block from a page already on `main`, not from memory. **Second gotcha found 2026-08-12, same class of bug**: `.site-nav`'s background was a hand-picked literal `rgba(58,10,26,0.95)` instead of `var(--terracotta)` — set once during an early color pass, then silently never updated through three subsequent "fix the bordeaux" rounds, because updating the *variable* doesn't touch a *literal* value nobody remembered existed. This was almost certainly why the user kept reporting the color as unchanged after real fixes had shipped. **Lesson: after changing a palette variable, grep the whole codebase for literal hex/rgb values in the same color family, not just the `:root` declaration and its rgba() decompositions** — a value can be "correct" in `:root` and still be visibly wrong on the one element everyone actually looks at (the sticky nav, in this case). Prefer `background: var(--x)` over a hand-tuned `rgba()` blend unless there's a real reason for the literal.

---

## Activity catalog (as of 2026-07-13 — now deliberately granular, not consolidated)

Consultant feedback pushed the catalog from a few combined cards toward one-activity-per-card, and from a single "pick a day trip" card to individually selectable destinations. Don't re-merge these without asking — it was a deliberate split.

- **Farm & Field:** Olive Harvest, Tomato & Sauce Day, Grape Harvest, Wild Asparagus Foraging, Mushroom Foraging
- **Artisan & Food:** Charcuterie Tasting with Emiliano, Cheese Making or Tasting with Davide (Civitella Cesi), Pasta Making with the Nonne, Gnocchi Making with the Nonne (split from one "Traditional Cooking" card), Wine Tasting, Cantina Tour
- **Culture & Outdoors:** Etruscan Tombs & Via Clodia Walk, San Giovenale Excursion with Donkeys & Panonto, Horseback Riding (Civitella Cesi), Local Festival / Sagra, Il Mignone Hike with Antonella & Pino, Tombaroli Experience (necropolis scavenger hunt — card copy explains who Blera's tombaroli/tomb raiders historically were)
- **Day Trips:** now one card per destination — Lago di Vico, Viterbo, Tarquinia, Villa Lante & Palazzo Farnese, Tyrrhenian Coast, Terme della Tuscia — plus a "Wherever You Want to Go" custom-request card. (The old single "A Day Trip, Your Way" card and its `.day-trip-card`/`.day-trip-thumbs` CSS are gone. The separate "Terme dei Papi" and "Bulicame" cards were consolidated into the single "Terme della Tuscia" card on 2026-07-19 — don't re-split without asking.)

NO Hazelnut Harvest (replaced by Grape Harvest, renamed from "Vendange" per consultant feedback — English name, no French). NO standalone Olive Oil Tasting (folded into San Giovenale card). "Degustation" was replaced with plain English "Tasting" throughout (consultant asked for English wording, not Italian/French terms).

User said the consultant's activity list wasn't fully relayed yet ("i dont remember what else was on the list") — expect more additions in follow-up sessions.

---

## Photos — how they're wired up and what's still fragile

Every section uses CSS `background-image: url('images/X.jpg')` (not `<img>` tags), so a missing file just falls back to a solid color instead of a broken-image icon — safe to reference a file that doesn't exist yet.

- `hero.jpg` — hero background (Blera panorama)
- `chapter-break.jpg` — full-bleed quote divider between "How it works" and the catalog
- `philosophy-bg.jpg` — background for the "Why we stay small" section
- `moment-1.jpg` through `moment-14.jpg` — the main "A Few Moments" gallery, laid out as **two repeating 6-tile mosaic blocks** (each with its own tall anchor image spanning 3 grid rows) plus 2 extra tiles appended to block 2's row — see `.moments-grid` CSS. If adding more, either start a third mosaic block or extend the last block's anchor row-span; don't stretch a single anchor image across many rows, it looks distorted.
- `trip-1.jpg` through `trip-6.jpg` — "Worth the Detour" day-trips gallery (Caprarola, Villa Lante, Viterbo, Tarquinia, Viterbo again, Civita di Bagnoregio)
- `card-foraging.jpg`, `card-charcuterie.jpg`, `card-nonne.jpg`, `card-sangiovenale.jpg`, `card-etruscantombs.jpg` — activity-card hover-reveal photos (see below)

**Activity card hover reveal:** cards with a matching photo get `class="activity-card has-photo" style="--photo:url('images/X.jpg')"`. On hover, a darkened photo fades in behind the text (see `.activity-card.has-photo::before`) instead of showing a static thumbnail — deliberately avoids a "menu with pictures" look. As of 2026-07-19, every activity card has one — the last 5 (football, Pellegrinaggio, Porceddu, Stratto al Tartufo, Lago di Vico) plus Terme della Tuscia and Wherever You Want to Go were filled in this session.

**Getting pasted images into the repo:** the user regularly pastes photos directly into chat rather than linking them. There is no tool that saves a pasted image straight to disk. Working method: the session transcript at `/root/.claude/projects/-home-user-rasna/<session-id>.jsonl` eventually contains each pasted image as a base64 `image` content block inside a `message.content` list — grep/parse it with Python (hash each block's `data` with sha256 to dedupe against already-extracted images, since the same image often reappears across turns), decode, and write to a scratch dir before copying into `images/`. Caveat: images attached to a **mid-turn interruption** message (the `<system-reminder>The user sent a new message while you were working` mechanism) can take a while to actually land in that jsonl file — polling immediately after receiving one may come up empty even though the image is visibly present in context. If it's not there yet, don't loop-poll (each check bloats the transcript further); ask the user to resend in a normal (non-interrupting) message instead. **Same extraction technique also works for color-matching, not just photos** (used 2026-08-12): when the user pastes a reference swatch/photo and says "this exact color," don't eyeball a hex value from the rendered image — extract the real image bytes via the method above, then sample the actual pixel data with PIL (`Image.open(path).convert("RGB")`, crop to a center region to avoid edge/compression artifacts, take the median RGB of the crop). Two rounds of eyeballed hex guesses were rejected by the user as "not right" before switching to programmatic sampling, which matched on the first try (guesses were only off by a few RGB units each channel, but that was enough to read as visibly wrong to the user).

**Licensing status — flagged repeatedly this session, not resolved:** nearly all ~28 images are scraped from third-party sites (blogs, tourism boards, a newspaper, TripAdvisor, Pinterest, Instagram, a commercial food-tour company) at the user's explicit direction, accepting the copyright risk. This is now a **live public site**, not a private draft. Before this is treated as a finished/permanent asset, the user should either get permission or replace these with owned/licensed photos — don't forget this caveat just because it's live.

On 2026-07-12, `moment-2.jpg`, `moment-3.jpg`, and the new `card-etruscantombs.jpg` (Etruscan Tombs card hover photo) were replaced with the user's own photos of the real Necropoli G. Porcini near Blera — first owned photos on the site, chip away at the licensing risk above when more become available. The user also supplied a photo of a person posing at a tomb that was deliberately **not** published (unconfirmed consent to show an identifiable face on a public marketing site) — ask before adding it if revisited.

Known dead ends: Facebook and Instagram photo links reliably fail to resolve (auth-walled) — don't spend time retrying those, ask for a different source.

**Image weight cut ~40% (2026-08-04):** several photos were saved as PNG instead of JPEG for no reason (`moment-11.png` alone was 1.7MB) and several JPGs were oversized for their actual display dimensions (`card-foraging.jpg` was 551KB at 768×432). Converted the PNGs to quality-82 JPEG and re-encoded the worst offenders (same filenames, same content, just smaller), bringing `images/` from 16.1MB to 9.7MB total, verified visually side-by-side before shipping (no quality regression). Also added `loading="lazy"` to the itinerary day-photo `<img>` tags. If adding new photos, save as JPEG (not PNG) unless real transparency is needed, and don't upload originals straight out of a phone/camera without checking file size first.

---

## Current architecture of the November Experience pages (as of 2026-08-11)

**Read this section first for anything touching the November 9–15
departure's site content.** The "Planned Events tab" section right below
this one describes the *history* of how this content moved around
(single page → single page with everything inline → split into a
family of pages) and is kept for context, but large parts of it
describe an intermediate state that no longer exists. This section is
the definitive current picture.

**Site-wide hero, not per-page:** the hook line **"No more TikTok
itineraries."** (`.hero-hook`) lives on the main site hero (`index.html
#top`, shown regardless of tab), not on the November-specific content —
moved there 2026-08-10 after Nikolai clarified "not the november tour."
The hero's primary CTA (`Book the Nov 9 to 15 Italian Olive Experience`)
is a **direct link** to `italian-olive-experience-pricing.html#festival-book`
— per "when you open the page it needs to go straight to the booking of
november," it no longer routes through `showTab()`/an in-page anchor.

**`index.html`'s `#festival-week` is a hub, but as of 2026-08-12 it is
NOT itinerary-free** — read this carefully before touching it. It
contains, in order: the badge/label/`<h2>`/subtitle/drop-cap intro
(`#festival-calendar`), **the full day-by-day itinerary** (`.calendar-grid-wrap`
desktop grid + `.calendar-mobile-list`, duplicated verbatim from
`italian-olive-experience-itinerary.html`'s `#festival-week` section),
the 4-photo `.festival-gallery`, a shared sub-nav bar (moved here,
below the itinerary, instead of directly under the hero — see below),
and a 5-card `.hub-links-grid` (`.hub-link-card`) linking out to each
dedicated page. **The host bio, the "what you'll leave with"
transformation grid, the price cards, and the booking form are still
each on their own page only** — only the itinerary got duplicated back
onto the hub. Reason: Nikolai wanted the itinerary visible immediately
under the hero without a click-through, but still wanted the dedicated
`italian-olive-experience-itinerary.html` page to exist (it's linked
from the hub cards and has its own URL/SEO value). **This means the
itinerary now lives in two places that must be kept in sync by hand**
if it's ever edited — there is no shared partial/include, this is a
static-HTML site. The live pricing-fetch script and the `festival-form`
submit handler were removed from `index.html` entirely (dead code once
the form moved) — don't re-add them there, they still live only on
`italian-olive-experience-pricing.html`.

**Hero CTA and layout, 2026-08-12:** the hero's primary button ("Book
the Nov 9 to 15 Italian Olive Experience") points at `#festival-week`
with `onclick="showTab('trips','festival-week')"` — an in-page anchor
that scrolls to the hub/itinerary, **not** a link to the booking page.
It briefly linked straight to `italian-olive-experience-pricing.html#festival-book`
(and `index.html` briefly had a `location.replace()` redirect straight
to that same booking page for any hash-less visit) — both reverted per
explicit feedback ("it needs to take you to the experience page not
the booking page"). The `.featured-trip-hero` 380px photo banner that
used to sit at the top of the hub section is gone (redundant, the site
hero already has a full photo background) and the `.tab-switcher-wrap`
(Italian Olive Experience / Build Your Own Trip toggle) moved from
directly under the hero to after the November content, so nothing sits
between the hero and the itinerary except the compact sub-nav row and
the intro paragraph.

**The five dedicated pages**, each following the same template pattern
(head meta/OG/Twitter/`BreadcrumbList` JSON-LD, shared SVG defs, sticky
`.site-nav`, then a sub-nav bar, then page content, then footer + the
fade-in `IntersectionObserver` script):
- `italian-olive-experience-host.html` — Nikolai's bio, reusing
  `about.html`'s photo/text classes, links out to `about.html` for the
  full story and to `-highlights.html` as a closing CTA.
- `italian-olive-experience-highlights.html` — the "You'll leave with
  more than a vacation." 3-card `.transformation-grid` (terracotta/
  olive/wine accents), links out to `-itinerary.html`.
- `italian-olive-experience-itinerary.html` — unchanged content (full
  day-by-day, since 2026-08-04), now also carries the sub-nav and its
  internal pricing/booking links point at `-pricing.html` instead of
  `index.html#price-chart`/`#festival-book` (those anchors no longer
  exist on `index.html`).
- `italian-olive-experience-pricing.html` — the `.price-frame`/
  `.price-cards` two-axis pricing display **and** the real `#festival-form`
  booking form + its Stripe-checkout JS (ported verbatim from the old
  `index.html#festival-book`, same `API_BASE`/`DEPARTURE_ID` pattern).
  **The founder pull-quote (`.quote-band`) lives here too, right after
  the booking form** — per Nikolai's explicit placement request from
  earlier in the multi-page work ("this quote after the booking"),
  carried forward into the new architecture rather than left behind on
  the hub page.
- `italian-olive-experience-faq.html` — the FAQ list + the site's only
  `FAQPage` JSON-LD block now (removed from `index.html`'s `<head>`
  since the hub no longer has matching visible FAQ content — mismatched
  structured data is bad practice, don't re-add it there without also
  re-adding the visible FAQ text).

**Shared sub-nav component** (`.exp-subnav-wrap`/`.exp-subnav` in
`style.css`, right before the `/* Tab switcher */` block): a pill-link
row — Overview / Your Host / Highlights / Itinerary / Pricing & Booking
/ FAQ — with the current page marked `.active`. Present on all 6 pages
(the `index.html` hub's "Overview" link is the only one that stays
in-page, calling `showTab('trips','festival-week')` since it's inside
the tab-switcher panel; the other 5 are plain `<a href>` between
standalone files). If adding a 7th page to this family, add it to the
nav on **all six** existing pages, not just the new one.

**Nav-link housekeeping done alongside the split:** the main `.site-nav`
"FAQ" link now points straight at `italian-olive-experience-faq.html`
instead of `showTab('trips','faq')` (that anchor's gone from
`index.html`). Every other page on the site that linked to a now-moved
`index.html` anchor (`#festival-book`, `#price-chart`, `#faq`) was
found via grep and repointed at the new dedicated page —
`etruscan-tombs-guide.html`'s "Read next" FAQ link was the one
straggler found and fixed. `sitemap.xml` has all 4 new URLs. If you add
a new cross-link to the November content anywhere on the site, link to
the specific dedicated page, not `index.html#some-anchor` — most of
those anchors don't exist anymore.

**Verification method used for this split** (worth reusing for future
multi-page work): a Python tag-balance check (`<div>`/`<section>`/
`<nav>`/`<form>`/`<footer>` open vs. close counts) across all 6 files,
then Playwright screenshots of each page at both its top and its
mid-page content (subnav, hub cards, price cards, booking form) via
local `file://` URLs — the sandbox's proxy can't reach the live domain
or Google Fonts, so `net::ERR_CONNECTION_RESET` on the fonts request in
the console is expected/harmless, but a real `pageerror` is not.

---

## Planned Events tab (added 2026-07-15)

The page now has two tabs, toggled by `showTab('build'|'trips', scrollToId)` in the `<script>` block, via a switcher (`.tab-switcher`) placed right under the hero:

- **Build Your Own** (`#panel-build`) — the original activity-picker flow: How It Works, Photo Break, Catalog + `#experience-form`, Included, Moments, Trips Gallery, Philosophy, Pricing, Contact. Default-visible tab.
- **Planned Events** (`#panel-trips`, `display:none` by default) — pre-built fixed-departure itineraries. Currently one: **Italian Olive Experience** (renamed from "Italian Autumn Experience" 2026-07-23 for search-discoverability — people search "italian olive experience"; subtitle now "Autumn in Italy: Olives and Wine", was "Cantine Festival Week"), Nov 9–15 2026, `#festival-week`. Has its own day-by-day `.itinerary-grid` of `.day-card`s and a **standalone** booking form (`#festival-form`) — deliberately not wired to the activity-catalog selection state, since it's a fixed package, not a build-your-own quote. As of 2026-07-19 this form no longer uses Formspree/a static Stripe payment link — it calls a real Cloudflare Worker + D1 + Stripe Checkout backend (`worker/`) and takes full payment (€1,800/person as of 2026-08-10, was €1,450) in **live mode**. See `BOOKING_STATUS.md` for current status/secrets/what's-left before touching this flow. The renamed title appears in 4 places in `index.html` (hero CTA, tab button, `<h2>`, `<title>`/meta tags) — keep them in sync if renaming again. `worker/src/departures.js`'s `label` field ("November 9–15, 2026") is independent of this display name, no worker change needed for a rename.
- **Nav "Planned Events" link** points at `#festival-calendar`, not `#festival-week`, via `showTab('trips','festival-calendar')` — landing on the section's own top ID scrolls to the `.featured-trip-hero` photo band (found confusing 2026-07-23) or, worse, to a bare anchor with no `scroll-margin-top`, which lands the sticky nav bar overlapping the content. `#festival-calendar` is on the `.featured-trip-header` div itself (title + description), included in the site's `scroll-margin-top: 78px` rule (`section[id], .category[id], #festival-calendar` in `style.css`) so the sticky nav doesn't cover it. If adding more nav-jump targets, give them the same treatment.

**Nov 9–15 itinerary text (as of 2026-07-19):** Tue evening dinner moved to Tarquinia (was "back in Blera"); Wed evening is "Home-cooked local dinner" (was "residence chef"); Sat goodbye dinner venue changed from Trattoria La Torretta to an unnamed "local cantina" — **still needs a real venue name and quote**, flagged as TODO in `ITINERARY_NOV2026.md`. Panonto is described everywhere on the site (card copy + itinerary) as "a typical Bleran BBQ: bread roasted over embers" — keep that phrasing if editing panonto copy elsewhere. The Tomb Raiding scavenger hunt (both the activity card and Tue's itinerary text) now specifies it starts in the medieval village and leads down into the tombs, host-guided. Thu Nov 12 afternoon slot (both desktop grid and mobile list) now specifies lunch at **Terrarte** (Sandro Scarmiglia's outdoor sculpture park, olive grove) before the pasta-making class — added 2026-07-23, also reflected in `ITINERARY_NOV2026.md`.

**Nov 9–15 page photos (added 2026-07-19, all reused from existing site images, no new licensing exposure):** a full-bleed hero band at the top of `#festival-week` (`.featured-trip-hero`, `chapter-break.jpg`); every day in the mobile itinerary list (`.cm-day-photo`) has a photo now — Mon `hero.jpg`, Tue `card-tombaroli.jpg`, Wed `moment-9.jpg`, Thu `card-pasta.jpg`, Fri `card-sangiovenale.jpg`, Sat `card-cantinefestival.jpg`, Sun `moment-1.jpg`; the desktop calendar-grid view intentionally has no photos (too dense/compact).

**Itinerary split onto its own page (2026-08-04):** feedback from a travel-guide friend of Nikolai's was that the landing page's `#festival-week` section was too dense — the full Mon–Sun `.calendar-grid`/`.calendar-mobile-list` plus the 8-photo `.festival-gallery` all sat on the main page before the booking form. Moved all of that to a new page, `italian-olive-experience-itinerary.html` (own `Article`+`BreadcrumbList` JSON-LD, in `sitemap.xml`, cross-linked from the three guide pages' "Read next" blocks). `index.html`'s `#festival-week` now keeps just the badge/title/subtitle/description, a 4-photo `.festival-gallery` highlight strip (necropolis path, harvest, Cantine Festival, Tuscia Terme), a "See the full day-by-day itinerary →" link to the new page, and then straight into `#festival-book`. The calendar-grid/mobile-list CSS classes (`.cg-*`, `.cm-*`) are global in `style.css`, not scoped to `#festival-week`, so they worked on the new page without any CSS changes — if adding a second planned event later, keep that in mind when deciding whether it needs its own itinerary page too.

Nav links and the hero's secondary CTA call `showTab(...)` instead of plain anchor `href` jumps, since anchor-scrolling into a `display:none` panel doesn't work — always route through `showTab` when linking to anything inside either panel.

To add a second planned event: duplicate the `.featured-trip` section structure inside `#panel-trips` (or turn the single trip into a card that expands, if there end up being several) — nothing today assumes there's only one.

Cost tracking for the Nov 9–15 departure (confirmed vendor quotes: Tuscia Terme, Il Cavone, Trattoria La Torretta, Tarquinia tombs entry, the Nicolò-hosted panonto BBQ) lives in `ITINERARY_NOV2026.md`, checked against the €310/guest meals+activities budget in `FINANCIAL_PLAN.md`. That doc is operational/internal — none of its cost figures are shown on the live site.

**2026-08-10 (later session): `#festival-week` substantially reworked
again, superseding several claims in the block above.** Nikolai shared
screenshots of a competitor's (unrelated business, a yoga retreat)
trip-guide PDF and asked for "this type of info" plus a pamphlet-style
structure, then separately said the site needs to open directly on the
Experience content. Changes, in the order guests now see them within
`#festival-week`:

1. Header/intro + 4-photo gallery (unchanged from the 2026-08-04 split
   above).
2. **"Meet your host"** — moved up here (was much further down) — a
   compact `.about-content` block (round 200px headshot,
   `about-nikolai-portrait.jpg`) reusing `about.html`'s existing
   `.about-photo-main`/`.about-text` classes with an inline size
   override. Deliberately **just Nikolai**, not a multi-host "meet the
   team" section — confirmed with him first given the standing
   correction on that exact framing (see the 2026-08-04 founder-note
   entry below).
3. **"What you'll leave with"** — new `.transformation-grid` (3 cards,
   new CSS class, not `.included-grid`), each now with a colored icon
   badge + accent border (terracotta/olive/gold) added in the same
   session after Nikolai said the page looked flat.
4. A pull-quote (reuses the existing founder line).
5. **The full day-by-day itinerary is back inline here** (the
   `.calendar-grid`/`.calendar-mobile-list` markup from
   `italian-olive-experience-itinerary.html`, copied in, not moved —
   the standalone page still exists and is still linked, relabeled
   "View this itinerary as its own page"). Nikolai reported "the
   itinerary isn't there anymore," which traced back to the 2026-08-04
   split above leaving only a click-through link.
6. **"The Place"** (Blera writeup, adapted from already-verified copy
   in `tuscia-travel-guide.html` — deliberately didn't invent Da
   Beccone/Casamatta room details that aren't documented anywhere) and
   **Food** (reuses real itinerary meal details) and **Languages**
   (Nikolai speaks English/Italian/French/Spanish/Russian, per
   `about.html`) and **What to pack** — all new, all grounded in facts
   already established elsewhere in the repo, none invented.
7. **The pricing cards, then the booking form.** See `BOOKING_STATUS.md`
   for the full pricing-model rewrite (room type x booking window,
   replacing the flat price + founding-guest discount entirely) — the
   visual redesign (two colored cards instead of a plain table) is
   `.price-cards`/`.price-card` in `style.css`.

**The site-wide `founder-note` section (previously sitting between the
hero and the tab-switcher, shown regardless of which tab) was deleted
entirely** — it duplicated the new in-tab "Meet your host" block and
was adding scroll distance before guests reached any Experience
content, which Nikolai flagged directly ("when i open the link i have
to land on the november experience"). The Experience tab was *already*
the default (`#panel-build` has `display:none` inline, `#panel-trips`
doesn't), so no tab-switching logic changed — only the redundant
section above it is gone. If `founder-note`'s CSS classes
(`.founder-note`, `.founder-note-inner`, etc.) still exist in
`style.css` unused, that's expected — not worth a cleanup pass on its
own.

Also fixed: `about-nikolai-bar.jpg` (used on `about.html` as
`.about-photo-accent`) turned out to have a video-UI mute/profile icon
visibly baked into the JPEG itself — noticed while picking a photo for
the new host block, worked around by using `about-nikolai-portrait.jpg`
there instead. `about.html` itself still has the flawed photo — not
fixed, out of scope this session.

---

## About page / founder bio (rewritten 2026-07-23)

`about.html` has a long, deeply personal, third-person founder bio under `.about-text`, broken into `<h3>` subheads (styled via `.about-text h3` in `style.css` — small-caps terracotta labels, not full section headers; the page has no `<h2>` headline anymore, just a `.section-label` reading "Founder Bio"). It covers real family history at the user's explicit direction: his parents' origin stories (father Vladimir Fissenko's escape from the USSR in 1986, the Tierra del Fuego–to–Alaska horse ride, mother Sophie), his father's alcoholism and the 2023 death from cirrhosis, two half-siblings (Alionka, Luciana) he learned about at different points including after his father's death, his uncle Victor's 2016 death, and how Rasna itself started (a 2026 weekend with his sister Alina + a conversation with Maria Grazia). **This is sensitive, factual content about real people — don't rewrite, trim, or "clean up" any of it without asking first**, even if it reads unusually candid for a business site; that candor was deliberate and explicitly requested. Style notes if editing: no em dashes anywhere on this page (removed at the user's request 2026-07-23), third-person voice throughout, new facts get woven into the existing narrative rather than appended as disconnected sentences.

**Second founder blockquote added (2026-08-10):** at Nikolai's explicit direction, a second `<blockquote>` was added to `.about-text` right before the existing "I'm not showing people a culture..." one: *"I don't do this for the money. I do it because this place raised me, and I want to share it with you the way it's been shared with me my whole life."* This replaced an earlier, awkwardly-phrased third-person line in the same paragraph ("He doesn't do this for the money; he charges enough to live free of financial worry, no more.") that Nikolai asked removed — don't reintroduce that phrasing.

**Founder note on the landing page (added 2026-08-04):** a friend of Nikolai's who guides professionally (Rachel) reviewed the site and suggested leading more with the founder before the activity picker, rather than leaving that entirely to `about.html`. Added a short first-person `.founder-note` section (`#founder-note` in `index.html`, right after the hero, before the tab switcher) — section label "Why book with me", `about-nikolai-portrait.jpg` alongside 3 short paragraphs. Went through two rounds of correction from Nikolai, both now reflected in the live copy:
1. First draft mentioned Maria Grazia/Davide/Emiliano by name as "the people you'll spend the week with" — **wrong framing**, removed. Guests spend the week with Nikolai himself, not a roster of named locals (those names stay fine elsewhere, e.g. the activity cards).
2. Corrected framing is: he guides full-time in Rome (a real, separate credential, stated up front) and Blera is different because he grew up there, literally in the ruins/tombs, in the village/community that raised him ("it takes a village"). Landing-page copy stays deliberately more restrained than `about.html`: no mention of the harder family material (father's death, alcoholism, half-siblings) belongs here, only the grounded, positive facts already public on the about page (family house restored by his father, tombs as childhood playground, lives in Rome now). Don't add heavier personal content to this block without asking — same boundary as `about.html` itself, just a shorter/lighter cut of it. `.founder-note`/`.founder-note-inner`/`.founder-note-photo`/`.founder-note-text`/`.founder-note-link` CSS lives right above the tab-switcher rules in `style.css`.

---

## SEO (added 2026-07-23)

`main` had **no SEO infrastructure at all** until this date — no `robots.txt`, no `sitemap.xml`, no structured data, despite `BOOKING_STATUS.md`/other docs describing this work as already done (that description was accurate for the `claude/magical-franklin-58SKM` lineage's version of the site, a different, older frontend than what's actually live on `main` — see the branch-drift note at the top of this file). Now present on `main`:
- `robots.txt` + `sitemap.xml` at repo root (indexes `index.html` and `about.html`; `success.html`/`cancel.html` already had `noindex` meta tags and are excluded from both)
- Canonical tags, `og:url`, `og:image`, Twitter card tags on `index.html` and `about.html`
- JSON-LD: `TravelAgency` + `Offer` (the Italian Olive Experience departure, price/dates) on `index.html`; `AboutPage`/`Person` on `about.html`
- Title/meta description on both pages lead with "Italian Olive Experience" for search discoverability

**SEO update (2026-07-24)**: Nikolai specifically asked to also be
findable for the literal phrase "italy experiences" (in addition to the
existing "Italian Olive Experience" targeting above, which stays as the
primary head term — this is additive, not a replacement). Added:
- Title/meta description/OG/Twitter tags now also contain "Authentic
  Italy Experiences" / "custom small-group Italy experience" alongside
  the existing "Italian Olive Experience" phrasing.
- A new `FAQPage` JSON-LD block (6 Q&As) plus a matching **visible**
  FAQ section (`#faq`, inside `#panel-trips` so it's part of the
  default-visible tab, not hidden behind a tab click) — covers what the
  Italian Olive Experience is, how it differs from a normal tour,
  what's included, the Founding Guest discount, the custom-trip option,
  and where Blera is. Nav has a new "FAQ" link (`showTab('trips','faq')`).
- See `BOOKING_STATUS.md`'s 2026-07-24 entry for the Founding Guest
  discount badge/copy added to `#festival-book` in the same session.

**Next session's explicit goal: verify the site in Google Search Console.** Nikolai offered his Google account credentials directly — declined, both because credentials shouldn't be pasted into chat and because this sandbox's outbound proxy can't drive a real browser to a login flow anyway (confirmed: it resets Chromium's TLS handshake on sites like Stripe Checkout and presumably Google too — a proxy/Chromium post-quantum ClientHello incompatibility, not a site bug). Plan instead: Nikolai adds `https://rasnaexperience.com/` as a property at search.google.com/search-console himself, picks HTML-tag verification, and pastes the `<meta name="google-site-verification" ...>` line here — add it to `index.html`'s `<head>` and deploy, then he clicks Verify and submits the sitemap URL himself (both need his logged-in session). Google's old sitemap ping endpoint (`google.com/ping?sitemap=...`) is confirmed dead (410/deprecated since 2023), not a fallback.

**SEO/marketing session, 2026-08-03 (second session that day).** The
branch-drift trap this file has warned about since 2026-07-20 happened
*again*: this session's designated branch was `claude/magical-franklin-58SKM`
(dead for frontend purposes, per the "Deploy topology gotcha" below), and
real work (og:image, LocalBusiness schema, three content pages) got built
and pushed there first, live-checked via `curl`, and found not to be live.
Caught it by running `git log main` and diffing — exactly the check this
file already told every session to do first. Rebuilt everything against
`main` with correct current facts (8-guest cap, not the dead branch's
stale 6–10 figure) and pushed there; confirmed live via the actual GitHub
Pages Actions run, not just a curl guess. See `SEO_BRIEF.md` for the full
current SEO state — it's kept current, check it before redoing SEO work.
Shipped this session: `tuscia-travel-guide.html`, `etruscan-tombs-guide.html`,
`small-group-italy-tours.html` (real photos, cross-linked, in `sitemap.xml`),
`GeoCoordinates` added to the `TravelAgency` schema, `GOOGLE_BUSINESS_PROFILE.md`
and `INSTAGRAM_STRATEGY.md` added as ready-to-use marketing guides. Nikolai's
Google Business Profile submission was accepted the same session (confirmed
by him directly, not independently verified) — photos were sent to him in
chat for potential use there, with the licensing caveat repeated. He said
he'd open an Instagram Business account "tomorrow" — check next session
whether that happened before assuming the Instagram plan is still just a doc.

**Session, 2026-08-04.** Picked up on the same branch-drift trap again —
this session's designated branch (`claude/rasna-tasks-286mcp`, off the
dead `claude/magical-franklin-58SKM` lineage) had stale `CLAUDE.md`/
`BOOKING_STATUS.md` claiming `main` didn't exist; caught it the same way
this file recommends (diffed against `origin/main`) and worked against
`main` for every actual site change. Confirmed this session, from Nikolai
directly: **Google Search Console verification is done** (no verification
meta tag was added by this session — he must have used a non-HTML-tag
method, e.g. an existing Google service; nothing in `index.html`'s
`<head>` changed for this). Google Business Profile photos: **uploaded**.
Instagram Business account: **"on the way"**, not confirmed live yet —
check again next session rather than assuming either way. Also shipped:
the image-weight cut and itinerary-page split described above, the new
founder note, internal cross-links to the new itinerary page, and a
first-post recommendation for Instagram (a 3-photo carousel of the owned
necropolis photos — `card-etruscantombs.jpg`, `moment-3.jpg`,
`moment-2.jpg` — with a drafted caption, given in chat, not saved to a
file) for whenever the account exists to post it. **PageSpeed Insights
could not be run** — the sandbox's shared proxy quota for
`pagespeedonline.googleapis.com` was exhausted both times this session
tried it (`429`, "Queries per day" quota); did a manual image-weight
audit instead (see "Photos" section). Worth a real PageSpeed run next
session in case the quota has reset.

**Session, 2026-08-10.** Fell into the exact branch-drift trap this file
has warned about since 2026-07-20 — a *third* time, and the worst one
yet: significant work (a "meet the people" section, a standalone
cancellation-policy.html, pricing UI) was built against the session's
designated branch (a `claude/new-session-kw1unf` off the dead
`claude/magical-franklin-58SKM` lineage) using *that branch's own*
bundled `CLAUDE.md`/`BOOKING_STATUS.md`, which don't carry this file's
branch-drift warnings at all — so there was nothing to catch the mistake
on until a live-site check (`curl`/WebFetch against rasnaexperience.com)
showed content that matched neither branch. Caught it by diffing
`origin/main` against the designated branch directly. That work is
inert, sitting on `claude/magical-franklin-58SKM`, not reverted (same
established precedent as the 2026-07-24 and 2026-08-03 incidents above).
**If you are a fresh session and your bundled `CLAUDE.md` doesn't mention
`main` as the live branch at all, that alone is a signal you're on a
stale branch — check `git log origin/main` before writing a single line
of site content.**

Real changes shipped this session, redone correctly against `main`:
- Removed the "not for the money" line from the founder bio and added
  Nikolai's own replacement wording as a blockquote (see the About page
  section above).
- Tightened the live cancellation policy (`index.html#policies`) with
  the two carve-outs it was missing: full refund for unavoidable/
  extraordinary circumstances at the destination, and full refund within
  14 days if Rasna cancels. The three refund tiers (30+/15–29/<14 days)
  were left unchanged.
- **Raised the Italian Olive Experience (Nov 9–15 fixed departure) price
  from €1,450 to €1,800, and the Founding Guest discount from €1,230
  (15% off) to €1,400 (22% off)** — real change to
  `worker/src/departures.js` on `claude/magical-franklin-58SKM` (the
  branch that actually deploys the Worker, see "Deploy topology gotcha"
  below), not just copy. All `index.html` references (JSON-LD `Offer`
  price, both FAQ answers, `#festival-book-subtitle`) updated to match,
  so nothing on `main` still says €1,450. Decision made per Nikolai's
  explicit "whatever you think is commercially viable" — reasoning: the
  fixed, fully-curated departure was pricing *below* the top of the
  already-published €1,400–1,800 Make Your Own range, which read
  backwards (the more all-inclusive product should anchor at the top of
  the range, not undercut a flexible custom quote). If this reasoning
  turns out wrong, it's a one-line revert in `departures.js` plus the
  same five `index.html` spots.
- `italian-olive-experience-itinerary.html` was itinerary-only (day-by-
  day + photo gallery, see the 2026-08-04 "Itinerary split" note above)
  and had no pricing, inclusions, or FAQ info of its own — guests had to
  click through to `index.html#festival-book` to learn any of that.
  Added a `#included` section (What's Included, reusing the
  `.included-grid`/`.included-item` classes from `style.css`), a
  `#pricing` section that fetches `/api/departures` live (same pattern
  as `index.html`'s `#festival-book`, so this page's displayed price
  can never drift from the real Stripe charge), and an `#faq` section
  (Founding Guest discount, cancellation policy, link to Make Your Own).
- **Fixed a real, pre-existing bug while wiring the itinerary page's new
  links back to `index.html`:** `index.html#pricing` (and any other
  anchor inside `#panel-build`) didn't work as a deep link from another
  page, because `#panel-build` is `display:none` by default and nothing
  re-routed based on `location.hash` on load — only same-page nav clicks
  (which call `showTab(...)` via `onclick`) worked. Added a small
  IIFE right after the `showTab` function definition that checks
  `location.hash` on load and calls `showTab('build', hash)` if the
  target element lives inside `#panel-build`. This fixes deep links from
  anywhere, not just the itinerary page — worth knowing if adding more
  cross-page links into `#panel-build` later.

**Two "the mods aren't live" reports from Nikolai in this same session,
neither reproduced.** After every push, verified via the GitHub Actions
`pages build and deployment` run (matched `head_sha`, waited for
`status: completed` / `conclusion: success`) and then re-fetched the
live URLs directly with `curl` — every change above was confirmed
present in the actual served HTML/CSS/JS, with fresh `last-modified`
timestamps. For the second report ("the itinerary is missing"): diffed
`curl`'d live `italian-olive-experience-itinerary.html` and `style.css`
against the local working copy (byte-identical), then rendered the local
copy in Playwright at both desktop (1000px, `.calendar-grid`) and mobile
(390px, `.calendar-mobile-list`) widths — full 7-day itinerary present
and correctly displayed both times, no console/page errors from the
page's own code. (Playwright can't hit `rasnaexperience.com` directly in
this sandbox — the proxy resets Chromium's TLS handshake on external
HTTPS, same issue already noted for Stripe/Google elsewhere in this
file — hence testing the byte-identical local copy instead.) Also
confirmed the homepage's "See the full day-by-day itinerary →" link
(`index.html` line ~757) is present and points to the right file.
**Conclusion: no defect found in the code or the deployed site.** Most
likely explanation is a browser/client-side cache on Nikolai's end,
consistent with the first report. Unresolved: never got a screenshot or
specific URL from Nikolai showing what he was actually seeing — if this
comes up again next session, ask for that first before re-doing the
same verification.

**Session, 2026-08-10 (later same day, fresh session hit the branch-drift
trap a fourth time — see top of file).** This session's own bundled
`CLAUDE.md`/`BOOKING_STATUS.md` (checked into a dead `claude/*` branch)
still claimed no `main` branch existed at all. Caught it the same way as
prior incidents: diffed the live site against `origin/main` directly
before writing anything. Real changes shipped, against `main`:
- Removed the sentence "I don't do this for the money." from both
  `index.html`'s founder-note and `about.html`'s blockquote, per
  Nikolai's explicit instruction to eliminate that exact sentence from
  all bios. Left the rest of each line intact ("I do it because this
  place raised me...").
- **Restored the day-by-day itinerary inline on the November Experience
  page** (`index.html#festival-week`) — Nikolai reported "the itinerary
  isn't there anymore," which traces back to the 2026-08-04 split that
  moved it to its own page (`italian-olive-experience-itinerary.html`)
  and left only a click-through link. Re-added the full
  `.calendar-grid`/`.calendar-mobile-list` markup (copied from the
  standalone page, same icon symbols already defined in `index.html`'s
  SVG defs) directly into `#festival-week`, kept the standalone page
  and its link too (relabeled "View this itinerary as its own page" —
  useful for direct/social sharing, no longer the only place to see it).
- **Added three new content blocks to `#festival-week`**, after the
  itinerary: a `.transformation-grid` "What you'll leave with" 3-card
  benefits section (new CSS class, mirrors `.included-grid`'s pattern
  but 3 columns, added to the `max-width:600px` mobile breakpoint too),
  a pull-quote reusing the existing founder line, a "The Place" writeup
  about Blera (adapted from already-verified copy in
  `tuscia-travel-guide.html`, not fabricated — deliberately didn't
  invent specific Da Beccone amenity details that aren't documented
  anywhere in the repo), and a condensed "Meet your host" block (styled
  via the existing `.about-content`/`.about-photo-main`/`.about-text`
  classes from `about.html`, using `about-nikolai-portrait.jpg` — the
  other Nikolai photo, `about-nikolai-bar.jpg`, has a video-UI mute/
  profile icon baked into the actual JPEG from wherever it was
  originally sourced, visible on close inspection; worth swapping out
  on `about.html` too at some point, not fixed this session since it's
  out of scope). Prompted by Nikolai sharing screenshots of a
  competitor's (unrelated business) trip-guide PDF and asking for
  "this type of info" on the November page. Deliberately **did not**
  build a multi-host "meet the team" grid featuring local partners
  (Maria Grazia, Davide, Emiliano) — confirmed with Nikolai first given
  the standing correction on that exact framing (see the 2026-08-04
  founder-note entry above); he chose "just you, reframed."

**Session, 2026-08-11.** No branch-drift this time — session's
designated branch (`claude/website-fixes-0zr2pl`) was checked against
`origin/main` immediately per the standing instruction above, and all
real work was done in fresh clones of `main` (frontend) as usual.
Picked up mid-session from a prior context window's work (the pricing
overhaul, aesthetic rounds, and hero-hook placement documented in the
2026-08-10 entries above and the Standing rules were already live).
This session's own changes, roughly in the order they happened:
- **Aesthetic**: multiple rounds of "make it more Italian" feedback
  landed as the font swap to Bodoni Moda, the wine/rust color
  additions, drop caps, the document-frame price-card border, and
  finally an olive-branch SVG motif (after a red-and-white-stripe
  treatment was explicitly rejected as too on-the-nose). Then "the site
  needs to be more fun" landed as pill-shaped buttons and the rotated
  passport-stamp departure badge.
- **Discovered and fixed a real Chromium/sandbox rendering bug**: the
  technique used to hide the shared SVG `<defs>` block
  (`style="display:none"`) silently breaks every `<pattern>` fill that
  references it — meaning the meander divider pattern had never
  actually rendered on any page, all session, despite earlier commit
  messages claiming it worked. Root-caused with isolated test files,
  fixed by switching to `width="0" height="0" style="position:absolute"`
  on all affected pages — see the Design language entry above.
- **Em dashes removed sitewide** ("remove all — it makes it look like
  ai") — rewritten grammatically page by page, legitimate en-dash
  ranges (date spans, price ranges) left alone.
- Reverted an itinerary-collapse UX experiment (`<details>`/"at a
  glance" pills) built in response to a length complaint — Nikolai
  preferred the itinerary fully visible, no toggle; reverted cleanly,
  unused CSS removed.
- Moved the founder pull-quote to sit after the booking form rather
  than before the itinerary, per explicit request.
- Hero copy iteration with a designer-friend's relayed feedback (page
  too long, lead with the USP, more emotion) landed as the "No more
  TikTok itineraries." hook — first tried on the November section,
  corrected to belong on the **site-wide** hero instead ("not the
  november tour").
- "You'll leave with more than a vacation." became the transformation
  section's headline, per direct instruction.
- Hero CTA changed to jump straight to booking on page load, per "when
  you open the page it needs to go straight to the booking of
  november."
- **The big one: split the November Experience content into its own
  family of pages** ("all the sections i want them to be different
  pages," confirmed scope = everything including pricing/booking, nav
  style = a top sub-nav linking each page). Built
  `italian-olive-experience-{host,highlights,pricing,faq}.html`,
  rebuilt `index.html#festival-week` into a hub with link-out cards,
  added the sub-nav to all 6 pages in the family, fixed every
  cross-link site-wide that pointed at a now-moved `index.html` anchor,
  updated `sitemap.xml`. Full detail in the new "Current architecture
  of the November Experience pages" section above — read that, not
  this bullet list, before editing any of these pages.
- Verified all 6 pages (tag-balance check + Playwright screenshots,
  method described in the architecture section above) before
  committing. One commit, pushed directly to `main`, per the standing
  "push and go live immediately" instruction.

**Nothing outstanding from this session specifically** — the split is
complete and live. Open items carried forward unchanged (see
`BOOKING_STATUS.md` for the booking/pricing ones): room-type capacity
still not enforced, room photos for Da Beccone/Casamatta still
pending from Nikolai, `about-nikolai-bar.jpg`'s baked-in video-UI
artifact still not fixed (note: it's now also used as the hero
background on `italian-olive-experience-host.html` — cropped/darkened
enough there that the artifact isn't visible, but worth swapping for a
clean photo whenever one's available), Google Search Console/PageSpeed
follow-ups from the 2026-08-03/2026-08-04 entries were never
re-confirmed one way or the other — ask Nikolai directly rather than
assuming either way if it comes up.

---

## Git / deploy

- Local `git push origin main` works fine — no need to route through `mcp__github__push_files`.
- **GitHub Pages deploys can fail/stall transiently** (a queued/in-progress run that never picks up the latest commit, or a `deploy-pages` step that errors with a generic "Deployment failed, try again later"). Fix: `git commit --allow-empty -m "Retrigger GitHub Pages deployment" && git push`. May take 1–2 tries.
- **`?cb=$RANDOM`-style query-string cache-busting does NOT reliably work on this site** (found 2026-07-23, cost real time chasing a phantom bug): rasnaexperience.com's CDN (Fastly, via GitHub Pages) can ignore the query string and serve a cached response regardless — confirmed via `x-cache: HIT` on a freshly-randomized URL. The **only reliable way** to know a deploy landed: use `mcp__github__actions_list` (method `list_workflow_runs`, filter `branch: "main"`) to find the `pages build and deployment` run whose `head_sha` matches your latest commit, and wait until its `status` is `completed` (not just present in the list — a matching run can sit at `queued` or `in_progress` for a while, and other runs' `status`/`conclusion` fields can appear nearby in the raw JSON and get grep-matched by mistake, giving a false "success" read). The result is large; grep the saved tool-result file for `"head_sha":"<your sha>"` and read the ~400 chars around it directly rather than grepping for `status`/`conclusion` alone. Only after that run shows `completed` is a plain `curl` (no cache-busting needed/helpful) trustworthy — cross-check its `last-modified` header against your commit's timestamp as a second confirmation.
- This repo has many other stale `claude/*` branches from unrelated past sessions — ignore them unless asked, but see the note at the top of this file about not assuming any of them (or even a session's own designated branch) reflects `main`'s current state.
- **Booking backend** (`worker/`, Cloudflare Worker + D1 + Stripe) is a separate system from the static site — see `BOOKING_STATUS.md` for live/current status before assuming anything about it, and `worker/README.md` for setup steps. As of 2026-07-19 it's in **Stripe live mode**, real payments work.
- Custom domain **rasnaexperience.com** is live and canonical (see top of file) — the old "point a `rasna.com` domain at this site" goal is done, just under a different domain name than originally planned. **Next session's explicit goal is now the Google Search Console verification described in the SEO section above.**

---

## Deploy topology gotcha (found 2026-07-20)

The static site (GitHub Pages) and the Worker (Cloudflare) deploy from
**different branches**, confirmed by checking `pages build and
deployment` runs via `mcp__github__actions_list` (`head_branch` was
always `main`) and by pushing a Worker-only change to
`claude/magical-franklin-58SKM` and observing it go live at
`rasna-booking-api...workers.dev` without touching `main`:

- **GitHub Pages** (the whole site, `index.html`/`success.html`/etc.):
  deploys from `main`. This is the one described everywhere else in
  this file.
- **Cloudflare Worker** (`worker/`): deploys from
  `claude/magical-franklin-58SKM`, a separate, older branch that
  diverged from `main` a while ago on everything *except* `worker/`
  (no independent changes to `worker/src` were found there — same
  code, just behind on the parts of the repo main went on to change:
  `index.html`, `images/`, `style.css`, `about.html` don't exist on
  that branch at all). Safe to keep pushing `worker/`-only commits
  there since the two branches' `worker/` trees haven't diverged, but
  **don't push a `main`-based commit to that branch wholesale** — it
  would blow away that branch's stale-but-separate frontend state
  (harmless, since Pages doesn't read from it, but confusing/wasteful).
  If a `worker/` change needs to go live, push it to
  `claude/magical-franklin-58SKM` specifically; if a static-site change
  needs to go live, push to `main`.
- **D1 migrations are never auto-applied** by either deploy — always a
  separate manual `wrangler d1 migrations apply rasna-bookings --remote`
  from `worker/`, needs `CLOUDFLARE_API_TOKEN` (D1 Edit) *and*
  `CLOUDFLARE_ACCOUNT_ID` (narrowly-scoped tokens can't auto-resolve
  the account) set in the environment running the command.
- Worth fixing properly at some point: point the Worker's Cloudflare
  git integration at `main` too, so there's one deploy branch instead
  of two silently-different ones — flagging it here rather than doing
  it unprompted, since it touches Cloudflare project settings, not
  just this repo.

## Working style

Nikolai isn't technical and doesn't want to run CLI commands, create
scoped API tokens, or otherwise operate deployment tooling himself.
Default to doing infra/deployment work directly rather than handing
him a list of commands. When something needs a credential you don't
have, ask him for the minimum needed piece (a scoped token, an account
ID) and take it from there yourself — don't just report "you need to
run X." Never write a live token/secret into a file in this repo, even
temporarily; use it directly from the shell for the one command that
needs it.

---

## Session, 2026-08-13

Two unrelated changes, both against `main`.

**About page portrait replaced.** Nikolai wanted the existing
`images/about-nikolai-portrait.jpg` (a dark studio headshot used in
`about.html`'s `.about-photo-main` slot) taken off the site, then
replaced with a real photo of him on a rooftop in Blera (terracotta
roofs, the bell tower, overcast sky). Important technical note for
next time a photo goes in that slot: `.about-photo-main` is a fixed
**4:5 box** with `background-size: cover; background-position: center`
— a dumb center-crop, not face-aware. The rooftop photo is landscape
with Nikolai standing in the right third of the frame, so a naive
center-crop would have sliced him out of the picture almost entirely.
Recomposed it server-side instead (Pillow): cropped a 4:5 slice anchored
to the right edge of the source image so he's fully in frame with the
bell tower/rooftops behind him, then resized to 1290×1613 and
compressed to ~320KB. Any future photo for this specific slot needs the
same manual recompose-before-upload treatment, not a straight upload.

**Casamatta confirmed as lodging, replacing Da Beccone.** Nikolai said
it's now official he's working with Casamatta (3 independent
apartments in Blera — Piccolo, Grande, Civico 40) for guest lodging,
replacing Da Beccone as the plan for the Nov 9–15 departure. Updated
`CONTATTI_LOCALI.md` §0/§8 (Casamatta marked ✅ CONFERMATO, apartment
layout table carried over from the abandoned 2026-07-24 branch work
that never made it onto `main`; Da Beccone marked superseded but left
documented for reference) and `BOOKING_STATUS.md`'s Lodging item.
**Not resolved:** Casamatta's actual per-apartment rates were never
formalized (only Civico 40 had an informal price signal), and which
apartment(s) will house the group of 8 is still open — `FINANCIAL_PLAN.md`
§1's margin math still runs on Da Beccone's old rates as a flagged
provisional stand-in until real Casamatta numbers come in. Nothing
guest-facing on the live site changed, since the site never named a
specific lodging partner anywhere to begin with.

**Branch-drift note:** this session's designated branch
(`claude/replace-first-plane-picture-beasqh`) was based on the dead
`claude/magical-franklin-58SKM` lineage, but — unlike prior
incidents — its bundled `CLAUDE.md` was this same fully-current file
(up through the 2026-08-12 entry above), which almost masked the drift:
the doc looked current while `index.html`/`about.html`/`images/` were
all months stale (no `about.html`, no `images/` directory at all).
Caught only because the live site's actual served HTML (fetched via
`curl`) didn't match what was in the local checkout. Branch was reset
to `origin/main` before making any edits. Lesson for next time: a
current-looking `CLAUDE.md` is not proof the branch's *site files* are
current — check `git log` / diff the actual pages, not just this file's
freshness.

## History note

On 2026-07-09, this session replaced a *different* previously-live design (terra/sienna/gold palette, decorative SVG-only, no photography — built by an earlier/separate session directly on `main`) with the photo-rich version described above, per explicit user confirmation after flagging the conflict. If you're picking up fresh context and something looks unfamiliar, check git log on `main` before assuming — don't just trust this file blindly if the live site doesn't match what's described here.
