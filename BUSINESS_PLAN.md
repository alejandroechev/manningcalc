# manningcalc — Business Plan

## Executive Summary

manningcalc is a free, browser-based open channel flow calculator targeting civil/hydraulic engineers who currently pay ~$2,000/yr for Bentley FlowMaster or struggle with HEC-RAS complexity. The MVP delivers instant Manning's equation solving across 4 cross-section shapes with Froude classification and solve-for-any-variable flexibility — capabilities that satisfy 80% of routine channel design tasks. Phased premium tiers ($99–$349/yr) add gradually varying flow profiles, irregular sections, multi-reach modeling, and bridge/culvert backwater analysis, capturing the 65% of users willing to pay for major feature upgrades.

## Market Analysis

### Target Users
- **Civil engineers** designing drainage channels, ditches, and conveyance systems
- **Municipal stormwater engineers** sizing channels for runoff conveyance
- **Land development consultants** performing hydraulic calculations for permits
- **Academic users** learning open channel hydraulics (Manning's equation, Froude number)
- **DOT/transportation engineers** analyzing roadside ditches and culvert approaches

### Competitive Landscape

| Product | Price | Strengths | Weaknesses |
|---------|-------|-----------|------------|
| **Bentley FlowMaster** | ~$2,000/yr | Full-featured, industry standard, GVF profiles | Expensive, desktop-only, heavy licensing |
| **HEC-RAS** | Free | Extremely powerful, 1D/2D modeling, government standard | Steep learning curve, complex UI, overkill for simple calcs |
| **Manning's Calculator Apps** | Free–$20 | Simple, quick answers | Single shape, no Froude, no solve-for-any, no diagrams |
| **Online Calculators** | Free | Accessible | Bare-bones, no cross-section visualization, limited shapes |

### Competitive Advantage
- **Instant calculation** — no project setup, no file management
- **4 cross-section shapes** with live SVG diagram and water level
- **Solve for any variable** — not just depth or discharge
- **Froude classification** with color-coded flow regime badges
- **Zero install** — runs entirely in the browser
- **Free tier covers 80% of use cases** — eliminates $2K/yr FlowMaster cost for most users

## Current State (MVP)

### Test Coverage
- **48 tests total**: 26 unit tests + 22 E2E tests
- Cross-section geometry, Manning's solver, flow classification, results computation

### Survey Results
| Metric | Score |
|--------|-------|
| Professional use intent | 75% |
| Scales to real projects | 40% |
| Useful as-is | 80% |
| Would pay for incremental premium | 50% |
| Would pay for major premium | 65% |

### Current Strengths
- Instant calculation with no setup overhead
- 4 cross-section shapes (rectangle, trapezoid, circle, triangle)
- Froude number classification (subcritical/critical/supercritical)
- Solve-for-any-variable flexibility (Q, y, S, n, b)
- Live SVG cross-section diagram with water level
- Light/dark theme, printable report

### Current Weaknesses
- Single reach only — no reach-to-reach analysis
- No gradually varying flow (GVF) water surface profiles
- No irregular cross-sections (surveyed data)
- Uniform flow only — no backwater or drawdown curves

## Monetization Strategy

### Phase 1: Free MVP (Current)
**Goal:** Build user base and establish credibility in hydraulic engineering community.

Features included:
- 4 standard cross-section shapes (rectangle, trapezoid, circle, triangle)
- Manning's equation solver (solve for any of 5 variables)
- Normal depth and critical depth computation
- Froude number and flow regime classification
- Cross-section SVG diagram with water level
- Printable calculation report

### Phase 2: Professional Tier — $99–$149/yr
**Goal:** Capture the 50% willing to pay for incremental features + the "scales to real projects" gap.

| Feature | Size | Description |
|---------|------|-------------|
| Irregular cross-sections | L | Surveyed coordinate pairs with trapezoidal integration for area/perimeter |
| GVF water surface profiles | XL | Standard Step Method for M1/M2/S1/S2/S3 profiles; plot water surface along channel |
| Composite Manning's n | M | Weighted roughness for channels with varying lining (Horton, Einstein, Lotter methods) |
| Export to HEC-RAS | M | Generate .g01 geometry files importable into HEC-RAS for advanced analysis |

**Validation:** Chow "Open Channel Hydraulics" Chapter 10 GVF examples, HEC-RAS output comparison for identical reach geometry.

**Why users pay:** GVF profiles are the #1 gap — engineers need to know water surface elevation at specific stations, not just normal depth. Irregular sections unlock real-world surveyed channels. HEC-RAS export provides an off-ramp for complex projects, keeping users in manningcalc for routine work.

### Phase 3: Enterprise Tier — $199–$349/yr
**Goal:** Capture the 65% willing to pay for major features; compete directly with FlowMaster.

| Feature | Size | Description |
|---------|------|-------------|
| Multi-reach profiles | XL | Chain multiple reaches with different slopes, roughness, and geometry; compute continuous water surface profile |
| Bridge/culvert backwater | XL | HDS-7 bridge hydraulics and HDS-5 culvert analysis integrated into reach profiles |
| Sediment transport | L | Shields diagram, incipient motion, Meyer-Peter-Müller and Engelund-Hansen transport equations |
| Floodplain mapping | XL | Compound channel analysis with main channel + overbank sections; export water surface elevations for GIS overlay |

**Validation:** Chow textbook multi-reach examples, HEC-RAS comparison for bridge/culvert backwater, FHWA HDS-5/HDS-7 worked examples.

**Why users pay:** Multi-reach profiles and bridge backwater are FlowMaster's core value proposition at $2K/yr. Offering these at $199–$349/yr is an 80%+ cost reduction. Floodplain mapping connects hydraulic output to GIS workflows, a major unmet need in browser-based tools.

## Revenue Projections

### Assumptions
- Free tier attracts 2,000 active users in Year 1 (SEO + engineering forums)
- Phase 2 conversion: 8–12% of free users → $99–$149/yr
- Phase 3 conversion: 3–5% of free users → $199–$349/yr
- Churn: 15–20% annually (typical for engineering SaaS)

### Year 1 (Free MVP)
- Revenue: $0
- Focus: User acquisition, SEO for "Manning's equation calculator", "open channel flow calculator"
- KPI: 2,000 active users, 48+ tests passing, <2s calculation time

### Year 2 (Phase 2 Launch)
- Paying users: 160–240 (8–12% of 2,000)
- Revenue: $15,840–$35,760/yr
- Focus: GVF profiles as flagship feature, engineering blog content

### Year 3 (Phase 3 Launch)
- Free user base: 5,000+ (organic growth)
- Phase 2 users: 400–600
- Phase 3 users: 150–250
- Revenue: $69,450–$176,900/yr
- Focus: FlowMaster displacement, DOT/municipal contracts

## Technical Roadmap

### Phase 2 Implementation Order
1. **Composite Manning's n** (M) — foundation for mixed-lining channels
2. **Irregular cross-sections** (L) — coordinate input UI, trapezoidal integration engine
3. **GVF water surface profiles** (XL) — Standard Step Method engine, profile plot component
4. **HEC-RAS export** (M) — .g01 geometry file writer

### Phase 3 Implementation Order
1. **Multi-reach profiles** (XL) — reach chaining data model, continuous profile solver
2. **Bridge/culvert backwater** (XL) — HDS-5/HDS-7 integration, structure editor
3. **Sediment transport** (L) — Shields parameter, transport equation engine
4. **Floodplain mapping** (XL) — compound sections, GIS export (GeoJSON)

### Validation Strategy
- **Primary:** Chow "Open Channel Hydraulics" worked examples (Chapters 5, 10, 11)
- **Secondary:** Chaudhry "Open Channel Flow" textbook problems
- **Cross-validation:** HEC-RAS output comparison for identical geometry and boundary conditions
- **Regression:** All new features must pass existing 48-test suite; each Phase 2/3 feature adds 15–30 tests

## Growth Strategy

### SEO & Content
- Target keywords: "Manning's equation calculator", "open channel flow calculator", "normal depth calculator", "GVF profile calculator"
- Engineering blog: worked examples, comparison guides (manningcalc vs FlowMaster vs HEC-RAS)
- YouTube: short tutorials showing instant calculation workflow

### Community
- ASCE/EWRI conference mentions and student outreach
- Reddit r/civilengineering, r/hydrology presence
- University adoption for hydraulics coursework (free tier)

### Partnerships
- Civil engineering review course providers (PE exam prep)
- State DOT technology evaluation programs
- Integration with StormLab (sister product) for drainage system design

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| HEC-RAS adds simple UI mode | High | Stay ahead on UX; HEC-RAS institutional inertia is massive |
| Bentley drops FlowMaster price | Medium | Our free tier is unbeatable; premium still 80%+ cheaper |
| Numerical stability in GVF solver | Medium | Robust step-size control, hydraulic jump detection, extensive test suite |
| Low conversion to paid tiers | Medium | Ensure free tier is genuinely useful; paid features must be clearly essential for professional work |
| Competitor clones free tier | Low | Speed of execution + validation depth + ecosystem (StormLab integration) as moat |

## Success Metrics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active users | 2,000 | 3,500 | 5,000+ |
| Test count | 48+ | 120+ | 200+ |
| Cross-sections | 4 | 5 (+ irregular) | 5 + compound |
| Paid subscribers | — | 160–240 | 550–850 |
| ARR | $0 | $15K–$36K | $69K–$177K |
| FlowMaster displacement | — | 5% of target market | 15% of target market |
