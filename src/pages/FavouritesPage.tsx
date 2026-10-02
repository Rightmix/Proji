import { Container } from '../components/ui'
import { BackHeader } from '../components/shell/BackHeader'
import { MealGrid, MealsDisclosure } from '../components/meals/MealGrid'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { useFavourites } from '../features/meals/favourites'

export default function FavouritesPage() {
  const favs = useFavourites()
  const { state } = useCatalogQuery((r) => r.listBowls(), 'list')
  const bowls = state.status === 'ready' ? state.data.filter((b) => favs.includes(b.slug)) : []
  return (
    <Container className="flex flex-col gap-3 pb-8 pt-1 md:pt-6">
      <BackHeader title="Favourites" subtitle="Saved on this device" fallback="/account" />
      {state.status === 'loading' ? (
        <p role="status">Loading…</p>
      ) : bowls.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          <h2 className="font-semibold">No favourites yet</h2>
          <p className="mt-1 text-sm text-ink-muted">Tap the heart on any meal to keep it here.</p>
        </div>
      ) : (
        <>
          <MealGrid bowls={bowls} headingLevel={2} label="Favourites" />
          <MealsDisclosure />
        </>
      )}
    </Container>
  )
}
