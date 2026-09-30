import { cn } from '../../../lib/cn'
import { BowlSurface, ResponsiveImage } from '../../../components/ui'
import type { AvailabilityState, SignatureBowl } from '../types'

const AVAILABILITY: Record<AvailabilityState, { label: string; tone: string }> = {
  available: { label: 'Available', tone: 'border-select-500 bg-select-50 text-select-700' },
  'sold-out': { label: 'Sold out', tone: 'border-line-strong bg-surface-muted text-ink' },
  'coming-soon': { label: 'Coming soon', tone: 'border-beige bg-beige/30 text-ink' },
  unavailable: { label: 'Unavailable', tone: 'border-line-strong bg-surface-muted text-ink-muted' },
}

/** Availability as text + tone (never colour alone). */
export function AvailabilityBadge({
  state,
  className,
}: {
  state: AvailabilityState
  className?: string
}) {
  const a = AVAILABILITY[state]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-semibold',
        a.tone,
        className,
      )}
    >
      {a.label}
    </span>
  )
}

/** Visible label for development fixtures so they cannot be mistaken for production data. */
export function FixtureBadge({ bowl, className }: { bowl: SignatureBowl; className?: string }) {
  if (bowl.dataStatus !== 'development-fixture') return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border border-dashed border-ink-muted px-2.5 py-0.5 text-xs font-semibold text-ink-muted',
        className,
      )}
    >
      Development sample
    </span>
  )
}

/** Bowl image with safe fallback (no image or failed load) on a fixed aspect ratio. */
export function BowlImage({
  bowl,
  priority,
  className,
}: {
  bowl: SignatureBowl
  priority?: boolean
  className?: string
}) {
  const frame = cn('aspect-[4/3] w-full overflow-hidden bg-surface-muted', className)
  if (!bowl.image) {
    return (
      <div
        role="img"
        aria-label={`${bowl.name} — image coming soon`}
        className={cn(frame, 'grid place-items-center')}
      >
        <BowlSurface className="w-2/5" />
      </div>
    )
  }
  return (
    <div className={frame}>
      <ResponsiveImage
        asset={{ ...bowl.image, alt: bowl.image.alt }}
        priority={priority}
        className="size-full object-cover"
      />
    </div>
  )
}
