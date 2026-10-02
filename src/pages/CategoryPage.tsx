import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Container, Icon } from '../components/ui'
import { BackHeader } from '../components/shell/BackHeader'
import { MealGrid, MealsDisclosure } from '../components/meals/MealGrid'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { PROTEIN_TYPES, type ProteinType } from '../features/catalog/types'
import { findCategory, matchesSearch } from '../features/meals/categories'
import { estimateBowl } from '../features/meals/mealEstimate'
import { defaultIngredientIndex as IDX } from '../features/builder/ingredientRepository'
import { cn } from '../lib/cn'

const chip =
  'relative inline-flex min-h-touch shrink-0 cursor-pointer items-center rounded-pill border px-4 text-sm font-medium transition-ui ' +
  'has-checked:border-action-600 has-checked:bg-action-600 has-checked:text-ink-inverse border-line bg-surface ' +
  'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus'

/** Category browsing: back arrow, title + count, search, protein chips, 2-column grid. */
export default function CategoryPage() {
  const { id = 'all' } = useParams()
  const [params, setParams] = useSearchParams()
  const category = id === 'all' ? null : findCategory(id)
  const q = params.get('q') ?? ''
  const protein = params.get('protein')
  const [searchOpen, setSearchOpen] = useState(Boolean(q))
  const { state } = useCatalogQuery((r) => r.listBowls(), 'list')

  const inCategory = useMemo(() => {
    const bowls = state.status === 'ready' ? state.data : []
    return bowls.filter((b) => !category || category.matches(b, estimateBowl(b, IDX)))
  }, [state, category])
  const proteins = (Object.keys(PROTEIN_TYPES) as ProteinType[]).filter((p) =>
    inCategory.some((b) => b.proteinType === p),
  )
  const visible = inCategory.filter(
    (b) => (!protein || b.proteinType === protein) && matchesSearch(b, q),
  )
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  if (id !== 'all' && !category)
    return (
      <Container className="pt-1">
        <BackHeader title="Category not found" fallback="/" />
      </Container>
    )

  const title = category?.label ?? 'All meals'
  return (
    <Container className="flex flex-col gap-3 pb-8 pt-1 md:pt-6">
      <BackHeader
        title={title}
        subtitle={
          state.status === 'ready'
            ? `${visible.length} ${visible.length === 1 ? 'meal' : 'meals'}`
            : undefined
        }
        fallback="/"
        right={
          <button
            type="button"
            aria-label={searchOpen ? 'Hide search' : 'Search meals'}
            aria-expanded={searchOpen}
            aria-controls="category-search"
            onClick={() => setSearchOpen((o) => !o)}
            className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
          >
            <Icon name="search" className="size-5" />
          </button>
        }
      />
      {searchOpen && (
        <div id="category-search">
          <label htmlFor="cat-q" className="sr-only">
            Search {title}
          </label>
          <input
            id="cat-q"
            type="search"
            autoFocus
            value={q}
            onChange={(e) => set('q', e.target.value || null)}
            placeholder="Search meals, ingredients…"
            className="block min-h-touch w-full rounded-pill border border-line bg-surface px-4 text-base shadow-card focus:border-action-600"
          />
        </div>
      )}
      {proteins.length > 1 && (
        <fieldset className="min-w-0">
          <legend className="sr-only">Filter by protein</legend>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[null, ...proteins].map((p) => (
              <label key={p ?? 'all'} className={chip}>
                <input
                  type="radio"
                  name="protein"
                  className="sr-only"
                  checked={protein === p}
                  onChange={() => set('protein', p)}
                />
                {p ? (p === 'vegetarian' ? 'Veg' : PROTEIN_TYPES[p]) : 'All'}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {category?.note && <p className="text-xs text-ink-muted">{category.note}</p>}
      {state.status === 'loading' ? (
        <p role="status" className="text-ink-muted">
          Loading meals…
        </p>
      ) : state.status === 'error' ? (
        <p role="alert">We couldn’t load meals right now.</p>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          <h2 className="font-semibold">No meals found</h2>
          <p className={cn('mt-1 text-sm text-ink-muted')}>Try another filter or search.</p>
        </div>
      ) : (
        <>
          <MealGrid bowls={visible} headingLevel={2} label={title} />
          <MealsDisclosure />
        </>
      )}
    </Container>
  )
}
