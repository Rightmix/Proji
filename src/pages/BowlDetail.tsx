import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink, Card, Container, Icon, Label } from '../components/ui'
import { BackButton } from '../components/shell/BackHeader'
import { MealImage } from '../components/meals/MealImage'
import { IllustrativeTag, MacroLine } from '../components/meals/Macros'
import { NutritionDetails } from '../components/builder/NutritionDetails'
import { estimateBowl } from '../features/meals/mealEstimate'
import { toggleFavourite, useFavourites } from '../features/meals/favourites'
import { defaultIngredientIndex as IDX } from '../features/builder/ingredientRepository'
import { computePrice, formatInr } from '../features/builder/pricing'
import { computeNutrition, selectedIngredients } from '../features/builder/nutrition'
import { BASE_FAMILIES, PROTEIN_TYPES } from '../features/catalog/types'
import { cn } from '../lib/cn'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { COMPONENT_ROLES, type ComponentRole, type SignatureBowl } from '../features/catalog'
import { AvailabilityBadge, FixtureBadge } from '../features/catalog/components/CatalogBits'
import { DevDataNotice, StatusMessage } from '../features/catalog/components/Notices'

const ROLE_LABEL: Record<ComponentRole, string> = {
  base: 'Base',
  protein: 'Protein',
  flavour: 'Flavour',
  vegetable: 'Vegetables',
  topping: 'Toppings',
  accompaniment: 'On the side',
}

function Pending({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <dt className="font-medium">{label}</dt>
      <dd className="text-sm text-ink-muted">Pending validation</dd>
    </div>
  )
}

function Facts({ bowl }: { bowl: SignatureBowl }) {
  // Validated values are rendered by Stage 7; Stage 3 never displays unvalidated figures.
  const rows: [string, SignatureBowl['nutrition' | 'price' | 'allergens']][] = [
    ['Price', bowl.price],
    ['Nutrition', bowl.nutrition],
    ['Allergens', bowl.allergens],
  ]
  return (
    <Card tone="canvas" className="px-4">
      <dl>
        {rows.map(([label, v]) =>
          v.status === 'unavailable' ? (
            <Pending key={label} label={label} />
          ) : (
            <div
              key={label}
              className="flex justify-between gap-3 border-b border-line py-3 last:border-0"
            >
              <dt className="font-medium">{label}</dt>
              <dd className="text-sm">Validated — shown from Stage 7</dd>
            </div>
          ),
        )}
      </dl>
    </Card>
  )
}

