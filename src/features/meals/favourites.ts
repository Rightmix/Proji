import { createLocalStore, useLocalStore } from '../../lib/localStore'

/** Device-local favourites (no account sync until a favourites table exists). */
export const favouritesStore = createLocalStore<string[]>('proji-favourites', [], (raw) =>
  Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, 200) : [],
)

export function toggleFavourite(slug: string) {
  const cur = favouritesStore.get()
  favouritesStore.set(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug])
}

export const useFavourites = () => useLocalStore(favouritesStore)
