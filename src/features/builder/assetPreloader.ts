import type { IngredientIndex } from './ingredientRepository'
import { CATEGORIES, type Category } from './types'

const requested = new Set<string>()

/** Fire-and-forget image preload, de-duplicated for the session. */
export function preloadImages(
  urls: readonly string[],
  create: () => HTMLImageElement = () => new Image(),
): string[] {
  const fresh = urls.filter((u) => !requested.has(u))
  for (const u of fresh) {
    requested.add(u)
    const img = create()
    img.decoding = 'async'
    img.src = u
  }
  return fresh
}

export const resetPreloadCache = () => requested.clear()

/**
 * Progressive policy: layers for the current step's options, plus thumbnails and
 * layers for the next step. Never the whole library up front.
 */
export function assetsToPreload(step: Category, index: IngredientIndex): string[] {
  const i = CATEGORIES.indexOf(step)
  const current = index.byCategory[step].map((x) => x.layerSrc)
  const nextCat = CATEGORIES[i + 1]
  const next = nextCat ? index.byCategory[nextCat].flatMap((x) => [x.thumbnailSrc, x.layerSrc]) : []
  return [...current, ...next]
}
