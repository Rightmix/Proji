import type { IngredientIndex } from './ingredientRepository'
import { EMPTY_SELECTION } from './selectionRules'
import { SLOT_COUNT, type BowlConfiguration, type Category, type Selection } from './types'

/**
 * THE canonical (de)serialization boundary for persisted bowls (Stage 5 saved bowls,
 * later Stage 6 carts/orders and Stage 9 subscriptions). Persisted data is untrusted:
 * every decode re-validates shape, limits, IDs, categories and current availability.
 * Unknown/unavailable ingredients are reported, never silently substituted.
 */
export const CONFIG_VERSION = 1 as const
const ID = (cat: Category) => new RegExp(`^${cat}\\.[a-z0-9]+(?:-[a-z0-9]+)*$`)

export interface MissingIngredient {
  id: string
  category: Category
  reason: 'unknown' | 'unavailable'
}

export type DecodeResult =
  | { status: 'ok'; configuration: BowlConfiguration; selection: Selection }
  | { status: 'stale'; selection: Selection; missing: MissingIngredient[] }
  | { status: 'invalid'; reason: string }

export interface DecodeOptions {
  /** Current availability; defaults to "everything in the index is available". */
  isAvailable?: (id: string) => boolean
}

/** Serialize a configuration for storage (plain JSON, IDs only — no names/prices/macros). */
export function encodeConfiguration(c: BowlConfiguration): BowlConfiguration {
  return {
    version: CONFIG_VERSION,
    baseId: c.baseId,
    proteinId: c.proteinId,
    flavourIds: [...c.flavourIds],
    toppingIds: [...c.toppingIds],
  }
}

function shapeError(raw: unknown): string | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return 'not an object'
  const o = raw as Record<string, unknown>
  const keys = Object.keys(o).sort().join(',')
  if (keys !== 'baseId,flavourIds,proteinId,toppingIds,version') return `unexpected keys: ${keys}`
  if (o.version !== CONFIG_VERSION) return `unsupported version ${String(o.version)}`
  if (typeof o.baseId !== 'string' || !ID('base').test(o.baseId)) return 'invalid baseId'
  if (typeof o.proteinId !== 'string' || !ID('protein').test(o.proteinId))
    return 'invalid proteinId'
  for (const [k, cat, max] of [
    ['flavourIds', 'flavour', SLOT_COUNT.flavour],
    ['toppingIds', 'topping', SLOT_COUNT.topping],
  ] as const) {
    const arr = o[k]
    if (!Array.isArray(arr)) return `${k} is not an array`
    if (arr.length > max) return `${k} exceeds limit of ${max}`
    if (!arr.every((x) => typeof x === 'string' && ID(cat).test(x))) return `invalid id in ${k}`
    if (new Set(arr).size !== arr.length) return `duplicate id in ${k}`
  }
  return null
}

export function decodeConfiguration(
  raw: unknown,
  index: IngredientIndex,
  opts: DecodeOptions = {},
): DecodeResult {
  const err = shapeError(raw)
  if (err) return { status: 'invalid', reason: err }
  const c = raw as BowlConfiguration
  const available = opts.isAvailable ?? (() => true)
  const missing: MissingIngredient[] = []
  const keep = (id: string, category: Category): string | null => {
    const ing = index.byId.get(id)
    if (!ing || ing.category !== category) {
      missing.push({ id, category, reason: 'unknown' })
      return null
    }
    if (!available(id)) {
      missing.push({ id, category, reason: 'unavailable' })
      return null
    }
    return id
  }
  const pad = (ids: (string | null)[], n: number) => [...ids, ...Array(n - ids.length).fill(null)]
  const selection: Selection = {
    ...EMPTY_SELECTION,
    base: keep(c.baseId, 'base'),
    protein: keep(c.proteinId, 'protein'),
    flavours: pad(
      c.flavourIds.map((id) => keep(id, 'flavour')).filter(Boolean),
      SLOT_COUNT.flavour,
    ),
    toppings: pad(
      c.toppingIds.map((id) => keep(id, 'topping')).filter(Boolean),
      SLOT_COUNT.topping,
    ),
  }
  if (missing.length) return { status: 'stale', selection, missing }
  return { status: 'ok', configuration: encodeConfiguration(c), selection }
}

/** Human-readable label for a missing ingredient id (best effort; never invents a name). */
export function describeMissing(m: MissingIngredient, index: IngredientIndex): string {
  return index.byId.get(m.id)?.name ?? m.id.slice(m.id.indexOf('.') + 1).replace(/-/g, ' ')
}
