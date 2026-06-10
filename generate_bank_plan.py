#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem
)

DOC = "Rasna_Business_Plan_Bank.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontSize=26, leading=32, alignment=TA_CENTER, spaceAfter=6, fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="CoverSub", fontSize=13, leading=18, alignment=TA_CENTER, textColor=colors.HexColor("#555555")))
styles.add(ParagraphStyle(name="H1", fontSize=16, leading=20, spaceBefore=14, spaceAfter=8, fontName="Helvetica-Bold", textColor=colors.HexColor("#1F3D2B")))
styles.add(ParagraphStyle(name="H2", fontSize=12.5, leading=16, spaceBefore=10, spaceAfter=6, fontName="Helvetica-Bold", textColor=colors.HexColor("#3A5A40")))
styles.add(ParagraphStyle(name="Body", fontSize=10, leading=14.5, spaceAfter=6, alignment=4))
styles.add(ParagraphStyle(name="BulletItem", fontSize=10, leading=14.5, spaceAfter=3, leftIndent=12))
styles.add(ParagraphStyle(name="Small", fontSize=8.5, leading=12, textColor=colors.HexColor("#666666")))

def table(data, col_widths=None, header=True):
    wrapped = []
    for r, row in enumerate(data):
        new_row = []
        for cell in row:
            if isinstance(cell, str):
                style_name = "Small" if r == 0 and header else "Body"
                if r == 0 and header:
                    cell_style = ParagraphStyle("CellHeader", parent=styles["Body"], fontSize=9, leading=11.5, textColor=colors.white, fontName="Helvetica-Bold")
                else:
                    cell_style = ParagraphStyle("Cell", parent=styles["Body"], fontSize=9, leading=11.5, spaceAfter=0)
                new_row.append(Paragraph(cell, cell_style))
            else:
                new_row.append(cell)
        wrapped.append(new_row)
    data = wrapped
    t = Table(data, colWidths=col_widths, hAlign="LEFT")
    style = [
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3A5A40")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    t.setStyle(TableStyle(style))
    return t

def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(i, styles["BulletItem"]), leftIndent=12, bulletIndent=0) for i in items],
        bulletType="bullet", start="•",
    )

story = []

# -------------------- COVER --------------------
story.append(Spacer(1, 60*mm))
story.append(Paragraph("RASNA", styles["CoverTitle"]))
story.append(Paragraph("Authentic Small-Group Travel Experiences in Blera, Northern Lazio (Tuscia)", styles["CoverSub"]))
story.append(Spacer(1, 10*mm))
story.append(Paragraph("Business Plan & Financial Projections", styles["CoverSub"]))
story.append(Spacer(1, 30*mm))
story.append(Paragraph("Prepared for: Banking / Financing Partner Review", styles["Small"]))
story.append(Paragraph("Founders: Maria Grazia (local operations &amp; relationships) and Nikolai Fissenko (international markets, marketing &amp; logistics)", styles["Small"]))
story.append(Paragraph("Location: Blera, Province of Viterbo, Lazio, Italy", styles["Small"]))
story.append(PageBreak())

# -------------------- 1. EXECUTIVE SUMMARY --------------------
story.append(Paragraph("1. Executive Summary", styles["H1"]))
story.append(Paragraph(
    "Rasna offers small-group, multi-day immersive travel experiences in and around Blera, a small "
    "town in the Tuscia region of northern Lazio. Rather than a conventional sightseeing tour, guests "
    "participate directly in the real, seasonal life of the community: harvesting olives, helping make "
    "the year's tomato sauce, working alongside local artisans, and eating meals prepared in the "
    "tradition of local families &mdash; supported by guided excursions to nearby Etruscan sites, lakes, "
    "villas and towns (Lago di Vico, Villa Lante, Tarquinia, Viterbo).", styles["Body"]))
