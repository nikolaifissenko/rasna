# Working on this repo

Rasna is Nikolai's small-group travel-experience business (Blera/Tuscia,
Italy). See `BUSINESS_PLAN.md` for the business, `BOOKING_STATUS.md` for
the current state of the booking/payment infrastructure.

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

## Pull requests

Always open a pull request after pushing a branch with finished work —
don't wait to be asked each time. Push the branch, then create the PR
against `claude/magical-franklin-58SKM` (the deploy branch).

## Deployment topology

- **Static site** (`index.html`, `success.html`, `cancel.html`, etc. at
  repo root): GitHub Pages, auto-deploys from the
  `claude/magical-franklin-58SKM` branch. Custom domain
  `rasnaexperience.com` via `CNAME`.
- **Backend** (`worker/`): Cloudflare Worker + D1, auto-deploys on push
  to `claude/magical-franklin-58SKM` (Cloudflare's git integration,
  not something run manually from here).
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
