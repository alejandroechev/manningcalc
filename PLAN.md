# manningcalc — Open Channel Flow (Manning's Equation)

## Mission
Replace Bentley FlowMaster ($3K/yr subscription) with a free browser-based Manning's equation solver.

## Architecture
- `packages/engine/` — Manning's equation solver, cross-section geometry, normal depth iteration
- `packages/web/` — React + Vite, cross-section diagram, results display
- `packages/cli/` — Node runner for batch calculations

## MVP Features (Free Tier)
1. Select cross-section shape (trapezoid, rectangle, circle, triangle, irregular)
2. Enter known parameters (any 4 of: Q, S, n, y, b)
3. Solve for the unknown using Manning's equation
4. Display normal depth, velocity, Froude number, flow regime
5. Show cross-section diagram with water level
6. Single calculation summary (printable)

## Engine Tasks

### E1: Cross-Section Geometry
- Rectangle: A = b×y, P = b+2y, T = b
- Trapezoid: A = (b+z×y)×y, P = b+2y√(1+z²), T = b+2zy
- Circle: partial flow depth → area and wetted perimeter (theta-based)
- Triangle: A = z×y², P = 2y√(1+z²)
- Irregular: coordinate pairs → area/perimeter via trapezoidal integration
- **Validation**: Manual geometry calculations, textbook examples

### E2: Manning's Equation Solver
- `Q = (1.49/n) × A × R^(2/3) × S^(1/2)` (US customary)
- Given 4 of 5 parameters, solve for the 5th
- Normal depth: iterative (bisection/Newton) since A and R depend on y
- **Validation**: Textbook worked examples (Chaudhry, Chow)

### E3: Flow Classification
- Froude number: `Fr = V / √(g × A/T)`
- Fr < 1 → subcritical, Fr = 1 → critical, Fr > 1 → supercritical
- Critical depth: solve `Q² × T / (g × A³) = 1` iteratively
- **Validation**: Known critical depth solutions

### E4: Results Computation
- Normal depth, critical depth, velocity, Froude number
- Hydraulic radius, wetted perimeter, top width
- Specific energy, momentum function
- **Validation**: Textbook solutions

## Web UI Tasks

### W1: Shape Selector & Input Form
- Visual shape selector with icons (trap, rect, circle, triangle)
- Dynamic input fields based on shape
- "Solve for" dropdown (Q, y, S, n, b)

### W2: Cross-Section Diagram
- SVG rendering of channel cross-section with water level
- Dimensions labeled, water surface highlighted blue
- Updates live as inputs change

### W3: Results Display
- Table: depth, velocity, area, wetted perimeter, hydraulic radius, Froude
- Flow regime badge (subcritical/critical/supercritical)
- Color-coded: blue=subcritical, red=supercritical

### W4: Report
- Printable calculation summary with diagram + results

### W5: Toolbar & Theme
- Shape, Calculate, Report buttons
- Manning's n reference table (expandable)
- Light/dark theme

## Key Equations
- Manning's: `Q = (1.49/n) × A × R^(2/3) × S^(1/2)`
- Froude: `Fr = V / √(g × A/T)`
- Hydraulic radius: `R = A / P`
- Critical depth: `Q²T / (gA³) = 1`

## Validation Strategy
- Chow "Open Channel Hydraulics" worked examples
- Chaudhry "Open Channel Flow" textbook problems
- FlowMaster output comparison for identical inputs