story.append(Paragraph(
    "The business is deliberately positioned at the premium end of the niche cultural-immersion travel "
    "market (&euro;1,300&ndash;&euro;1,800 per guest for a 4-day/3-night all-inclusive package, launching at "
    "&euro;1,400). It is asset-light: lodging is sourced through partner B&amp;Bs, activities are hosted by "
    "local families and artisans who are paid fairly for their time, and the founders act as curators, "
    "guides and operators.", styles["Body"]))
story.append(Paragraph(
    "Growth is intentionally capped at roughly 15&ndash;20 small groups per year once mature. This is a "
    "deliberate strategic choice, not a constraint: the product's core value &mdash; an unspoiled, "
    "authentic, low-volume experience &mdash; would be destroyed by mass tourism. Income growth beyond "
    "this point comes from premium pricing, higher-value add-ons and multi-region itineraries, not from "
    "increasing visitor volume to the town.", styles["Body"]))
story.append(Paragraph("Key figures at maturity (Year 3+, ~16 groups/year):", styles["Body"]))
story.append(table([
    ["Metric", "Value"],
    ["Average group size", "8 guests"],
    ["Price per guest", "€1,400 (range €1,300–€1,800)"],
    ["Cost per guest", "~€720"],
    ["Gross margin per guest", "~€680 (≈49%)"],
    ["Gross profit per group", "~€5,440"],
    ["Annual revenue (16 groups)", "~€179,200"],
    ["Annual gross profit (16 groups)", "~€87,000"],
    ["Estimated startup investment", "~€4,500–€11,500"],
    ["Estimated break-even", "~2 successful groups"],
], col_widths=[80*mm, 80*mm]))

# -------------------- 2. THE OPPORTUNITY --------------------
story.append(Paragraph("2. The Opportunity", styles["H1"]))
story.append(Paragraph("2.1 The product", styles["H2"]))
story.append(Paragraph(
    "A 4-day / 3-night, all-inclusive small-group package combining: one anchor seasonal/agricultural "
    "activity, one or more artisan experiences, guided cultural and nature excursions in the surrounding "
    "Tuscia region, lodging at partner B&amp;Bs, and meals prepared in the tradition of local families.",
    styles["Body"]))
story.append(Paragraph("2.2 Why Blera, why now", styles["H2"]))
story.append(bullets([
    "International demand for “authentic Italy” beyond Rome/Florence/Tuscany is well established and growing &mdash; comparable ultra-niche culinary/cultural immersion trips run €1,000–€2,500+ per person.",
    "Blera and the surrounding Tuscia region offer genuine, still-living agricultural traditions (olive harvest, tomato sauce day, hazelnut and artichoke harvests, asparagus foraging) and significant unexploited cultural assets (Etruscan rock-cut tombs, Via Clodia, Lago di Vico, Villa Lante, Tarquinia, Viterbo).",
    "The town already hosts a calendar of community festivals (Corpus Domini, summer sagre, the Cantine Festival in November) that provide ready-made, atmospheric moments to build departures around.",
    "No competing operator currently offers this kind of deeply local, small-group, all-inclusive experience centred on Blera.",
]))
story.append(Paragraph("2.3 Target customers", styles["H2"]))
story.append(bullets([
    "English-speaking travelers (US, UK, Australia, Canada) seeking authentic, off-the-beaten-path Italian experiences.",
    "Couples, friend groups, food-and-culture travelers; potential B2B channels include culinary schools, niche travel agencies and corporate retreats booking exclusive departures.",
    "Price-sensitive to value, not headline price &mdash; guests are paying for access, scarcity and story.",
]))
story.append(Paragraph("2.4 Differentiation &amp; defensibility", styles["H2"]))
story.append(bullets([
    "Most operators sell sights; Rasna sells belonging and participation &mdash; this is difficult to replicate without genuine, long-standing local relationships.",
    "Two-founder fit: Maria Grazia brings local relationships, access to families/farms/artisans and community credibility; the international co-founder brings marketing, logistics and English-speaking guest management.",
    "Asset-light model: no property ownership required at launch &mdash; lodging via partner B&amp;Bs, activities via paid local hosts and artisans.",
]))

