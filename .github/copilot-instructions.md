---
applyTo: "**"
---
# ChannelFlow — Open Channel Flow (Manning's Equation)

## Domain
- Normal depth computation via Manning's equation
- Cross-section geometry: trapezoid, rectangle, circle, triangle, irregular
- Flow classification: subcritical, critical, supercritical (Froude number)
- Critical depth computation

## Key Equations
- Manning's (US): `Q = (1.49/n) × A × R^(2/3) × S^(1/2)`
- Froude number: `Fr = V / √(g × A/T)`
- Hydraulic radius: `R = A / P`
- Critical depth: solve `Q²T / (gA³) = 1` iteratively

## Cross-Section Formulas
- Rectangle: `A = by`, `P = b + 2y`, `T = b`
- Trapezoid: `A = (b + zy)y`, `P = b + 2y√(1+z²)`, `T = b + 2zy`
- Circle: theta-based partial flow area and wetted perimeter
- Triangle: `A = zy²`, `P = 2y√(1+z²)`

## Validation Sources
- Chow "Open Channel Hydraulics" worked examples
- Chaudhry "Open Channel Flow" textbook
- Bentley FlowMaster output comparison



# Code Implementation Flow

<important>Mandatory Development Loop (non-negotiable)</important>

## Git Workflow
- **Work directly on master** — solo developer, no branch overhead
- **Commit after every completed unit of work** — never leave working code uncommitted
- **Push after each work session** — remote backup is non-negotiable
- **Tag milestones**: `git tag v0.1.0-mvp` when deploying or reaching a checkpoint
- **Branch only for risky experiments** you might discard — delete after merge or abandon

## Preparation & Definitions
- Use Typescript as default language, unless told otherwise
- Work using TDD with red/green flow ALWAYS
- If its a webapp: Add always Playwright E2E tests
- Separate domain logic from CLI/UI/WebAPI, unless told otherwise
- Every UI/WebAPI feature should have parity with a CLI way of testing that feature

## Validation
After completing any feature:
- Run all new unit tests, validate coverage is over 90%
- Use cli to test new feature
- If its a UI impacting feature: run all e2e tests
- If its a UI impacting feature: do a visual validation using Playwright MCP, take screenshots as you tests and review the screenshots to verify visually all e2e flows and the new feature. <important>If Playwright MCP is not available stop and let the user know</important>

If any of the validations step fail, fix the underlying issue.

## Finishing
- Update documentation for the project based on changes
- <important>Always commit after you finish your work with a message that explain both what is done, the context and a trail of the though process you made </important>


# Deployment

- git push master branch will trigger CI/CD in Github
- CI/CD in Github will run tests, if they pass it will be deployed to Vercel https://manningcalc.vercel.app/
- Umami analytics and Feedback form with Supabase database