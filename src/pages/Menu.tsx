import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Container } from '../components/ui'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { DevDataNotice, StatusMessage } from '../features/catalog/components/Notices'
import {
  NO_FILTERS,
  applyFilters,
  deriveOptions,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  type CatalogFilters,
} from '../features/catalog'
import { MealGrid, MealsDisclosure } from '../components/meals/MealGrid'
import { BackHeader } from '../components/shell/BackHeader'
import { FilterBar } from '../features/catalog/components/FilterBar'

export default function Menu() {
  const [params, setParams] = useSearchParams()
  const filters = filtersFromParams(params)
  const { state, retry } = useCatalogQuery((r) => r.listBowls(), 'list')
  const setFilters = (f: CatalogFilters) => setParams(filtersToParams(f))

  const bowls = useMemo(() => (state.status === 'ready' ? state.data : []), [state])
  const options = useMemo(() => deriveOptions(bowls), [bowls])
  const visible = applyFilters(bowls, filters)
  const hasFixtures = bowls.some((b) => b.dataStatus === 'development-fixture')

  return (
    <Container className="pb-8 pt-1 md:pt-6">
      <BackHeader title="Menu" subtitle="Signature kanji and grain bowls" fallback="/" />

      {state.status === 'loading' && (
        <p role="status" className="mt-8 text-ink-muted">
          Loading menu…
        </p>
      )}

      {state.status === 'error' && (
        <div role="alert" className="mt-8 rounded-lg border border-danger/40 bg-surface p-6">
          <p className="font-semibold">We couldn’t load the menu.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {state.status === 'ready' && bowls.length === 0 && (
        <div className="mt-8">
          <StatusMessage title="Our menu is coming soon">
            Signature bowls will appear here once they are ready.
          </StatusMessage>
        </div>
      )}

      {state.status === 'ready' && bowls.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {hasFixtures && <DevDataNotice />}
          <FilterBar filters={filters} options={options} onChange={setFilters} />
          <p aria-live="polite" className="text-sm text-ink-muted">
            {visible.length} {visible.length === 1 ? 'bowl' : 'bowls'}
          </p>
          {visible.length === 0 ? (
            <StatusMessage title="No bowls match these filters">
              {hasActiveFilters(filters) && (
                <Button variant="secondary" className="mt-3" onClick={() => setFilters(NO_FILTERS)}>
                  Clear filters
                </Button>
              )}
            </StatusMessage>
          ) : (
            <>
              <MealGrid bowls={visible} headingLevel={2} label="Meals" />
              <MealsDisclosure />
            </>
          )}
        </div>
      )}
    </Container>
  )
}