# -------------------- 3. THE PRODUCT IN DETAIL --------------------
story.append(Paragraph("3. The Experience &mdash; Activities &amp; Calendar", styles["H1"]))
story.append(Paragraph(
    "The activity calendar has been built and validated through direct, ongoing conversations with local "
    "contacts in Blera (see Section 7, Local Network). It is treated as a menu of possibilities to validate "
    "one experience at a time, prioritizing reliability and authenticity over a fully pre-packaged "
    "12-month programme.", styles["Body"]))

story.append(Paragraph("3.1 Confirmed launch program", styles["H2"]))
story.append(table([
    ["Activity", "Status / notes"],
    ["Olive harvest (Oct–Dec)", "Reliable, real agricultural activity — one of the strongest seasonal anchors"],
    ["Tomato harvest / “sauce day” (Aug)", "Confirmed reliably available; strong low-risk anchor for an August departure"],
    ["Cured meats / affettati (Emiliano)", "Artisan demonstration with tasting; year-round availability to be confirmed directly with host"],
    ["Leatherwork / bag-making (Renzo)", "High availability; hands-on session where guests make and keep their own item — strong, marketable activity, potentially offered at little/no hosting cost as guests purchase his goods afterward"],
    ["Horseback riding (Maneggio Civitella Cesi)", "Candidate complementary excursion; availability and group handling to be assessed"],
], col_widths=[60*mm, 100*mm]))

story.append(Paragraph("3.2 Year-round calendar of candidate activities", styles["H2"]))
story.append(Paragraph(
    "The following seasonal activities represent the longer-term ambition for a full annual calendar, "
    "to be validated and added one at a time as hosts are confirmed:", styles["Body"]))
story.append(table([
    ["Period", "Activity"],
    ["March–June", "Wild asparagus foraging in the Tuscia woods; spring planting"],
    ["January–February", "Traditional pig butchering and curing (narrow window, host availability to be validated)"],
    ["July–August", "Tomato harvest and “sauce day” (passata) — confirmed"],
    ["Late August–September", "Hazelnut harvest — the Tuscia produces ~40% of Italy's national output"],
    ["September–October", "Vendemmia (grape harvest) — framed as “a day of harvest”; cellar visits via the Cantine Festival"],
    ["October–December", "Olive harvest and oil pressing — confirmed, reliable anchor"],
    ["December", "Italian Christmas traditions — food, customs and family rituals"],
    ["January–May", "Artichoke harvest (Carciofo Romanesco IGP) and seasonal cooking"],
], col_widths=[42*mm, 118*mm]))

story.append(Paragraph("3.3 Cooking experiences", styles["H2"]))
story.append(Paragraph(
    "Meals are framed as “cooking in the tradition of the nonne” — a field lunch or panonto prepared in "
    "the traditional style by a local host &mdash; rather than promising a specific individual. This keeps the "
    "experience authentic while being sustainable and not dependent on any one person's long-term "
    "availability. Compliance: as soon as cooking for paying guests becomes part of a recurring commercial "
    "package, Italian food-safety/home-restaurant rules apply. The plan is either to keep this activity "
    "structured as an occasional “meal with a local family” within the relevant agriturismo/cesarine-style "
    "framework, or to channel it through an already-licensed venue/partner kitchen — to be finalized with "
    "a local commercialista before scaling.", styles["Body"]))

story.append(Paragraph("3.4 Local festivals as built-in marketing moments", styles["H2"]))
story.append(bullets([
    "June — Corpus Domini celebrations",
    "Summer (most weekends) — local sagre (food and folk festivals)",
    "Second weekend of November — the Cantine Festival, when local wine cellars open to the public",
]))
story.append(Paragraph(
    "These events require no additional management — they are existing community moments that make "
    "certain departure dates especially compelling and easy to market.", styles["Body"]))

