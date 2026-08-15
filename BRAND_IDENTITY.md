# Rasna Brand Identity (v3, August 2026)

Visual style guide: see the published brand identity artifact (palette,
logo usage, typography, Instagram grid mockup) — link shared in chat.
This doc is the reference copy for anyone editing the site or social
assets later.

## Where the palette comes from

This is **not a new palette** — every value below is copied verbatim
from `index.html`'s own `:root`. The site already had a wine-bordeaux,
a deeper rust, an olive military green, a warm buff, and a sage-gold
that the hero and nav already lean on. This doc just names each
color's job and builds the new amphora logo out of the same ten
variables, so social content and the site read as one system instead
of the palette living only in scattered CSS.

## Colors

All ten are the exact `index.html` variables — same names, same hex.

| Role | Name | Variable | Hex |
|---|---|---|---|
| Primary | Bordeaux | `--terracotta` | `#6B2436` |
| Primary | Military Green | `--olive` | `#5C6B3C` |
| Vase tone | Rust (mark's outer ring) | `--rust` | `#4E1A26` |
| Vase tone | Tufo (mark's ground / panels) | `--tufo` | `#E5D8C2` |
| Vase tone | Earth (ink / mark outline) | `--earth` | `#211E15` |
| Vase tone | Gold (dark-background accent) | `--gold` | `#A8AD6E` |
| Neutral | Cream (page background) | `--cream` | `#F2EBDD` |
| Neutral | Deep (hero/nav background) | `--deep` | `#170B0D` |
| Neutral | Stone (captions) | `--stone` | `#7C7A5C` |
| Neutral | Card | `--card-bg` | `#FBF7EF` |

Two primaries (bordeaux + military green) should dominate every post or
page — exactly how the live site already uses `--terracotta` for CTA
buttons/badges and `--olive` for the hero's ambient glow. Gold stays a
dark-background accent (nav logo, hero headline — its existing job);
don't introduce it as a light-background color. No new hex values,
just tighter, named usage.

## Typography

- **Display** — Cormorant Garamond (600/700): wordmark, headlines, pull
  quotes only. Already the live site's serif.
- **Text** — Inter (400/600): everything that needs to stay legible
  small — captions, bios, buttons, nav, hashtags. Sentence case, not
  all-caps, except short eyebrow labels.

## Logo

**v1 illustrated a whole amphora freehand — read as clip art. v2
replaced it with an invented Greek-key crest — better executed, but
still a new visual language that didn't exist anywhere on the actual
site.** Both missed something: `index.html` already has its own
considered decorative system — thin, single-weight, `currentColor`
line art (no fill), a **palmette** (anthemion) ornament that already
sits directly under "RASNA" in the live hero, volute corner
flourishes, and a two-tone meander already used as section dividers
throughout the page. v3 doesn't invent anything — it takes the exact
palmette path already in `index.html`'s `#palmette` symbol, frames it
in a thin ring so it can stand alone as a mark, and builds every
lockup around the hero's own real type treatment (uppercase, wide
letter-spacing, gold-on-deep).

Files in `assets/brand/`:

- `mark.svg` — the palmette in a thin ring, open line art, for light
  backgrounds
- `mark-reversed.svg` — same mark, gold-on-deep — matches the live
  hero's own palmette treatment exactly
- `favicon.svg` + `favicon-16/32/48/180/512.png` — the open linework
  softens below ~32px, so the favicon uses a **filled silhouette** of
  the same palmette instead (bordeaux fill, tufo shape); wired into
  every page's `<head>`
- `logo-horizontal.svg` / `logo-horizontal-reversed.svg` — mark left,
  "RASNA" + thin gold rule + "TUSCIA · ITALIA" right, in the hero's own
  letter-spacing
- `logo-stacked.svg` — a literal miniaturized version of the live
  hero's own composition (place-name line → divider → palmette →
  RASNA), dark background, for square placements (Instagram highlight
  covers, print)
- `instagram-profile.png` — 1080×1080 raster of the mark, ready to
  upload as the Instagram profile photo

**Minimum size:** 24px for the open-linework mark; below that, use the
filled favicon variant instead. 100px wide minimum for any lockup with
the wordmark. Never substitute a different ornament for the palmette,
and never fill the mark's linework solid outside the dedicated favicon
files.

## Do / don't

**Do:** lead every grid with bordeaux and military green; use
unfiltered, unstaged process photos (hands, tools, food) over posed
shots; keep the wordmark on a solid color band when it sits over a
photo.

**Don't:** introduce teal, lavender, or pastel lemon; add a second icon
or illustration next to the palmette; set body copy or captions in
Cormorant Garamond.

## What's live vs. what's pending

- ✅ Favicon (SVG + PNG fallbacks) wired into all site pages
- ✅ Nav logo on `index.html` now shows the mark next to the wordmark
- ⬜ Instagram profile photo — upload `assets/brand/instagram-profile.png`
  manually (Instagram requires uploading through the app/web UI; not
  something automatable from here)
- ⬜ Existing social posts/highlight covers — apply the palette
  discipline (two primaries dominant, vase tones as accents only) going
  forward per `INSTAGRAM_STRATEGY.md`
