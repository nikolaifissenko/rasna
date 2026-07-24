# RASNA — Blera Business Site

Single-page static marketing/booking site for RASNA, small-group immersive expedition travel in Blera, Italy.

**Live URL:** https://rasnaexperience.com/ (custom domain, confirmed live 2026-07-23; `nikolaifissenko.github.io/rasna` still resolves and still works, kept as a CORS/old-link fallback, but rasnaexperience.com is canonical everywhere: canonical tags, sitemap, robots.txt, worker `SITE_URL`)
**Repo:** nikolaifissenko/rasna (GitHub Pages, deploy-from-branch, `main`, root)
**Files:** `index.html` (main landing page) + `about.html` (founder bio page) + `style.css` + `images/` — the pages that matter for the live site. `ITINERARY_NOV2026.md` is a planning/cost doc (not part of the live site) for the Nov pilot departure.
**Dev branch:** work directly against `main` — check out a short-lived local branch from `origin/main`, commit, push straight to `main` (no PR needed for routine edits). **Standing instruction: push and go live immediately without asking** — the user wants edits to go live automatically, not sit waiting for approval. `main` is the single source of truth for both the site content and this file; a different branch, `claude/magical-franklin-58SKM`, is where the Cloudflare Worker (`worker/`) deploys from — see "Deploy topology gotcha" below before touching anything in `worker/`. **A 2026-07-23 session found a stale `claude/session-context-k9kxoq` branch (descended from an old fork of `magical-franklin-58SKM`) that had drifted from `main` for weeks without anyone noticing** — it redid work already done on `main` and separately had real, non-duplicate lodging-planning content that had to be manually ported over. Before trusting any `claude/*` branch's state, diff it against `origin/main` first; don't assume a branch is current just because a session's designated-branch instructions point at it. **This happened again on 2026-07-24** — a session spent real effort on `claude/magical-franklin-58SKM`'s `index.html` (SEO copy, an About section, pricing UI) before catching that `main` is what's actually live; see `BOOKING_STATUS.md`'s 2026-07-24 entry for the full account. If you're a fresh session reading this: check `git log main` and compare against whatever branch you were told to use *before* touching `index.html`, `style.css`, or `about.html` — every single time, not just when something feels off.

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
- **Planned Events** (`#panel-trips`, `display:none` by default) — pre-built fixed-departure itineraries. Currently one: **Italian Olive Experience** (renamed from "Italian Autumn Experience" 2026-07-23 for search-discoverability — people search "italian olive experience"; subtitle now "Autumn in Italy: Olives and Wine", was "Cantine Festival Week"), Nov 9–15 2026, `#festival-week`. Has its own day-by-day `.itinerary-grid` of `.day-card`s and a **standalone** booking form (`#festival-form`) — deliberately not wired to the activity-catalog selection state, since it's a fixed package, not a build-your-own quote. As of 2026-07-19 this form no longer uses Formspree/a static Stripe payment link — it calls a real Cloudflare Worker + D1 + Stripe Checkout backend (`worker/`) and takes full payment (€1,450/person) in **live mode**. See `BOOKING_STATUS.md` for current status/secrets/what's-left before touching this flow. The renamed title appears in 4 places in `index.html` (hero CTA, tab button, `<h2>`, `<title>`/meta tags) — keep them in sync if renaming again. `worker/src/departures.js`'s `label` field ("November 9–15, 2026") is independent of this display name, no worker change needed for a rename.
- **Nav "Planned Events" link** points at `#festival-calendar`, not `#festival-week`, via `showTab('trips','festival-calendar')` — landing on the section's own top ID scrolls to the `.featured-trip-hero` photo band (found confusing 2026-07-23) or, worse, to a bare anchor with no `scroll-margin-top`, which lands the sticky nav bar overlapping the content. `#festival-calendar` is on the `.featured-trip-header` div itself (title + description), included in the site's `scroll-margin-top: 78px` rule (`section[id], .category[id], #festival-calendar` in `style.css`) so the sticky nav doesn't cover it. If adding more nav-jump targets, give them the same treatment.