# -------------------- 4. BUSINESS MODEL --------------------
story.append(Paragraph("4. Business Model", styles["H1"]))
story.append(bullets([
    "Sell fixed-departure or on-demand small-group packages of 6–10 guests (target average 8) over 4 days / 3 nights.",
    "Package includes: lodging via partner B&amp;Bs, all meals, local guiding/transport, and all activity/artisan fees — priced as a single all-inclusive fee so guests have no logistics to manage.",
    "Revenue comes from the per-guest package price; costs are largely variable (lodging, hosting fees, transport, activities, insurance), keeping the model asset-light and scalable without major fixed-cost investment.",
    "Optional upsell: multi-region itineraries combining Blera with Rome, Lago di Vico, Villa Lante, Tarquinia or the coast.",
]))

# -------------------- 5. FINANCIAL PLAN --------------------
story.append(PageBreak())
story.append(Paragraph("5. Financial Plan", styles["H1"]))

story.append(Paragraph("5.1 Pricing", styles["H2"]))
story.append(Paragraph(
    "Recommended launch price: <b>€1,400 per guest, all-inclusive</b> (4 days / 3 nights), within a "
    "target range of €1,300–€1,800 reflecting comparable ultra-niche Italian culinary/cultural "
    "immersion products. Pricing is positioned at the premium end deliberately: the product is "
    "“one of very few groups admitted this year,” not a budget tour.", styles["Body"]))

story.append(Paragraph("5.2 Per-guest cost structure", styles["H2"]))
story.append(table([
    ["Cost item", "Estimate (€)"],
    ["Lodging (3 nights, partner B&amp;B rate)", "170"],
    ["Meals &amp; local hosting fees (fair pay for hosts)", "220"],
    ["Local guiding/transport (incl. day trips)", "140"],
    ["Activity fees (olive picking, artisan sessions, equipment)", "90"],
    ["Guest activity insurance (hands-on activities)", "40"],
    ["Marketing &amp; booking overhead (allocated)", "60"],
    ["Total cost per guest", "~720"],
], col_widths=[120*mm, 40*mm]))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "<b>Gross margin per guest: ~€680 (≈49%)</b>. Hosting fees and insurance are built into the cost "
    "model from the outset based on direct local feedback — this is treated as real, paid work, not a "
    "favor economy, and insurance for manual/hands-on activities (harvesting, leatherwork, etc.) is "
    "considered a non-negotiable cost.", styles["Body"]))

story.append(Paragraph("5.3 Local transport rates (quoted, Maria Grazia)", styles["H2"]))
story.append(table([
    ["Service", "Rate"],
    ["Transfer Fiumicino ↔ Blera, 7-pax Mercedes minivan", "€220.00 + IVA 10%"],
    ["Guided tour Blera/Tarquinia", "€50.00/hour + IVA 10% (100 km included)"],
], col_widths=[110*mm, 50*mm]))
story.append(Paragraph(
    "These quotes are used to refine the local guiding/transport line above and to price an optional "
    "Fiumicino airport transfer add-on.", styles["Body"]))

story.append(Paragraph("5.4 Group economics", styles["H2"]))
story.append(Paragraph("Assuming an average group size of 8 guests:", styles["Body"]))
story.append(table([
    ["Item", "Value"],
    ["Revenue per group (8 × €1,400)", "€11,200"],
    ["Cost per group (8 × €720)", "€5,760"],
    ["Gross profit per group", "~€5,440"],
], col_widths=[100*mm, 60*mm]))

