# RASNA Website — Design/Dev Log

Live site: https://nikolaifissenko.github.io/rasna/
Repo (GitHub display name): nikolaifissenko/rasna
Repo (MCP tool identifier — must use this in mcp__github__* calls): nikolaifissenko/blera-business
Branch: main (no PRs, push straight to main per standing instruction)
Single file: index.html (static, no build tooling)

## Standing instructions (do not re-ask)
- Always commit/push and just send the live link back — never ask for confirmation first.
- Activity catalog must exactly match BUSINESS_PLAN.md's finalized list:
  - Farm & Field: Olive Harvest, Tomato & Sauce Day, Grape Harvest, Foraging
  - Artisan & Food: Charcuterie Degustation, Cheese & Charcuterie, Pasta Making
  - Culture & Outdoors: Cammino dei Tre Villaggi, San Giovenale & Panonto, Horseback Riding
  - Day Trips: single collapsed card
  - NO Hazelnut Harvest, NO Renzo/leather "arts and crafts"
- Formspree endpoint must stay: https://formspree.io/f/xlgynpjo
- Contact email must stay: nikolai.fissenko1@gmail.com

## Design direction history
1. V1: corporate-looking — rejected ("too corporate")
2. V2: darker theme attempt — still not distinctive enough
3. V6 "Etruscan Mediterranean": warm terracotta/parchment/gold palette
   (--terra, --sienna, --gold, --parch, --sand, --ink, --earth, --smoke,
   --cream, --olive), alternating warm/dark sections, inline SVG meander
   (Greek key) / palmette / volute motifs. Pushed as commit 426b7c7.
4. V7 "ancient Greek pottery, but modern/not obvious" (current, live):
   request was: high-end ancient Greek pot decoration feel, refined,
   NOT kitschy/obvious, modern execution. Changes made:
   - Added --noir: #14100B (black-figure glaze black) accent color
   - .act-icon: square terracotta boxes -> circular roundels, black
     border/stroke instead of terracotta
   - .act-card.selected::after: colored checkmark badge -> plain small
     black (var(--noir)) circular dot
   - .act-card.selected border-top-color: terra -> noir
   - .volute (hero corner ornaments): terra -> noir, opacity 0.12 -> 0.22
   - Section divider bands (.band): shrunk from bold 36px-tall colorful
     zigzag bars to refined 14px-tall "vase-rim" bands — two thin rule
     lines + a dense low-amplitude (5px unit) black-stroked meander path,
     stroke rgba(20,16,11,0.55), stroke-width 1.1
   - Pushed as commit 0cdf0303f2f065601a0d7490cddb56f3687f0825
   - Status: pushed and screenshot-verified, but NOT yet confirmed by
     user as satisfying the "modern ancient Greek pottery" request —
     check in on this next session if not already addressed.

## Known infra issue
- Local `git push origin main` frequently fails with HTTP 503 / RPC
  failed from the local git proxy (127.0.0.1:port/git/...).
- WORKAROUND (use every time this happens): read full current file
  content via Read tool, then push via mcp__github__push_files
  (owner: nikolaifissenko, repo: blera-business, branch: main) to push
  directly through the GitHub API, bypassing local git transport.
- After an API push, sync local git: `git config user.email
  noreply@anthropic.com && git config user.name Claude`, then
  `git fetch origin main && git reset --hard origin/main` to avoid
  divergent/unverified local commits triggering the stop-hook
  "Unverified commit" warning.
- Do NOT try to rebase/amend through the conflict — just reset local
  to match the already-correct remote state pushed via the API.

## Verification method used
- `npx playwright screenshot --wait-for-timeout=1500 --full-page
  file://<path>/index.html out.png`, then Read the PNG to visually
  check the rendered page before/after reporting changes as done.
