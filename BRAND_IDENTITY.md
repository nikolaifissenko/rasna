# Rasna Brand Identity (v1, August 2026)

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

The mark is an amphora — the actual vessel shape behind everything
Rasna sells: olive oil, wine, tomato sauce. Not a generic Greek/Roman
reference.

Files in `assets/brand/`:

- `mark.svg` — icon only, full color, for light backgrounds
- `favicon.svg` + `favicon-16/32/48/180/512.png` — simplified, bolder
  silhouette for small sizes; wired into every page's `<head>`
- `logo-horizontal.svg` — mark + wordmark, light backgrounds (site
  header, print)
- `logo-horizontal-reversed.svg` — same lockup, dark/photo backgrounds
  (Stories, video covers)
- `logo-stacked.svg` — mark over wordmark, square format (Instagram
  highlight covers, print)
- `instagram-profile.png` — 1080×1080 raster of the mark, ready to
  upload as the Instagram profile photo

**Minimum size:** 32px for the mark alone, 120px wide for any lockup
with the wordmark. Clear space = the height of the amphora's neck
band. Never stretch, rotate, recolor, or drop-shadow the vase
silhouette.

## Do / don't

**Do:** lead every grid with bordeaux and military green; use
unfiltered, unstaged process photos (hands, tools, food) over posed
shots; keep the wordmark on a solid color band when it sits over a
photo.

**Don't:** introduce teal, lavender, or pastel lemon; stretch or
rotate the amphora mark; set body copy or captions in Cormorant
Garamond.

## What's live vs. what's pending

- ✅ Favicon (SVG + PNG fallbacks) wired into all site pages
- ✅ Nav logo on `index.html` now shows the mark next to the wordmark
- ⬜ Instagram profile photo — upload `assets/brand/instagram-profile.png`
  manually (Instagram requires uploading through the app/web UI; not
  something automatable from here)
- ⬜ Existing social posts/highlight covers — apply the palette
  discipline (two primaries dominant, vase tones as accents only) going
  forward per `INSTAGRAM_STRATEGY.md`