story.append(Paragraph("5.5 Revenue projections (deliberately capped growth)", styles["H2"]))
story.append(table([
    ["Year", "Groups/year", "Revenue", "Gross profit", "Notes"],
    ["Year 1 — Pilot &amp; launch", "4", "~€44,800", "~€21,800", "1 pilot (discounted/break-even) + 3–4 paying groups"],
    ["Year 2 — Established calendar", "8", "~€89,600", "~€43,500", "4–5 experiences across the seasonal calendar, ~1 group every 4–6 weeks"],
    ["Year 3+ — Mature steady state", "16", "~€179,200", "~€87,000", "Deliberate ceiling of ~15–20 groups/year, chosen to protect the destination"],
], col_widths=[50*mm, 20*mm, 26*mm, 26*mm, 48*mm]))
story.append(Paragraph(
    "These figures are directional planning estimates. They intentionally plateau rather than grow "
    "indefinitely — beyond Year 3, growth is expected to come from the levers described in Section 5.8, "
    "not from increasing the number of groups.", styles["Small"]))

story.append(Paragraph("5.6 Startup investment required", styles["H2"]))
story.append(table([
    ["Item", "Estimated cost (€)"],
    ["Legal setup (Italian business entity + commercialista)", "1,500–3,000"],
    ["Licensing &amp; insurance (tourism, food handling)", "500–1,500"],
    ["Website &amp; branding", "500–2,000"],
    ["Pilot trip costs (discounted/break-even run)", "1,000–2,000"],
    ["Group transport (van purchase/lease, or hired locally)", "0–15,000"],
    ["Marketing launch (photos, video, ads)", "1,000–3,000"],
    ["Total estimated startup investment", "~4,500–11,500"],
], col_widths=[120*mm, 40*mm]))
story.append(Paragraph(
    "Transport is initially planned as a per-group variable cost (hired locally) rather than a fixed "
    "asset, given the deliberately limited number of trips per year (~15–20). Vehicle purchase will be "
    "revisited in Year 2–3 once real per-group transport costs are established.", styles["Body"]))

story.append(Paragraph("5.7 Break-even", styles["H2"]))
story.append(Paragraph(
    "At ~€5,440 gross profit per group, a ~€10,000 startup investment is recovered after "
    "approximately <b>2 successful groups</b> &mdash; realistically achievable within Year 1.", styles["Body"]))

story.append(Paragraph("5.8 Revenue growth levers beyond the capacity ceiling", styles["H2"]))
story.append(bullets([
    "Premium pricing over time: raise price from €1,400 toward €1,800+ as reputation and demand build.",
    "Premium add-ons: private/extended stays, exclusive harvest- or Christmas-only departures with smaller groups and higher prices.",
    "Multi-region itineraries: combine Blera with Rome, Lago di Vico, Villa Lante, Tarquinia or the coast for longer, higher-value packages.",
    "Pure-margin extras with zero additional footfall: virtual experiences (online cooking sessions) and merchandise (olive oil, wine, hazelnuts, sauces from partner families) sold to past guests.",
    "B2B / high-value bookings: culinary schools, travel agencies or corporate retreats booking an entire exclusive departure at a premium rate.",
    "Brand equity: a strong reputation allows the founders to be selective about guests and partners, reinforcing both quality and price power.",
]))

# -------------------- 6. ROADMAP --------------------
story.append(PageBreak())
story.append(Paragraph("6. Implementation Roadmap", styles["H1"]))
story.append(table([
    ["Phase", "Timeline", "Key activities"],
    ["0 — Partnership alignment", "Immediate", "Define roles, decision-making and profit/cost split between founders in writing"],
    ["1 — Validate &amp; design the offer", "1–2 months", "Confirm hosts and pricing for each candidate activity; design a detailed pilot itinerary; obtain insurance quotes; set pilot pricing"],
    ["2 — Run a pilot group", "2–4 months", "Run a small real/discounted group; document everything (photos, video, testimonials); debrief and refine"],
    ["3 — Build presence &amp; first paying customers", "Parallel with Phase 2", "Launch website/landing page, booking process, and 1–2 marketing channels; convert pilot momentum into 1–3 paying groups"],
    ["4 — Formalize the business", "Once bookings exist", "Choose Italian legal structure (e.g. SRL) with a local commercialista; finalize licensing/insurance; formalize partner agreements"],
    ["5 — Build out the seasonal calendar", "6–12 months", "Add second/third seasonal experiences; build operational checklists; develop a bench of trained local hosts"],
    ["6 — Mature at a deliberate ceiling", "12+ months", "Settle into ~15–20 groups/year; grow income via pricing and add-ons rather than volume; prioritize fit over scale"],
], col_widths=[48*mm, 24*mm, 98*mm]))

