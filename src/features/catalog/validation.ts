import {
  BASE_FAMILIES,
  COMPONENT_ROLES,
  PROTEIN_TYPES,
  type SignatureBowl,
  type Verified,
} from './types'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const INGREDIENT_ID = new RegExp(`^(${COMPONENT_ROLES.join('|')})\\.[a-z0-9]+(?:-[a-z0-9]+)*$`)

function verifiedErrors(label: string, v: Verified<unknown>, fixture: boolean): string[] {
  if (v.status === 'unavailable') return []
  const errs: string[] = []
  if (fixture) errs.push(`${label}: development fixtures must not carry validated values`)
  if (!v.source?.trim()) errs.push(`${label}: validated value requires a source`)
  if (!v.validatedAt || Number.isNaN(Date.parse(v.validatedAt)))
    errs.push(`${label}: validated value requires validatedAt`)
  return errs
}

/** Returns a list of integrity problems; empty means the catalog is safe to render. */
export function validateCatalog(bowls: readonly SignatureBowl[]): string[] {
  const errs: string[] = []
  const ids = new Set<string>()
  const slugs = new Set<string>()
  for (const b of bowls) {
    const at = `bowl ${b.id || '?'}`
    if (!b.id || ids.has(b.id)) errs.push(`${at}: missing or duplicate id`)
    ids.add(b.id)
    if (!SLUG.test(b.slug) || slugs.has(b.slug))
      errs.push(`${at}: invalid or duplicate slug "${b.slug}"`)
    slugs.add(b.slug)
    if (!b.name.trim()) errs.push(`${at}: missing name`)
    if (!(b.baseFamily in BASE_FAMILIES)) errs.push(`${at}: unknown base family ${b.baseFamily}`)
    if (!(b.proteinType in PROTEIN_TYPES)) errs.push(`${at}: unknown protein type ${b.proteinType}`)
    if (!b.components.some((c) => c.role === 'base')) errs.push(`${at}: needs a base component`)
    if (!b.components.some((c) => c.role === 'protein'))
      errs.push(`${at}: needs a protein component`)
    for (const c of b.components) {
      if (!INGREDIENT_ID.test(c.ingredientId) || !c.ingredientId.startsWith(`${c.role}.`))
        errs.push(`${at}: component id "${c.ingredientId}" must be "${c.role}.<slug>"`)
    }
    const fixture = b.dataStatus === 'development-fixture'
    errs.push(...verifiedErrors(`${at} nutrition`, b.nutrition, fixture))
    errs.push(...verifiedErrors(`${at} price`, b.price, fixture))
    errs.push(...verifiedErrors(`${at} allergens`, b.allergens, fixture))
    if (b.dataStatus === 'validated' && !b.recipeVersionId)
      errs.push(`${at}: validated bowl requires recipeVersionId`)
  }
  return errs
}
