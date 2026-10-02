import type { SignatureBowl } from '../../features/catalog/types'
import { MealCard } from './MealCard'

/** Two vertical cards per row on mobile; more columns as space allows. */
export function MealGrid({
  bowls,
  headingLevel = 3,
  label,
}: {
  bowls: readonly SignatureBowl[]
  headingLevel?: 2 | 3
  label?: string
}) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      data-testid="meal-grid"
    >
      {bowls.map((b, i) => (
        <li key={b.id}>
          <MealCard bowl={b} headingLevel={headingLevel} priority={i < 2} />
        </li>
      ))}
    </ul>
  )
}

export function MealsDisclosure() {
  return (
    <p className="text-xs text-ink-muted" data-testid="prototype-notice">
      <strong className="font-semibold text-ink">Prototype:</strong> prices &amp; nutrition are
      illustrative estimates, not validated.
    </p>
  )
}
