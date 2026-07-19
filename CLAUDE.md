# RASNA — Blera Business Site

Single-page static marketing/booking site for RASNA, small-group immersive expedition travel in Blera, Italy.

**Live URL:** https://nikolaifissenko.github.io/rasna/
**Repo:** nikolaifissenko/rasna (GitHub Pages, deploy-from-branch, `main`, root)
**Files:** `index.html` + `style.css` + `images/` — the only things that matter for the live site. `ITINERARY_NOV2026.md` is a planning/cost doc (not part of the live site) for the Nov pilot departure.
**Dev branch:** as of 2026-07-19, work happens on `claude/itinerary-edits-3130zt` → PR → merge to `main` for every change, no matter how small. **Standing instruction: always open a PR and merge it immediately without asking** — the user wants edits to go live automatically, not sit waiting for approval. If that branch's PR has already been merged when a new task starts, restart it from `origin/main` (`git fetch origin main && git checkout -B claude/itinerary-edits-3130zt origin/main`) rather than reusing stale history — its remote copy gets deleted on merge. (A prior session's `claude/italy-trip-itinerary-ve6z8z` branch was based on a stale, months-old snapshot that had diverged heavily from `main` — its useful work was manually reapplied to `main` and the branch is now safe to ignore/delete. Before assuming any other `claude/*` branch is current, diff it against `origin/main` first.)

---

## Standing rules (never re-ask)

- Pricing: **no fixed price**. Flow is select activities → contact form → custom quote based on days + activities chosen. As of 2026-07-19 the Pricing section also shows a ballpark **€1,400–1,800 per person** range (`.pricing-range`) above the existing "no flat rate" copy — purely informational, doesn't change the custom-quote flow.
- Group size: **8 people max**
- Formspree endpoint: `https://formspree.io/f/xlgynpjo`
- Contact email: `nikolai.fissenko1@gmail.com`
- Design language: warm editorial (cream/tufo/terracotta/gold on dark earth-tone sections), Cormorant Garamond + Inter, Etruscan meander/palmette SVG ornaments — **not** the old terra/sienna/lozenge-grid design (that version was replaced this session, see below)

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
- `card-foraging.jpg`, `card-charcuterie.png`, `card-nonne.jpg`, `card-sangiovenale.jpg`, `card-etruscantombs.jpg` — activity-card hover-reveal photos (see below)

**Activity card hover reveal:** cards with a matching photo get `class="activity-card has-photo" style="--photo:url('images/X.jpg')"`. On hover, a darkened photo fades in behind the text (see `.activity-card.has-photo::before`) instead of showing a static thumbnail — deliberately avoids a "menu with pictures" look. As of 2026-07-19, every activity card has one — the last 5 (football, Pellegrinaggio, Porceddu, Stratto al Tartufo, Lago di Vico) plus Terme della Tuscia and Wherever You Want to Go were filled in this session.

