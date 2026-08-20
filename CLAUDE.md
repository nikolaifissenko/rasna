# Working on this repo

Rasna is Nikolai's small-group travel-experience business (Blera/Tuscia,
Italy). See `BUSINESS_PLAN.md` for the business, `BOOKING_STATUS.md` for
the current state of the booking/payment infrastructure, and
`INSTAGRAM_STRATEGY.md` for the content system (caption voice/structure,
hashtag rules, the "No Tourists Italy" reel series, and the reusable
cover-image aesthetic/prompt template) — check it before drafting any
caption or cover from scratch.

## Operating principle: handle infra yourself

Nikolai is not technical and does not want to run CLI commands, create
Cloudflare tokens with the right scopes, or otherwise operate deployment
tooling himself. **Default to doing these things directly rather than
handing him a list of commands to run.** When something requires a
credential you don't have (a Cloudflare API token, an account ID, etc.),
ask him for the minimum needed piece of information or ask him to paste
a scoped token — then take it from there yourself. Don't reply with
"here's what you need to run."

The one thing that's fair to ask him to do is generate credentials
Claude can't self-serve (going into the Cloudflare dashboard to create
an API token or find an account ID) — but even then, be specific about
exactly what scope/permission you need so it's a single copy-paste for
him, not a debugging back-and-forth.

## ⚠️ Deployment topology — this file's old claim below was WRONG, corrected 2026-08-20

**If you're a fresh session reading this because it's this repo's
(misconfigured) default branch: the static site does NOT deploy from
`claude/magical-franklin-58SKM`.** It deploys from **`main`** — a
completely separate commit history, with its own `CLAUDE.md`,
`index.html`, `about.html`, `style.css`, `images/`, and a family of
`italian-olive-experience-*.html` pages. `main`'s own `CLAUDE.md`
documents this exact mistake happening **eight times before** this one.
A 2026-08-20 session repeated it a ninth time (see `main`'s `CLAUDE.md`
for the dated incident log) — wasted a full dash-removal pass and part
of a price-change pass on this dead branch before catching it via a
`curl` diff against the live site. **Before touching any static-site
file (`index.html`, guide pages, `success.html`, etc.), check out
`origin/main` and work there instead — don't trust this file's claims
about the static site.**

The repo's **GitHub default branch is itself misconfigured** to this
branch instead of `main` — that's the root cause of every fresh
session inheriting this wrong file. Nikolai can fix it in one click:
repo Settings → Branches → change default branch to `main`. Ask him
about this if it still hasn't been fixed.

What's actually still true below: this branch (`claude/magical-franklin-58SKM`)
**is** the correct deploy source for the Cloudflare Worker in `worker/`.
Only the static-site claim was wrong.

- **Static site** (`index.html`, `success.html`, `cancel.html`, etc.):
  GitHub Pages, auto-deploys from **`main`**, NOT this branch. Custom
  domain `rasnaexperience.com` via `CNAME`.
- **Backend** (`worker/`): Cloudflare Worker + D1, auto-deploys on push
  to `claude/magical-franklin-58SKM` (this branch — correct, Cloudflare's
  git integration, not something run manually from here).
- **Database migrations** (`worker/migrations/`): NOT auto-applied on
  deploy. Must be run explicitly against the remote D1 database with
  `wrangler d1 migrations apply rasna-bookings --remote` from `worker/`.
  This requires `CLOUDFLARE_API_TOKEN` (and usually `CLOUDFLARE_ACCOUNT_ID`,
  since narrowly-scoped D1 tokens typically can't auto-resolve the
  account) to be set in the environment running the command.

So: **when a schema change ships, remember the remote migration is a
separate manual step from the code push** — don't consider the feature
"live" until both have happened. Check `BOOKING_STATUS.md` for whether
a migration is currently pending.

## Credentials

Never write a live API token, secret key, or password into a file in
this repo, even temporarily. If Nikolai pastes one in chat, use it
directly from the shell environment for the one command that needs it
and don't persist it anywhere in the repo or in committed docs.
