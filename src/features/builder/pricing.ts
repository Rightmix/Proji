import type { IngredientIndex } from './ingredientRepository'
import { selectedIngredients } from './nutrition'
import type { DataStatus, Selection } from './types'

export interface PriceTotal {
  amountMinor: number
  currency: 'INR'
  dataStatus: DataStatus
}

/**
 * Client-side ILLUSTRATIVE total for display only. Real orders (Stage 6) must be
 * repriced on the server from validated data; never trust this number for payment.
 */
export function computePrice(s: Selection, index: IngredientIndex): PriceTotal {
  const amountMinor = selectedIngredients(s, index).reduce((sum, i) => sum + i.values.priceMinor, 0)
  return { amountMinor, currency: 'INR', dataStatus: index.source.dataStatus }
}

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
export const formatInr = (amountMinor: number) => inr.format(Math.round(amountMinor / 100))
/** "+₹150" style add-on label. */
export const formatAddOn = (amountMinor: number) => `+${formatInr(amountMinor)}`
