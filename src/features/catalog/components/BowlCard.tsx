import { Link } from 'react-router-dom'
import type { SignatureBowl } from '../types'
import { AvailabilityBadge, BowlImage, FixtureBadge } from './CatalogBits'

/** Catalog card. Whole card is one link to the detail page. */
export function BowlCard({ bowl }: { bowl: SignatureBowl }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-ui hover:shadow-raised has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <BowlImage bowl={bowl} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          <AvailabilityBadge state={bowl.availability.state} />
          <FixtureBadge bowl={bowl} />
        </div>
        <h2 className="text-lg font-semibold leading-snug">
          <Link
            to={`/menu/${bowl.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {bowl.name}
          </Link>
        </h2>
        <p className="text-sm text-ink-muted">{bowl.summary}</p>
      </div>
    </article>
  )
}