**Nov 9–15 itinerary text (as of 2026-07-19):** Tue evening dinner moved to Tarquinia (was "back in Blera"); Wed evening is "Home-cooked local dinner" (was "residence chef"); Sat goodbye dinner venue changed from Trattoria La Torretta to an unnamed "local cantina" — **still needs a real venue name and quote**, flagged as TODO in `ITINERARY_NOV2026.md`. Panonto is described everywhere on the site (card copy + itinerary) as "a typical Bleran BBQ: bread roasted over embers" — keep that phrasing if editing panonto copy elsewhere. The Tomb Raiding scavenger hunt (both the activity card and Tue's itinerary text) now specifies it starts in the medieval village and leads down into the tombs, host-guided. Thu Nov 12 afternoon slot (both desktop grid and mobile list) now specifies lunch at **Terrarte** (Sandro Scarmiglia's outdoor sculpture park, olive grove) before the pasta-making class — added 2026-07-23, also reflected in `ITINERARY_NOV2026.md`.

**Nov 9–15 page photos (added 2026-07-19, all reused from existing site images, no new licensing exposure):** a full-bleed hero band at the top of `#festival-week` (`.featured-trip-hero`, `chapter-break.jpg`); every day in the mobile itinerary list (`.cm-day-photo`) has a photo now — Mon `hero.jpg`, Tue `card-tombaroli.jpg`, Wed `moment-9.jpg`, Thu `card-pasta.jpg`, Fri `card-sangiovenale.jpg`, Sat `card-cantinefestival.jpg`, Sun `moment-1.jpg`; the desktop calendar-grid view intentionally has no photos (too dense/compact). Below the itinerary and above the booking form sits `.festival-gallery`, an 8-photo strip (2 rows × 4 on desktop, 4 × 2 on mobile) of week-specific highlights: necropolis path, olive grove harvest, Tarquinia fresco, Cantine Festival interior, olive-oil pressing, Blera's piazza church, Tuscia Terme, and hand-made pasta dough.

Nav links and the hero's secondary CTA call `showTab(...)` instead of plain anchor `href` jumps, since anchor-scrolling into a `display:none` panel doesn't work — always route through `showTab` when linking to anything inside either panel.

To add a second planned event: duplicate the `.featured-trip` section structure inside `#panel-trips` (or turn the single trip into a card that expands, if there end up being several) — nothing today assumes there's only one.

Cost tracking for the Nov 9–15 departure (confirmed vendor quotes: Tuscia Terme, Il Cavone, Trattoria La Torretta, Tarquinia tombs entry, the Nicolò-hosted panonto BBQ) lives in `ITINERARY_NOV2026.md`, checked against the €310/guest meals+activities budget in `FINANCIAL_PLAN.md`. That doc is operational/internal — none of its cost figures are shown on the live site.

---

## About page / founder bio (rewritten 2026-07-23)

`about.html` has a long, deeply personal, third-person founder bio under `.about-text`, broken into `<h3>` subheads (styled via `.about-text h3` in `style.css` — small-caps terracotta labels, not full section headers; the page has no `<h2>` headline anymore, just a `.section-label` reading "Founder Bio"). It covers real family history at the user's explicit direction: his parents' origin stories (father Vladimir Fissenko's escape from the USSR in 1986, the Tierra del Fuego–to–Alaska horse ride, mother Sophie), his father's alcoholism and the 2023 death from cirrhosis, two half-siblings (Alionka, Luciana) he learned about at different points including after his father's death, his uncle Victor's 2016 death, and how Rasna itself started (a 2026 weekend with his sister Alina + a conversation with Maria Grazia). **This is sensitive, factual content about real people — don't rewrite, trim, or "clean up" any of it without asking first**, even if it reads unusually candid for a business site; that candor was deliberate and explicitly requested. Style notes if editing: no em dashes anywhere on this page (removed at the user's request 2026-07-23), third-person voice throughout, new facts get woven into the existing narrative rather than appended as disconnected sentences.

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

## History note

On 2026-07-09, this session replaced a *different* previously-live design (terra/sienna/gold palette, decorative SVG-only, no photography — built by an earlier/separate session directly on `main`) with the photo-rich version described above, per explicit user confirmation after flagging the conflict. If you're picking up fresh context and something looks unfamiliar, check git log on `main` before assuming — don't just trust this file blindly if the live site doesn't match what's described here.