export default function BowlDetail() {
  const { slug = '' } = useParams()
  const { state, retry } = useCatalogQuery((r) => r.getBowl(slug), `bowl:${slug}`)
  const favourites = useFavourites()
  const bowl = state.status === 'ready' ? state.data : null
  const estimate = useMemo(() => (bowl ? estimateBowl(bowl, IDX) : null), [bowl])
  const back = (
    <Link
      to="/menu"
      className="inline-flex min-h-touch items-center gap-1 text-sm font-medium text-action-600 hover:underline"
    >
      <Icon name="arrow-left" className="size-4" /> Back to menu
    </Link>
  )

  if (state.status === 'loading')
    return (
      <Container className="py-6">
        {back}
        <p role="status" className="mt-6 text-ink-muted">
          Loading bowl…
        </p>
      </Container>
    )
  if (state.status === 'error')
    return (
      <Container className="py-6">
        {back}
        <div role="alert" className="mt-6 rounded-lg border border-danger/40 bg-surface p-6">
          <p className="font-semibold">We couldn’t load this bowl.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Retry
          </Button>
        </div>
      </Container>
    )
  if (!bowl || !estimate)
    return (
      <Container className="py-6">
        {back}
        <h1 className="mt-4 font-display text-title font-semibold">Bowl not found</h1>
        <p className="mt-2 text-ink-muted">This bowl isn’t on the menu.</p>
      </Container>
    )

  const available = bowl.availability.state === 'available'
  const fav = favourites.includes(bowl.slug)
  const groups = COMPONENT_ROLES.map((role) => ({
    role,
    items: bowl.components.filter((c) => c.role === role),
  })).filter((g) => g.items.length)
  const share = async () => {
    const url = `${window.location.origin}/menu/${bowl.slug}`
    try {
      if (navigator.share) await navigator.share({ title: bowl.name, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* user cancelled or unsupported */
    }
  }
  const est = estimate.status === 'illustrative' ? estimate : null

  return (
    <div className="pb-28 md:pb-10">
      <div className="relative mx-auto max-w-3xl md:mt-6 md:px-6">
        <MealImage
          bowl={bowl}
          estimate={estimate}
          priority
          className="aspect-[4/3] w-full md:rounded-xl"
        />
        <div className="absolute inset-x-3 top-3 flex justify-between pt-safe md:inset-x-9">
          <BackButton fallback="/menu" label="Back" className="bg-surface/90 shadow-card" />
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={fav}
              aria-label={`${fav ? 'Remove' : 'Save'} ${bowl.name} ${fav ? 'from' : 'to'} favourites`}
              onClick={() => toggleFavourite(bowl.slug)}
              className={cn(
                'grid size-touch place-items-center rounded-pill bg-surface/90 shadow-card',
                fav && 'text-danger',
              )}
            >
              <Icon name="heart" className="size-5" fill={fav ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              aria-label={`Share ${bowl.name}`}
              onClick={() => void share()}
              className="grid size-touch place-items-center rounded-pill bg-surface/90 shadow-card"
            >
              <Icon name="share" className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <Container className="relative -mt-5 max-w-3xl rounded-t-xl bg-canvas pt-5 md:mt-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            <AvailabilityBadge state={bowl.availability.state} />
            <FixtureBadge bowl={bowl} />
          </div>
          <div>
            <h1 className="font-display text-title font-semibold sm:text-4xl">{bowl.name}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {BASE_FAMILIES[bowl.baseFamily]} · {PROTEIN_TYPES[bowl.proteinType]}
            </p>
          </div>
          {est ? (
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1"
              data-testid="meal-estimate"
            >
              <MacroLine values={est.nutrition} className="text-sm" />
              <IllustrativeTag />
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Nutrition pending: some components aren’t in our ingredient list yet.
            </p>
          )}
          <p className="text-ink-muted">{bowl.description}</p>
          {bowl.dataStatus === 'development-fixture' && <DevDataNotice />}

          <section aria-labelledby="components-title">
            <div className="flex items-baseline justify-between">
              <h2 id="components-title" className="text-lg font-semibold">
                This includes
              </h2>
              {available && (
                <Link
                  to={`/build?bowl=${encodeURIComponent(bowl.slug)}`}
                  className="inline-flex min-h-touch items-center text-sm font-semibold text-action-600"
                  aria-label={`Customise ${bowl.name}`}
                >
                  Customize
                </Link>
              )}
            </div>
            <dl className="mt-2 flex flex-col gap-2">
              {groups.map((g) => (
                <div key={g.role}>
                  <dt>
                    <Label>{ROLE_LABEL[g.role]}</Label>
                  </dt>
                  {g.items.map((c) => {
                    const ing = IDX.byId.get(c.ingredientId)
                    return (
                      <dd key={c.ingredientId} className="mt-1">
                        <details className="group rounded-md border border-line bg-surface">
                          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 p-2 [&::-webkit-details-marker]:hidden">
                            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-pill bg-surface-muted">
                              {ing && (
                                <img
                                  src={ing.thumbnailSrc}
                                  alt=""
                                  width={44}
                                  height={44}
                                  loading="lazy"
                                  className="size-11"
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">{c.name}</span>
                              <span className="block text-xs text-ink-muted">
                                {ing
                                  ? `${ing.values.energyKcal} kcal · illustrative`
                                  : 'Details pending'}
                              </span>
                            </span>
                            <Icon
                              name="chevron-right"
                              className="size-4 text-ink-muted transition-ui group-open:rotate-90"
                            />
                          </summary>
                          <div className="border-t border-line px-3 py-2 text-sm">
                            {ing ? (
                              <MacroLine values={ing.values} />
                            ) : (
                              <p className="text-ink-muted">
                                Recipe quantities and nutrition will be added with validated
                                recipes.
                              </p>
                            )}
                          </div>
                        </details>
                      </dd>
                    )
                  })}
                </div>
              ))}
            </dl>
          </section>

          {est && (
            <section aria-labelledby="nutrition-title">
              <h2 id="nutrition-title" className="mb-2 text-lg font-semibold">
                Ingredients &amp; nutrition
              </h2>
              <NutritionDetails
                items={selectedIngredients(est.selection, IDX)}
                totals={computeNutrition(est.selection, IDX)}
                price={computePrice(est.selection, IDX)}
              />
            </section>
          )}

          <section aria-labelledby="facts-title">
            <h2 id="facts-title" className="mb-3 text-lg font-semibold">
              Validated price, nutrition &amp; allergens
            </h2>
            <Facts bowl={bowl} />
          </section>

          {!available && (
            <StatusMessage
              title={`This bowl is ${bowl.availability.state === 'coming-soon' ? 'coming soon' : 'not available right now'}`}
            />
          )}
        </div>
      </Container>

      {available && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-safe backdrop-blur">
          <Container className="flex max-w-3xl items-center justify-between gap-3 py-3">
            {est && (
              <p className="text-lg font-bold tabular-nums">
                {formatInr(est.priceMinor)} <IllustrativeTag className="block" />
              </p>
            )}
            <ButtonLink
              to={`/build?bowl=${encodeURIComponent(bowl.slug)}`}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Customize This Bowl <Icon name="arrow-right" className="size-5" />
            </ButtonLink>
          </Container>
        </div>
      )}
    </div>
  )
}
