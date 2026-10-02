import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../ui'
import { AvailabilityBadge } from '../../features/catalog/components/CatalogBits'
import type { SignatureBowl } from '../../features/catalog/types'
import { estimateBowl } from '../../features/meals/mealEstimate'
import { toggleFavourite, useFavourites } from '../../features/meals/favourites'
import { addToCart } from '../../features/cart/cartStore'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import { formatInr } from '../../features/builder/pricing'
import { cn } from '../../lib/cn'
import { IllustrativeTag, MacroLine } from './Macros'
import { MealImage } from './MealImage'

/** Vertical meal card for 2-per-row grids (approved Stage 5.5 design). */
export function MealCard({
  bowl,
  headingLevel = 3,
  priority,
}: {
  bowl: SignatureBowl
  headingLevel?: 2 | 3
  priority?: boolean
}) {
  const estimate = useMemo(() => estimateBowl(bowl, IDX), [bowl])
  const favourites = useFavourites()
  const fav = favourites.includes(bowl.slug)
  const [added, setAdded] = useState(false)
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const available = bowl.availability.state === 'available'
  const canAdd = available && estimate.status === 'illustrative'

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus">
      <MealImage
        bowl={bowl}
        estimate={estimate}
        priority={priority}
        className="aspect-[5/4] w-full"
      />
      <button
        type="button"
        onClick={() => toggleFavourite(bowl.slug)}
        aria-pressed={fav}
        aria-label={`${fav ? 'Remove' : 'Save'} ${bowl.name} ${fav ? 'from' : 'to'} favourites`}
        className="absolute right-1.5 top-1.5 z-10 grid size-touch place-items-center rounded-pill"
      >
        <span
          className={cn(
            'grid size-8 place-items-center rounded-pill bg-surface/90 shadow-card',
            fav ? 'text-danger' : 'text-ink',
          )}
        >
          <Icon name="heart" className="size-4" fill={fav ? 'currentColor' : 'none'} />
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex flex-wrap gap-1">
          {available ? (
            <span className="sr-only">Available</span>
          ) : (
            <AvailabilityBadge state={bowl.availability.state} />
          )}
          {bowl.dataStatus === 'development-fixture' && (
            <span className="rounded-pill border border-dashed border-ink-muted px-1.5 text-[0.6rem] font-semibold text-ink-muted">
              Development sample
            </span>
          )}
        </div>
        <Heading className="line-clamp-2 text-sm font-semibold leading-snug">
          <Link
            to={`/menu/${bowl.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {bowl.name}
          </Link>
        </Heading>
        {estimate.status === 'illustrative' ? (
          <>
            <MacroLine values={estimate.nutrition} />
            <div className="mt-auto flex items-center justify-between gap-1 pt-1">
              <p className="text-sm font-bold tabular-nums">
                {formatInr(estimate.priceMinor)} <IllustrativeTag className="block" />
              </p>
              {canAdd && (
                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      name: bowl.name,
                      mealSlug: bowl.slug,
                      configuration: estimate.configuration,
                    })
                    setAdded(true)
                  }}
                  aria-label={`Add ${bowl.name} to cart`}
                  className="relative z-10 grid size-touch place-items-center"
                >
                  <span className="grid size-8 place-items-center rounded-pill bg-action-600 text-ink-inverse shadow-card hover:bg-action-700">
                    <Icon name={added ? 'check' : 'plus'} className="size-4" strokeWidth={3} />
                  </span>
                </button>
              )}
            </div>
            {added && (
              <p role="status" className="sr-only">
                {bowl.name} added to cart
              </p>
            )}
          </>
        ) : (
          <p className="mt-auto text-xs text-ink-muted">{bowl.summary} · Nutrition pending</p>
        )}
      </div>
    </article>
  )
}
