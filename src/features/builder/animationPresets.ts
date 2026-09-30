import type { Category } from './types'

/** Ingredient-appropriate transitions (durations from the Stage 4 spec). */
export const ANIMATION_PRESETS: Record<
  Category,
  { name: string; durationMs: number; easing: string }
> = {
  base: { name: 'reveal', durationMs: 600, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
  protein: { name: 'place', durationMs: 500, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1.15)' },
  flavour: { name: 'drizzle', durationMs: 700, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  topping: { name: 'scatter', durationMs: 500, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' },
}
