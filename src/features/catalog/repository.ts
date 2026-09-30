import type { CatalogRepository, SignatureBowl } from './types'
import { validateCatalog } from './validation'

const sortBowls = (b: readonly SignatureBowl[]) =>
  [...b].sort((x, y) => x.sortOrder - y.sortOrder || x.name.localeCompare(y.name))

/**
 * In-memory repository over a (possibly lazily loaded) bowl list. Validates once and
 * refuses to serve an invalid catalog.
 */
export function createStaticRepository(
  source: readonly SignatureBowl[] | (() => Promise<readonly SignatureBowl[]>),
): CatalogRepository {
  let cached: Promise<SignatureBowl[]> | null = null
  const load = () =>
    (cached ??= Promise.resolve(typeof source === 'function' ? source() : source).then((bowls) => {
      const errors = validateCatalog(bowls)
      if (errors.length) throw new Error(`Catalog integrity check failed: ${errors.join('; ')}`)
      return sortBowls(bowls)
    }))
  return {
    listBowls: () => load(),
    async getBowl(slug) {
      return (await load()).find((b) => b.slug === slug) ?? null
    },
  }
}

export type CatalogSource = 'fixtures' | 'empty'

/**
 * Chooses the catalog source. Development/test use fixtures. Production builds publish
 * nothing unless VITE_CATALOG_SOURCE=fixtures is set explicitly (e.g. a preview).
 * Stage 7 adds 'supabase'.
 */
export function resolveCatalogSource(env: {
  MODE?: string
  DEV?: boolean
  VITE_CATALOG_SOURCE?: string
}): CatalogSource {
  const explicit = env.VITE_CATALOG_SOURCE
  if (explicit === 'fixtures' || explicit === 'empty') return explicit
  return env.DEV || env.MODE === 'test' ? 'fixtures' : 'empty'
}

export function createCatalogRepository(source: CatalogSource): CatalogRepository {
  // Fixtures are code-split so they are never fetched when the source is 'empty'.
  return createStaticRepository(
    source === 'fixtures'
      ? () => import('./fixtures').then((m) => m.DEVELOPMENT_FIXTURE_BOWLS)
      : [],
  )
}
