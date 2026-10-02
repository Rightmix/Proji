import { useMemo } from 'react'
import { BowlSurface, ResponsiveImage } from '../ui'
import { BowlRenderer } from '../builder/BowlRenderer'
import { buildLayers } from '../../features/builder/layerOrdering'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import type { SignatureBowl } from '../../features/catalog/types'
import type { MealEstimate } from '../../features/meals/mealEstimate'
import { cn } from '../../lib/cn'

/**
 * Meal visual: real photo when the catalog has one; otherwise a static composite of the
 * prototype builder layers (clearly prototype art); otherwise a neutral bowl placeholder.
 */
export function MealImage({
  bowl,
  estimate,
  priority,
  className,
}: {
  bowl: SignatureBowl
  estimate: MealEstimate
  priority?: boolean
  className?: string
}) {
  const layers = useMemo(
    () => (estimate.status === 'illustrative' ? buildLayers(estimate.selection, IDX) : []),
    [estimate],
  )
  const frame = cn('relative overflow-hidden bg-[#efe9df]', className)
  if (bowl.image)
    return (
      <div className={frame}>
        <ResponsiveImage
          asset={bowl.image}
          priority={priority}
          className="size-full object-cover"
        />
      </div>
    )
  if (layers.length)
    return (
      <div className={cn(frame, 'grid place-items-center')}>
        <BowlRenderer
          layers={layers}
          reducedMotion
          className="w-[78%]"
          label={`${bowl.name} — prototype illustration`}
        />
      </div>
    )
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
