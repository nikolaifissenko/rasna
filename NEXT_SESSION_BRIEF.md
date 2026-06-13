# Brief for next session

## Status
- **Stripe:** account created (individual). Still need to create a Payment Link for the deposit and paste it into `proposal/index.html` (`STRIPE_PAYMENT_LINK` constant near the bottom of the file).
- **Proposal page:** `proposal/index.html` is a working single-page client proposal — Rasna branding, intro text, activity-selection cards (olive harvest, tomato/sauce day, Renzo's leatherwork, Emiliano's affettati, horseback riding, Etruscan tombs walk), and a "Reserve with a deposit" button.
- **Brand identity (Rasna):** settled direction is wine-red (#5e2b2b) + bronze (#b08d57) on cream (#f5ede0), bold archaic/angular typeface for "RASNA", circular badge logo with Etruscan spiral-ring border and a rampant pegasus. Best logo result so far (rampant pegasus) still has imperfect front-leg silhouette and a small gap in the outer ring — needs one more refinement pass, or try a galloping/standing pose instead of rearing. No final logo file has been saved into the repo yet.
- Tomb-facade icon (alternative/simpler mark) was prototyped as inline SVG in `proposal/index.html` header — currently still in use as placeholder until the pegasus badge is finalized.

## Next steps
1. Get a final logo export (transparent PNG/SVG) and add it to `proposal/assets/logo.*`; update `proposal/index.html` header to use it.
2. Create the Stripe Payment Link and wire it into the page.
3. Deploy `proposal/` (Vercel/Netlify) to get a shareable URL to send to clients.
4. Continue validating activities per `BUSINESS_PLAN.md` Phase 1 (confirm hosts, pricing, insurance).
