# SEO Brief — for the next session working on rasnaexperience.com

_Written 2026-08-03, updated same day (second session). **This supersedes
an earlier version of this same file that got pushed to
`claude/magical-franklin-58SKM` — ignore that one, it was written against
a stale, dead branch and its findings (no images, no og:image) are wrong
for the actual live site. See `CLAUDE.md`'s top-of-file branch-drift
warning: `main` is the only branch GitHub Pages serves, confirmed multiple
times, most recently by diffing `origin/main`'s `index.html` byte-for-byte
against a live `curl` of rasnaexperience.com._**

**2026-08-03, second session note:** the branch-drift trap this file
already warns about happened *again*, same day — a session was pointed at
`claude/magical-franklin-58SKM` by its designated-branch instructions,
built a full SEO/marketing pass there (og:image, LocalBusiness schema,
3 content pages), pushed, and only then discovered via `git log main`
that none of it was live. Rebuilt everything directly against `main`
using real facts/photos and pushed there instead. Confirmed live via the
`pages build and deployment` GitHub Actions run (not just curl). If you're
reading this: the pattern keeps repeating because a session's *assigned*
branch and the repo's *actual deploy* branch are two different things —
check `git log main` before writing a single line of `index.html`.

## Already done — don't redo

- 57+ images in `images/`, real photography (not placeholders), wired via
  CSS `background-image` (see `CLAUDE.md` "Photos" section for the full
  map of what's used where).
- `og:image`/Twitter Card tags on `index.html` and `about.html`.
- `robots.txt` + `sitemap.xml` (indexes `index.html`, `about.html`, and
  as of 2026-08-03 three new guide pages, see below; `success.html`/
  `cancel.html` correctly excluded).
- JSON-LD: `TravelAgency` + `Offer` on `index.html` (as of 2026-08-03 also
  has `GeoCoordinates` for Blera: lat 42.2769, long 11.9522), `FAQPage`
  (6 Q&As, visible section too, not just markup), `AboutPage`/`Person` on
  `about.html`.
- Title/meta lead with "Italian Olive Experience" (primary target) plus
  "Authentic Italy Experiences" / "custom small-group Italy experience"
  (added 2026-07-24 per Nikolai's request to also rank for that literal
  phrase).
- **New 2026-08-03: three long-tail content pages**, cross-linked from
  each other and the homepage footer, in `sitemap.xml`, using real site
  photography and correct current facts (8-guest cap, not the old 6–10
  figure from the dead branch's stale version; the November Italian Olive
  Experience's actual €1,450 pricing, not a generic flat rate):
  `tuscia-travel-guide.html`, `etruscan-tombs-guide.html`,
  `small-group-italy-tours.html`. Each has `Article` + `BreadcrumbList`
  JSON-LD.
- **Google Business Profile: submitted and accepted by Google as of
  2026-08-03** (Nikolai confirmed "google accepted my request to be
  listed as a business"). `GOOGLE_BUSINESS_PROFILE.md` has the copy-paste
  details used and next steps (photos, posts, reviews) — not yet
  confirmed whether photos have been uploaded to the listing itself.
- `INSTAGRAM_STRATEGY.md` added 2026-08-03: content pillars, posting
  cadence, sample captions, hashtag strategy. Nikolai said he'd open the
  Instagram Business account "tomorrow" (i.e. the day after 2026-08-03) —
  check in on this next session rather than assuming it's done.

## What's actually still open

1. **Google Search Console verification — still the explicit next goal
   per `CLAUDE.md`/`BOOKING_STATUS.md`, still not done.** Blocked on
   Nikolai, not code: he needs to add `https://rasnaexperience.com/` as a
   property at search.google.com/search-console, choose HTML-tag
   verification, and hand over just the one
   `<meta name="google-site-verification" ...>` line. Don't ask for his
   Google login or try to drive a browser through it yourself — already
   tried and confirmed the sandbox's proxy breaks Google's login TLS
   handshake. Once he pastes the tag: add it to `index.html`, `about.html`,
   and the three new guide pages, push to `main`, then he clicks Verify
   and submits the sitemap URL himself (both need his logged-in session).
2. **Image licensing risk — flagged repeatedly in `CLAUDE.md`, not
   resolved.** Most of the 57+ images are scraped from third-party
   sources (blogs, tourism boards, TripAdvisor, Instagram, a commercial
   competitor) at Nikolai's explicit direction, accepting the risk at the
   time. This is a live public site now, not a draft — worth raising
   again rather than silently continuing to add more scraped images.
   `moment-2.jpg`, `moment-3.jpg`, `card-etruscantombs.jpg`,
   `about-nikolai-portrait.jpg`, and `about-nikolai-bar.jpg` are the only
   ones confirmed/likely his own; all ~28 `card-*` activity photos were
   sent to him in chat 2026-08-03 with this same caveat repeated, in case
   he wants any on the new Google Business Profile — his call, not
   resolved either way.
3. ~~No Google Business Profile yet~~ — **done 2026-08-03**, see above.
   Follow-up open: whether photos got uploaded to the listing itself.
4. **Instagram Business account** — strategy doc ready
   (`INSTAGRAM_STRATEGY.md`), Nikolai said he'd set it up "tomorrow."
   Check next session whether it happened; if not, it's a 5-minute
   account creation on his end, not something to nudge repeatedly.
5. Not yet checked: Core Web Vitals/PageSpeed score now that the site has
   57+ real images — worth an actual PageSpeed Insights run to check for
   unoptimized image sizes/lazy-loading, since that's a real regression
   risk with a photo-heavy page this size.
6. Google Ads: Nikolai was offered a "spend €400, get €400 ad credit"
   new-advertiser match offer and decided not to pursue it for now
   (declined after learning it requires real spend up front, not free
   credit). Not an open action item, just noted in case it resurfaces.

## Reminder

Nikolai isn't technical — handle deploys yourself (`git push origin main`
directly, no PR needed for routine edits, per `CLAUDE.md`'s standing
instruction to push and go live immediately). Only ask him for the
specific credential/snippet you can't self-serve (the GSC verification
tag), nothing more.
