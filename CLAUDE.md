# RASNA — Blera Business Site

Single-page static marketing/booking site for RASNA, small-group immersive adventure travel in Blera, Italy.

**Live URL:** https://nikolaifissenko.github.io/rasna/
**Repo:** nikolaifissenko/rasna (GitHub Pages from `main`, deploy-from-branch, root)
**File:** `index.html` (~1000 lines) — the only file that matters

---

## Standing rules (never re-ask)

- Always commit, push, and send the live link — no confirmation needed
- Formspree endpoint: `https://formspree.io/f/xlgynpjo`
- Contact email: `nikolai.fissenko1@gmail.com`
- Max group size: **9** (furgone 9 posti — 9-seat van)
- Pricing: **no fixed price**. Flow is select activities → contact form → custom quote

---

## Activity catalog (must match BUSINESS_PLAN.md exactly)

**Farm & Field:** Olive Harvest, Tomato & Sauce Day, Grape Harvest, Foraging
**Artisan & Food:** Charcuterie Degustation, Cheese Making or Tasting (guest chooses hands-on vs. guided), Pasta Making
**Culture & Outdoors:** Cammino dei Tre Villaggi, San Giovenale & Panonto, Horseback Riding
**Day Trips:** single card ("Wherever you want")

NO Hazelnut Harvest. NO Renzo/leather arts and crafts (Leather Workshop was removed — not actually offered).

---

## Design tokens (CSS custom properties)

```
--terra: #B84C2A   --sienna: #7A2E10   --gold: #C9953A
--parch: #E8D8BC   --sand: #D4BFA0     --ink: #1E1008
--earth: #2E1C0C   --smoke: #4A3420    --cream: #F4EDE0
--olive: #5C6B3C   --noir: #14100B
```

## Key design elements

- Section dividers: inline SVG "vase-rim" bands (two thin rules + meander path), 14px tall
- Hero: diamond-chain frieze SVG, `color: var(--terra)`, `opacity: 0.55`
- Catalog section: lozenge grid CSS background (`stroke-opacity: .14`)
- Three-ways section (now also carries the old Intro copy — "Before Rome, there was Rasna"): diamond row ornament, `opacity: 0.45`, 160px wide
- `.fi` class + IntersectionObserver for scroll fade-in
- Sticky `.site-nav`: logo, anchor links (Experiences/Included/Contact), live "N selected" counter (`#nav-count`, updated in `sync()`), "Get a Quote" jump-to-contact button
- Catalog has `.catalog-quicknav` pill links to jump to each category (`#cat-farm`, `#cat-artisan`, `#cat-culture`, `#cat-daytrips`)
- Step labels: "Step 1 · Build your expedition" (catalog eyebrow), "Step 2 · Your details" (contact eyebrow)
- Trip stats (9 people / 100% hands-on / 0 tour buses / 2,800 years) live inside `.included` as `.trip-stats`, not a standalone section
- No standalone Intro or Pricing sections anymore — merged/removed for a shorter page

---

## Git / deploy

Local `git push origin main` works fine in this environment (no 503s observed) — just push directly, no need to route through `mcp__github__push_files`.

**GitHub Pages deploys can fail transiently.** The "pages build and deployment" workflow sometimes errors on the final `actions/deploy-pages` step with a generic `Deployment failed, try again later.` (build succeeds, only the deploy step fails). This is not caused by repo content or Pages settings. Fix: push an empty commit (`git commit --allow-empty -m "..." && git push`) to retrigger; may take 2–4 attempts. Verify with:
```
curl -s "https://nikolaifissenko.github.io/rasna/?cb=$RANDOM" | grep -c "<some string unique to the new content>"
```
Don't trust a single fetch — check the `last-modified` response header against the latest commit time to confirm it's not a stale cached build.

---

## Commit history (recent)

```
f43f14d Retrigger GitHub Pages deployment (retry #4)
8594d29 Simplify landing page: sticky nav, merged sections, activity fixes (#6)
ad4dd74 Add CLAUDE.md session memory file
6245e32 Remove fixed pricing — quote based on activities selected
942aad8 Update max group size to 9 (furgone 9 posti)
b58bc7a Increase visibility of Etruscan decorative elements
935e849 Add Etruscan decorative patterns: hero diamond-chain frieze, catalog lozenge background, price card corner brackets, geometric ornament row in three-ways
```
