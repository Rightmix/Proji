import type { ImageAsset } from '../../lib/assets'

/**
 * Catalog domain model (Stage 3).
 * Commercial and nutritional facts are wrapped in `Verified<T>` so the UI can only show
 * them once Stage 7 supplies validated, sourced values. Until then they are 'unavailable'.
 */

/** Component roles. `flavour` = sauces/seasonings; matches Stage 4 builder categories. */
export const COMPONENT_ROLES = [
  'base',
  'protein',
  'flavour',
  'vegetable',
  'topping',
  'accompaniment',
] as const
export type ComponentRole = (typeof COMPONENT_ROLES)[number]

/** Grain/base families. Extend by adding a key + label; filters derive from data. */
export const BASE_FAMILIES = {
  rice: 'Rice',
  'red-rice': 'Red rice',
  'brown-rice': 'Brown rice',
  millet: 'Millet',
  quinoa: 'Quinoa',
  oats: 'Oats',
} as const
export type BaseFamily = keyof typeof BASE_FAMILIES

export const PROTEIN_TYPES = {
  chicken: 'Chicken',
  fish: 'Fish',
  beef: 'Beef',
  egg: 'Egg',
  vegetarian: 'Vegetarian',
} as const
export type ProteinType = keyof typeof PROTEIN_TYPES

export type AvailabilityState = 'available' | 'sold-out' | 'coming-soon' | 'unavailable'
export interface Availability {
  state: AvailabilityState
  note?: string
}

/** A value that must be validated (Stage 7) before it is shown to customers. */
export type Verified<T> =
  { status: 'unavailable' } | { status: 'validated'; value: T; source: string; validatedAt: string }

export interface NutritionFacts {
  energyKcal: number
  proteinG: number
  carbsG: number
  fatG: number
  servingG: number
}

export interface Money {
  amountMinor: number // paise
  currency: 'INR'
}

export interface BowlComponent {
  /** Stable ingredient id `role.slug`, shared with Stage 4 builder and Stage 7 recipes. */
  ingredientId: string
  name: string
  role: ComponentRole
}

export type CatalogDataStatus = 'development-fixture' | 'validated'

export interface SignatureBowl {
  id: string
  slug: string
  name: string
  summary: string
  description: string
  baseFamily: BaseFamily
  proteinType: ProteinType
  components: BowlComponent[]
  image: ImageAsset | null
  availability: Availability
  sortOrder: number
  nutrition: Verified<NutritionFacts>
  price: Verified<Money>
  allergens: Verified<string[]>
  /** Stage 7 standardized recipe version; null until recipes are validated. */
  recipeVersionId: string | null
  dataStatus: CatalogDataStatus
}

/** Read-only catalog source. Stage 7 adds a Supabase-backed implementation. */
export interface CatalogRepository {
  listBowls(): Promise<SignatureBowl[]>
  getBowl(slug: string): Promise<SignatureBowl | null>
}
