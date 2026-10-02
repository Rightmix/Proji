import type { SignatureBowl } from '../catalog/types'
import type { MealEstimate } from './mealEstimate'

export interface MealCategory {
  id: string
  label: string
  /** Thumbnail shown in the category circle (prototype builder thumbnails). */
  icon: string | null
  /** Optional protein chip filtering inside the category page. */
  matches: (bowl: SignatureBowl, estimate: MealEstimate) => boolean
  /** Explanation for criteria based on illustrative numbers. */
  note?: string
}

const T = '/assets/bowl-builder/thumbnails'
const RICE = new Set(['rice', 'red-rice', 'brown-rice'])

/**
 * Discovery categories from the approved Stage 5.5 design. Nutrition-based categories
 * use ILLUSTRATIVE estimates and provisional thresholds pending owner/regulatory review.
 */
export const MEAL_CATEGORIES: readonly MealCategory[] = [
  {
    id: 'high-protein',
    label: 'High Protein',
    icon: `${T}/protein.pepper-chicken.webp`,
    matches: (_b, e) => e.status === 'illustrative' && e.nutrition.proteinG >= 30,
    note: 'Provisional: illustrative estimate of 30 g protein or more per bowl.',
  },
  {
    id: 'chicken',
    label: 'Chicken',
    icon: `${T}/protein.pepper-chicken.webp`,
    matches: (b) => b.proteinType === 'chicken',
  },
  { id: 'beef', label: 'Beef', icon: null, matches: (b) => b.proteinType === 'beef' },
  {
    id: 'fish',
    label: 'Fish',
    icon: `${T}/protein.kerala-grilled-fish.webp`,
    matches: (b) => b.proteinType === 'fish',
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    icon: `${T}/protein.roasted-soya-chunks.webp`,
    matches: (b) => b.proteinType === 'vegetarian',
  },
  {
    id: 'egg',
    label: 'Egg',
    icon: `${T}/protein.boiled-egg.webp`,
    matches: (b) => b.proteinType === 'egg',
  },
  {
    id: 'millet',
    label: 'Millet',
    icon: `${T}/base.millet-kanji.webp`,
    matches: (b) => b.baseFamily === 'millet',
  },
  {
    id: 'rice',
    label: 'Rice',
    icon: `${T}/base.brown-rice-kanji.webp`,
    matches: (b) => RICE.has(b.baseFamily),
  },
  {
    id: 'low-carb',
    label: 'Low Carb',
    icon: `${T}/topping.fresh-herbs.webp`,
    matches: (_b, e) => e.status === 'illustrative' && e.nutrition.carbsG <= 50,
    note: 'Provisional: illustrative estimate of 50 g carbohydrate or less per bowl.',
  },
]

export const findCategory = (id: string | undefined) => MEAL_CATEGORIES.find((c) => c.id === id)

/** Case-insensitive search over name, summary and component names. */
export function matchesSearch(bowl: SignatureBowl, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return [bowl.name, bowl.summary, ...bowl.components.map((c) => c.name)].some((t) =>
    t.toLowerCase().includes(needle),
  )
}
