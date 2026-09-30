import type { IngredientIndex } from './ingredientRepository'
import { filled, isComplete, sanitizeSelection } from './selectionRules'
import type { BowlConfiguration, Selection } from './types'

/** Stage 5/6 boundary: IDs only. Returns null until base and protein are chosen. */
export function toConfiguration(s: Selection): BowlConfiguration | null {
  if (!isComplete(s)) return null
  return {
    version: 1,
    baseId: s.base!,
    proteinId: s.protein!,
    flavourIds: filled(s.flavours),
    toppingIds: filled(s.toppings),
  }
}

const strip = (id: string) => id.slice(id.indexOf('.') + 1)

/** Share-link params use slugs: ?base=…&protein=…&flavours=a,b&toppings=x,y,z */
export function toSearchParams(s: Selection): URLSearchParams {
  const p = new URLSearchParams()
  if (s.base) p.set('base', strip(s.base))
  if (s.protein) p.set('protein', strip(s.protein))
  const f = filled(s.flavours).map(strip)
  const t = filled(s.toppings).map(strip)
  if (f.length) p.set('flavours', f.join(','))
  if (t.length) p.set('toppings', t.join(','))
  return p
}

export function fromSearchParams(p: URLSearchParams, index: IngredientIndex): Selection | null {
  if (!['base', 'protein', 'flavours', 'toppings'].some((k) => p.has(k))) return null
  const list = (k: string, cat: string) =>
    (p.get(k) ?? '')
      .split(',')
      .filter(Boolean)
      .map((slug) => `${cat}.${slug}`)
  return sanitizeSelection(
    {
      base: p.get('base') ? `base.${p.get('base')}` : null,
      protein: p.get('protein') ? `protein.${p.get('protein')}` : null,
      flavours: list('flavours', 'flavour'),
      toppings: list('toppings', 'topping'),
    },
    index,
  )
}

/** Map Stage 3 catalog component IDs onto the builder; returns unsupported component names. */
export function fromCatalogComponents(
  components: readonly { ingredientId: string; name: string }[],
  index: IngredientIndex,
): { selection: Selection; unsupported: string[] } {
  const ids = components.map((c) => c.ingredientId)
  const selection = sanitizeSelection(
    {
      base: ids.find((i) => i.startsWith('base.')) ?? null,
      protein: ids.find((i) => i.startsWith('protein.')) ?? null,
      flavours: ids.filter((i) => i.startsWith('flavour.')),
      toppings: ids.filter((i) => i.startsWith('topping.')),
    },
    index,
  )
  const used = new Set([
    selection.base,
    selection.protein,
    ...selection.flavours,
    ...selection.toppings,
  ])
  return {
    selection,
    unsupported: components.filter((c) => !used.has(c.ingredientId)).map((c) => c.name),
  }
}
