# Rasna Brand Identity (v1, August 2026)

Visual style guide: see the published brand identity artifact (palette,
logo usage, typography, Instagram grid mockup) — link shared in chat.
This doc is the reference copy for anyone editing the site or social
assets later.

## Where the palette comes from

Blera's rock-cut Etruscan tombs — the ones every Rasna departure
actually visits — turned up black-figure and bucchero pottery: matte
black, fired clay red-orange, a pale reserved ground. That's the base
of this system. Bordeaux comes from the wine poured at the table with
local families; military green from the olive groves in October —
deliberately not the lavender/pastel-lemon palette most "authentic
Tuscany" accounts already use. The site's existing Etruscan color
scheme (olive/bordeaux/earth, Cormorant Garamond) already had these
bones — this system sharpens and documents it, it doesn't replace it.

## Colors

| Role | Name | Hex |
|---|---|---|
| Primary | Bordeaux | `#5E1F30` |
| Primary | Military Green | `#4B5632` |
| Accent (vase) | Fired Clay / Terracotta | `#B1552A` |
| Accent (vase) | Buff Slip | `#E8D8B0` |
| Accent (vase) | Vase Black (ink) | `#1C140E` |
| Accent (vase) | Antique Gold (hairlines only) | `#A8894A` |
| Neutral | Parchment (ground) | `#F2EBDD` |
| Neutral | Stone (captions) | `#7C7A5C` |

Two primaries (bordeaux + military green) should dominate every post or
page. The vase tones are accents — terracotta and gold especially
should never fill a large background, only icons, dividers, and small
details. This maps closely onto the CSS variables already in
`index.html` (`--terracotta`, `--olive`, `--gold`, `--tufo`, `--cream`,
`--deep`) — no site rebuild needed, just tighter usage discipline going
forward.

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