**Getting pasted images into the repo:** the user regularly pastes photos directly into chat rather than linking them. There is no tool that saves a pasted image straight to disk. Working method: the session transcript at `/root/.claude/projects/-home-user-rasna/<session-id>.jsonl` eventually contains each pasted image as a base64 `image` content block inside a `message.content` list — grep/parse it with Python (hash each block's `data` with sha256 to dedupe against already-extracted images, since the same image often reappears across turns), decode, and write to a scratch dir before copying into `images/`. Caveat: images attached to a **mid-turn interruption** message (the `<system-reminder>The user sent a new message while you were working` mechanism) can take a while to actually land in that jsonl file — polling immediately after receiving one may come up empty even though the image is visibly present in context. If it's not there yet, don't loop-poll (each check bloats the transcript further); ask the user to resend in a normal (non-interrupting) message instead.

**Licensing status — flagged repeatedly this session, not resolved:** nearly all ~28 images are scraped from third-party sites (blogs, tourism boards, a newspaper, TripAdvisor, Pinterest, Instagram, a commercial food-tour company) at the user's explicit direction, accepting the copyright risk. This is now a **live public site**, not a private draft. Before this is treated as a finished/permanent asset, the user should either get permission or replace these with owned/licensed photos — don't forget this caveat just because it's live.

On 2026-07-12, `moment-2.jpg`, `moment-3.jpg`, and the new `card-etruscantombs.jpg` (Etruscan Tombs card hover photo) were replaced with the user's own photos of the real Necropoli G. Porcini near Blera — first owned photos on the site, chip away at the licensing risk above when more become available. The user also supplied a photo of a person posing at a tomb that was deliberately **not** published (unconfirmed consent to show an identifiable face on a public marketing site) — ask before adding it if revisited.

Known dead ends: Facebook and Instagram photo links reliably fail to resolve (auth-walled) — don't spend time retrying those, ask for a different source.

---

## Planned Events tab (added 2026-07-15)

The page now has two tabs, toggled by `showTab('build'|'trips', scrollToId)` in the `<script>` block, via a switcher (`.tab-switcher`) placed right under the hero:

- **Build Your Own** (`#panel-build`) — the original activity-picker flow: How It Works, Photo Break, Catalog + `#experience-form`, Included, Moments, Trips Gallery, Philosophy, Pricing, Contact. Default-visible tab.
- **Planned Events** (`#panel-trips`, `display:none` by default) — pre-built fixed-departure itineraries. Currently one: **Italian Autumn Experience** (subtitle "Cantine Festival Week"), Nov 9–15 2026, `#festival-week`. Has its own day-by-day `.itinerary-grid` of `.day-card`s and a **standalone** booking form (`#festival-form`) — deliberately not wired to the activity-catalog selection state, since it's a fixed package, not a build-your-own quote. As of 2026-07-19 this form no longer uses Formspree/a static Stripe payment link — it calls a real Cloudflare Worker + D1 + Stripe Checkout backend (`worker/`) and takes full payment (€1,450/person) in **live mode**. See `BOOKING_STATUS.md` for current status/secrets/what's-left before touching this flow.

**Nov 9–15 itinerary text (as of 2026-07-19):** Tue evening dinner moved to Tarquinia (was "back in Blera"); Wed evening is "Home-cooked local dinner" (was "residence chef"); Sat goodbye dinner venue changed from Trattoria La Torretta to an unnamed "local cantina" — **still needs a real venue name and quote**, flagged as TODO in `ITINERARY_NOV2026.md`. Panonto is described everywhere on the site (card copy + itinerary) as "a typical Bleran BBQ: bread roasted over embers" — keep that phrasing if editing panonto copy elsewhere. The Tomb Raiding scavenger hunt (both the activity card and Tue's itinerary text) now specifies it starts in the medieval village and leads down into the tombs, host-guided.

**Nov 9–15 page photos (added 2026-07-19, all reused from existing site images, no new licensing exposure):** a full-bleed hero band at the top of `#festival-week` (`.featured-trip-hero`, `chapter-break.jpg`); every day in the mobile itinerary list (`.cm-day-photo`) has a photo now — Mon `hero.jpg`, Tue `card-tombaroli.jpg`, Wed `moment-9.jpg`, Thu `card-pasta.jpg`, Fri `card-sangiovenale.jpg`, Sat `card-cantinefestival.jpg`, Sun `moment-1.jpg`; the desktop calendar-grid view intentionally has no photos (too dense/compact). Below the itinerary and above the booking form sits `.festival-gallery`, an 8-photo strip (2 rows × 4 on desktop, 4 × 2 on mobile) of week-specific highlights: necropolis path, olive grove harvest, Tarquinia fresco, Cantine Festival interior, olive-oil pressing, Blera's piazza church, Tuscia Terme, and hand-made pasta dough.

Nav links and the hero's secondary CTA call `showTab(...)` instead of plain anchor `href` jumps, since anchor-scrolling into a `display:none` panel doesn't work — always route through `showTab` when linking to anything inside either panel.

To add a second planned event: duplicate the `.featured-trip` section structure inside `#panel-trips` (or turn the single trip into a card that expands, if there end up being several) — nothing today assumes there's only one.

Cost tracking for the Nov 9–15 departure (confirmed vendor quotes: Tuscia Terme, Il Cavone, Trattoria La Torretta, Tarquinia tombs entry, the Nicolò-hosted panonto BBQ) lives in `ITINERARY_NOV2026.md`, checked against the €310/guest meals+activities budget in `FINANCIAL_PLAN.md`. That doc is operational/internal — none of its cost figures are shown on the live site.

---

## Git / deploy

- Local `git push origin main` works fine — no need to route through `mcp__github__push_files`.
- **GitHub Pages deploys can fail/stall transiently** (a queued/in-progress run that never picks up the latest commit, or a `deploy-pages` step that errors with a generic "Deployment failed, try again later"). Fix: `git commit --allow-empty -m "Retrigger GitHub Pages deployment" && git push`. May take 1–2 tries.
- Verify a deploy actually landed with a cache-busted fetch, not just a status check:
  ```
  curl -s "https://nikolaifissenko.github.io/rasna/?cb=$RANDOM" | grep -c "<some string unique to the new content>"
  ```
  Cross-check the `last-modified` response header against the latest commit time — don't trust a single fetch.
- `mcp__github__actions_list` (method `list_workflow_runs`) is the reliable way to check Pages build status — raw `curl` to `api.github.com` is **not** authenticated in this sandbox and will just 401.
- This repo has many other stale `claude/*` branches from unrelated past sessions — ignore them unless asked.
- **Booking backend** (`worker/`, Cloudflare Worker + D1 + Stripe) is a separate system from the static site — see `BOOKING_STATUS.md` for live/current status before assuming anything about it, and `worker/README.md` for setup steps. As of 2026-07-19 it's in **Stripe live mode**, real payments work.
- **Next session's explicit goal: point a `rasna.com` custom domain at this GitHub Pages site.** Will need a `CNAME` file at repo root, DNS records, and updates to `SITE_URL`/`CORS_ORIGIN` in `worker/wrangler.toml` plus any hardcoded `nikolaifissenko.github.io` URLs in `index.html` — see `BOOKING_STATUS.md` "Not yet done" for the fuller checklist.

---

## History note

On 2026-07-09, this session replaced a *different* previously-live design (terra/sienna/gold palette, decorative SVG-only, no photography — built by an earlier/separate session directly on `main`) with the photo-rich version described above, per explicit user confirmation after flagging the conflict. If you're picking up fresh context and something looks unfamiliar, check git log on `main` before assuming — don't just trust this file blindly if the live site doesn't match what's described here.
