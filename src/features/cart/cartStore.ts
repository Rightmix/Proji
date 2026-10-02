import { createLocalStore, useLocalStore } from '../../lib/localStore'
import type { BowlConfiguration } from '../builder/types'

/**
 * PROTOTYPE device-local cart (Stage 5.5 UI boundary). Stores IDs only; prices and
 * nutrition are recomputed from the ingredient source on every render and are
 * illustrative. Stage 6 replaces this with a server-validated cart.
 */
export interface CartItem {
  id: string
  name: string
  /** Catalog slug when added from a signature meal. */
  mealSlug: string | null
  configuration: unknown // untrusted: always decoded via savedBowlCodec
  quantity: number
}

const MAX_QTY = 20
const MAX_ITEMS = 30

const parse = (raw: unknown): CartItem[] =>
  Array.isArray(raw)
    ? raw
        .filter(
          (x): x is CartItem =>
            !!x &&
            typeof x === 'object' &&
            typeof (x as CartItem).id === 'string' &&
            typeof (x as CartItem).name === 'string' &&
            Number.isInteger((x as CartItem).quantity),
        )
        .map((x) => ({
          ...x,
          quantity: Math.min(MAX_QTY, Math.max(1, x.quantity)),
          mealSlug: x.mealSlug ?? null,
        }))
        .slice(0, MAX_ITEMS)
    : []

export const cartStore = createLocalStore<CartItem[]>('proji-cart', [], parse)
export const useCart = () => useLocalStore(cartStore)

const sameConfig = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function addToCart(item: {
  name: string
  mealSlug: string | null
  configuration: BowlConfiguration
}) {
  const items = cartStore.get()
  const existing = items.find(
    (i) => i.mealSlug === item.mealSlug && sameConfig(i.configuration, item.configuration),
  )
  if (existing) return setQuantity(existing.id, existing.quantity + 1)
  if (items.length >= MAX_ITEMS) return
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  cartStore.set([
    ...items,
    {
      id,
      name: item.name,
      mealSlug: item.mealSlug,
      configuration: item.configuration,
      quantity: 1,
    },
  ])
}

export function setQuantity(id: string, quantity: number) {
  cartStore.set(
    cartStore
      .get()
      .map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) } : i)),
  )
}

export function removeFromCart(id: string) {
  cartStore.set(cartStore.get().filter((i) => i.id !== id))
}

export const clearCart = () => cartStore.set([])
export const cartCount = (items: readonly CartItem[]) => items.reduce((n, i) => n + i.quantity, 0)
