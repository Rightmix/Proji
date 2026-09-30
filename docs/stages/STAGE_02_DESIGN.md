# Stage 02 — Design system

**Status:** In review (2026-09-30). Implementation on `stage-2/design-system`; see STAGE_2_REPORT.md, STAGE_02_ACCEPTANCE_TESTS.md and docs/DESIGN_SYSTEM.md. See PROJECT_ROADMAP.md for provisional estimate.

## Objective and scope
Brand tokens, typography, reusable UI components, responsive navigation, homepage and image integration.

## Dependencies
Prior relevant foundation, data and workflow stages; review architecture and approved requirements before implementation.

## Deliverables
Implemented feature(s), appropriate documentation, tests and a reviewed pull request.

## Acceptance criteria
Document task-specific functional, permission, mobile usability and operational tests before coding; execute and record real test results. Validate nutrition, prices and allergen data before publishing where applicable. Update related Issues, roadmap and changelog with evidence.

## Risks and deferred decisions
Confirm recipes, data sources, operational constraints, security, third-party integrations and costs before committing to production behavior. Do not mark complete without review.

## Cross-stage requirement: approved customization mockup
Stage 2 must preserve the previously approved four-screen customization interface as the master visual reference. Supply and audit the actual mockup before Stage 4 UI implementation. Shared tokens should support white/warm-grey surfaces, natural-green selected states, deep-green actions, matte-black bowl, circular ingredient thumbnails and clean modern sans-serif typography. Stage 4 requires a fixed-near-top responsive bowl preview while ingredients scroll beneath, with a sticky footer and reduced-motion/accessibility states. See [Stage 4 detailed plan](STAGE_04_BOWL_BUILDER.md). Do not redesign the approved layout without approval.
