# SEO Brief — for the next session working on rasnaexperience.com

_Written 2026-08-03. **This supersedes an earlier version of this same
file that got pushed to `claude/magical-franklin-58SKM` — ignore that
one, it was written against a stale, dead branch and its findings
(no images, no og:image) are wrong for the actual live site. See
`CLAUDE.md`'s top-of-file branch-drift warning: `main` is the only
branch GitHub Pages serves, confirmed multiple times, most recently by
diffing `origin/main`'s `index.html` byte-for-byte against a live
`curl` of rasnaexperience.com._**

## Already done — don't redo

- 57 images in `images/`, real photography (not placeholders), wired via
  CSS `background-image` (see `CLAUDE.md` "Photos" section for the full
  map of what's used where).
- `og:image`/Twitter Card tags on `index.html` and `about.html`.
- `robots.txt` + `sitemap.xml` (indexes `index.html` + `about.html`,
  `success.html`/`cancel.html` correctly excluded).
- JSON-LD: `TravelAgency` + `Offer` on `index.html`, `FAQPage` (6 Q&As,
  visible section too, not just markup), `AboutPage`/`Person` on
  `about.html`.
- Title/meta lead with "Italian Olive Experience" (primary target) plus
  "Authentic Italy Experiences" / "custom small-group Italy experience"
  (added 2026-07-24 per Nikolai's request to also rank for that literal
  phrase).

## What's actually still open

1. **Google Search Console verification — the explicit next goal per
   `CLAUDE.md`/`BOOKING_STATUS.md`, still not done.** Blocked on Nikolai,
   not code: he needs to add `https://rasnaexperience.com/` as a property
   at search.google.com/search-console, choose HTML-tag verification, and
   hand over just the one `<meta name="google-site-verification" ...>`
   line. Don't ask for his Google login or try to drive a browser through
   it yourself — already tried and confirmed the sandbox's proxy breaks
   Google's login TLS handshake. Once he pastes the tag: add it to both
   `index.html` and `about.html`, push to `main`, then he clicks Verify
   and submits the sitemap URL himself (both need his logged-in session).
2. **Image licensing risk — flagged repeatedly in `CLAUDE.md`, not
   resolved.** Most of the 57 images are scraped from third-party sources
   (blogs, tourism boards, TripAdvisor, Instagram, a commercial competitor)
   at Nikolai's explicit direction, accepting the risk at the time. This
   is a live public site now, not a draft — worth raising again rather
   than silently continuing to add more scraped images. Two images
   (`moment-2.jpg`, `moment-3.jpg`) plus `card-etruscantombs.jpg` are
   already his own real photos — the plan noted in `CLAUDE.md` is to
   replace scraped images with owned ones over time as more become
   available; worth checking if he has new photos to swap in.
3. **No Google Business Profile yet** — same category as GSC, needs
   Nikolai to create it, not code-fixable.
4. Not yet checked this session: Core Web Vitals/PageSpeed score now that
   the site has 57 real images (unlike the near-empty page the previous,
   wrong version of this brief assumed) — worth an actual PageSpeed
   Insights run to check for unoptimized image sizes/lazy-loading, since
   that's a real regression risk with a photo-heavy page this size.

## Reminder

Nikolai isn't technical — handle deploys yourself (`git push origin main`
directly, no PR needed for routine edits, per `CLAUDE.md`'s standing
instruction to push and go live immediately). Only ask him for the
specific credential/snippet you can't self-serve (the GSC verification
tag), nothing more.
