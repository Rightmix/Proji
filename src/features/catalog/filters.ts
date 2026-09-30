import {
  BASE_FAMILIES,
  PROTEIN_TYPES,
  type BaseFamily,
  type ProteinType,
  type SignatureBowl,
} from './types'

export interface CatalogFilters {
  base: BaseFamily | null
  protein: ProteinType | null
  availableOnly: boolean
}

export const NO_FILTERS: CatalogFilters = { base: null, protein: null, availableOnly: false }

export function applyFilters(bowls: readonly SignatureBowl[], f: CatalogFilters): SignatureBowl[] {
  return bowls.filter(
    (b) =>
      (!f.base || b.baseFamily === f.base) &&
      (!f.protein || b.proteinType === f.protein) &&
      (!f.availableOnly || b.availability.state === 'available'),
  )
}

export interface FilterOption<T extends string> {
  value: T
  label: string
}

/** Options present in the data, ordered as declared in the registry. */
export function deriveOptions(bowls: readonly SignatureBowl[]) {
  const bases = new Set(bowls.map((b) => b.baseFamily))
  const proteins = new Set(bowls.map((b) => b.proteinType))
  return {
    base: (Object.keys(BASE_FAMILIES) as BaseFamily[])
      .filter((k) => bases.has(k))
      .map((value) => ({ value, label: BASE_FAMILIES[value] })),
    protein: (Object.keys(PROTEIN_TYPES) as ProteinType[])
      .filter((k) => proteins.has(k))
      .map((value) => ({ value, label: PROTEIN_TYPES[value] })),
  }
}

/** Parse URL params; unknown values are ignored. */
export function filtersFromParams(p: URLSearchParams): CatalogFilters {
  const base = p.get('base')
  const protein = p.get('protein')
  return {
    base: base && base in BASE_FAMILIES ? (base as BaseFamily) : null,
    protein: protein && protein in PROTEIN_TYPES ? (protein as ProteinType) : null,
    availableOnly: p.get('available') === '1',
  }
}

export function filtersToParams(f: CatalogFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.base) p.set('base', f.base)
  if (f.protein) p.set('protein', f.protein)
  if (f.availableOnly) p.set('available', '1')
  return p
}

export const hasActiveFilters = (f: CatalogFilters) =>
  Boolean(f.base || f.protein || f.availableOnly)
