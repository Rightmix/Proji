/**
 * PROJI design tokens — single TypeScript source mirrored in `src/index.css` (@theme).
 * `tokens.test.ts` fails if the two drift or if key pairs lose WCAG contrast.
 * Direction: white + warm-grey surfaces, natural-green selection, deep-green actions,
 * matte-black bowl (see docs/DESIGN_SYSTEM.md).
 */
export const color = {
  // Surfaces (lightest → deepest)
  canvas: '#f4f2ee', // warm-grey page background
  surface: '#ffffff', // cards, sheets
  'surface-muted': '#ece9e3', // inset / secondary surfaces
  line: '#e2ddd4', // hairline borders
  'line-strong': '#c9c2b5',
  // Ink
  ink: '#151714',
  'ink-muted': '#575a53',
  'ink-inverse': '#ffffff',
  // Natural green — selection states
  'select-50': '#eef6e9',
  'select-100': '#dcedd1',
  'select-500': '#599a3d', // selected border / check fill (non-text)
  'select-700': '#2f6d33', // text on selected surfaces
  // Deep green — primary actions
  'action-600': '#2e6b34',
  'action-700': '#245a2a',
  'action-800': '#1c4821',
  // Brand accents (from PROJECT_REQUIREMENTS)
  lime: '#70c043',
  beige: '#d9c7a1',
  // Matte-black bowl
  'bowl-900': '#0e0e0e',
  'bowl-800': '#171717',
  'bowl-700': '#262626',
  // Feedback
  danger: '#b3261e',
  focus: '#2e6b34',
} as const

export const radius = {
  sm: '0.5rem',
  md: '0.875rem',
  lg: '1.25rem',
  xl: '1.75rem',
  pill: '9999px',
} as const

export const shadow = {
  card: '0 1px 2px rgb(21 23 20 / 0.06), 0 1px 1px rgb(21 23 20 / 0.04)',
  raised: '0 6px 20px -6px rgb(21 23 20 / 0.18)',
  bowl: '0 18px 40px -12px rgb(0 0 0 / 0.45)',
} as const

export const font = {
  sans: "'Inter Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  display: "'Fraunces Variable', ui-serif, Georgia, 'Times New Roman', serif",
} as const

/** Generic motion tokens (ms). Stage 4 ingredient timings live in Stage 4 presets. */
export const motion = { fast: 150, base: 220, slow: 360 } as const

export const layout = {
  headerHeight: '3.5rem',
  footerHeight: '5rem',
  contentMax: '72rem',
  touchMin: '2.75rem',
} as const

export type ColorToken = keyof typeof color
