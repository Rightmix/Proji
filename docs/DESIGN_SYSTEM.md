# PROJI Design System (Stage 2)

Source of truth: `src/design/tokens.ts`. It is mirrored in `src/index.css` `@theme`, and `tokens.test.ts` checks that the two match and that contrast still meets WCAG AA.

## Direction
White and warm-grey surfaces, natural-green selection states, deep-green primary actions, matte-black bowl and a clean sans-serif UI. It follows the four-screen customisation reference; see "Dependencies" below.

## Tokens
| Group | Tokens (Tailwind class stem) | Use |
|---|---|---|
| Surfaces | `canvas` #f4f2ee → `surface` #fff → `surface-muted` #ece9e3; `line`, `line-strong` | Page → card → inset |
| Ink | `ink`, `ink-muted`, `ink-inverse` | All pairs are at least 4.5:1 on every surface |
| Selection (natural green) | `select-50/100/500/700` | Selected card fill/border/check, highlighted stats |
| Action (deep green) | `action-600/700/800` | Primary buttons (default/hover/pressed) |
| Brand | `lime` #70C043, `beige` #D9C7A1 | Logo leaf, accents, notices (not for text) |
| Bowl | `bowl-900/800/700` | Matte-black bowl and dark panels |
| Radius | `sm` 8, `md` 14, `lg` 20, `xl` 28, `pill` | Inputs/cards/sheets/buttons |
| Shadow | `card`, `raised`, `bowl` | Hierarchy, not decoration |
| Type | `font-sans` Inter Variable (UI), `font-display` Fraunces Variable (marketing headings); `text-display`, `text-title`, `text-label` | Self-hosted through @fontsource, with no CDN |
| Layout | `h-header`, `min-h-touch` (44px), `max-w-content`; utilities `pt-safe`, `pb-safe`, `px-safe` | Sticky header/footer and safe-area insets |
| Motion | `duration-fast/base/slow`, `ease-standard`, utility `transition-ui` | All motion collapses under `prefers-reduced-motion: reduce` |

## Components (`src/components/ui`)
`Button`, `ButtonLink`, `buttonClasses`, `Card` (tones), `Label`, `Icon`, `SelectionIndicator`, `SelectableGroup` + `SelectableCard` (native radio/checkbox, `max` limit), `StatTile`, `ResponsiveImage`, `MediaCircle`, `BowlSurface`, `Container`, `Section`, `StickyFooter`. Also `SiteHeader` (sticky, responsive, with a mobile disclosure menu) and `SkipLink` in `components/Layouts.tsx`.

**Stage 4 reuse:**
- Ingredient cards → `SelectableGroup`/`SelectableCard` with a `MediaCircle` thumbnail.
- Macro strip → `StatTile` (protein uses `highlight`).
- Persistent bowl → `BowlSurface`, with layer children on a shared square canvas.
- Footer actions → `StickyFooter` + `Button`.
- Selection rules, animation presets and ingredient data are **not** part of Stage 2.

## Assets
`public/assets/{brand,home,…}`, registered in `src/lib/assets.ts` with alt text, intrinsic size and a `status` of `approved` or `reference-placeholder`. Stage 4 layers go under `public/assets/bowl-builder/…` as planned. The homepage hero is a **reference placeholder**: it is cropped from an AI-generated brand image and must be replaced with approved photography before launch.

## Dependencies
- **Four-screen customisation mockup:** **confirmed as the approved master on 2026-09-30.** Full resolution: `docs/design/approved/four-screen-customize-master.png`. Stage 4 comparison: `docs/design/stage-4/master-vs-implementation.jpg`.
- Final logo artwork: the current wordmark and favicon are provisional.
- Approved food photography.

## Stage 5.5 additions (approved mobile board)
- **Reference:** `docs/design/stage-5.5/approved-reference.jpg`.
- **Tokens:** the action green is now `#187a40`/`#16703b`/`#13612f`. Macro dots are `macro-protein` `#5b6ee1`, `macro-carbs` `#e39a2d` and `macro-fat` `#3a9ad9`; they are always paired with text.
- **Shell:** `BottomNav`, `ChatButton` (set `--fab-offset` to keep it above sticky CTAs), `BackHeader`/`BackButton`, `DeliverySelector`, `SearchField`.
- **Meals:** `MealCard` (vertical, 2 per row), `MealGrid`, `MealImage` (photo, then a prototype composite, then a placeholder), `MacroLine`, `IllustrativeTag`, `CategoryCircles`.
- **BYO:** `CategoryNavigation` is now a vertical rail; `IngredientSelector` is a tile grid using an `@container` 3→2 fallback; `CustomizationFooter` is the summary bar.
- **Route handles:** `{ hideNav, hideChat }` hide the shell chrome on full-screen flows (detail, checkout).