# -------------------- 7. LOCAL NETWORK --------------------
story.append(Paragraph("7. Local Network &amp; Partnerships", styles["H1"]))
story.append(Paragraph(
    "A core strength of Rasna is that it is built from real, existing relationships in Blera rather than "
    "designed first and staffed later. Key contacts identified and engaged to date:", styles["Body"]))
story.append(table([
    ["Contact", "Role in the project"],
    ["Maria Grazia", "Co-founder — local relationships, operations, community credibility"],
    ["Cristina Damiani", "Operational coordination (role to be finalized)"],
    ["Emiliano (Miriam's son)", "Cured meats / affettati artisan experience"],
    ["Renzo", "Leatherwork / bag-making artisan experience"],
    ["Maneggio Civitella Cesi", "Horseback riding excursion (candidate)"],
    ["Local B&amp;Bs (Beccone, Antonella, others)", "Lodging partners"],
    ["La Torretta, Bar Etruria", "Possible food/beverage and gathering-place partners"],
], col_widths=[60*mm, 100*mm]))

# -------------------- 8. RISKS --------------------
story.append(Paragraph("8. Key Risks &amp; Mitigations", styles["H1"]))
story.append(table([
    ["Risk", "Mitigation"],
    ["Some traditional activities (vendemmia, hand-harvesting wheat, pig butchering) are no longer practiced at scale", "Calendar treated as a menu to validate one activity at a time; only confirmed, available activities are launched on"],
    ["Dependence on a single host for any given experience (e.g., a cheesemaker, an elderly cook)", "Frame experiences generically (“in the tradition of the nonne”) and build a bench of alternative hosts before scaling"],
    ["Regulatory/food-safety requirements for paid home cooking experiences", "Resolve with a local commercialista in Phase 4, via either a registered home-restaurant framework or a licensed partner kitchen"],
    ["Guest injury during hands-on activities", "Dedicated guest activity insurance is built into the per-guest cost from the outset"],
    ["Demand risk / unproven willingness to pay at target price", "Pilot group (Phase 2) validates pricing and demand before committing to marketing spend or formal structure"],
    ["Over-growth eroding the authenticity that drives demand", "Hard cap of ~15–20 groups/year is a deliberate strategic choice, with growth levers focused on price and value rather than volume"],
], col_widths=[80*mm, 80*mm]))

# -------------------- 9. THE ASK --------------------
story.append(Paragraph("9. Financing Request", styles["H1"]))
story.append(Paragraph(
    "Rasna is seeking financing in the range of <b>€4,500–€11,500</b> to cover legal setup, "
    "licensing and insurance, website and branding, a pilot trip, and initial marketing. Given the "
    "low fixed-cost, asset-light structure and an estimated break-even after approximately two "
    "successful group departures, the financing requirement is modest relative to the projected "
    "gross profit at maturity (~€87,000/year at a deliberately capped scale of ~16 groups/year).",
    styles["Body"]))
story.append(Paragraph(
    "The founders welcome the opportunity to discuss this plan further and to provide updated, "
    "validated figures following the Phase 1–2 pilot.", styles["Body"]))

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#888888"))
    canvas.drawCentredString(A4[0]/2, 10*mm, str(canvas.getPageNumber()))
    canvas.restoreState()

doc = SimpleDocTemplate(DOC, pagesize=A4,
                         topMargin=20*mm, bottomMargin=18*mm,
                         leftMargin=20*mm, rightMargin=20*mm,
                         title="Rasna Business Plan", author="Rasna")
doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
print("done")
