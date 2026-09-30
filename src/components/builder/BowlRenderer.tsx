import { BowlSurface } from '../ui'
import type { BowlLayer } from '../../features/builder/layerOrdering'
import { cn } from '../../lib/cn'
import { AnimatedIngredientLayer } from './AnimatedIngredientLayer'

/**
 * Deterministic layered bowl: stable matte-black bowl + one layer per selected
 * ingredient, stacked by z-index. Only selected layers are rendered.
 */
export function BowlRenderer({
  layers,
  reducedMotion,
  className,
}: {
  layers: readonly BowlLayer[]
  reducedMotion: boolean
  className?: string
}) {
  const label = layers.length
    ? `Your bowl: ${layers.map((l) => l.name).join(', ')}`
    : 'Your bowl is empty'
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative', className)}
      data-testid="bowl-renderer"
    >
      <BowlSurface
        emptyLabel={layers.length ? undefined : 'Your bowl builds here'}
        className={cn(!layers.length && !reducedMotion && 'bowl-empty-float')}
      >
        {layers.length ? (
          <div className="absolute inset-0">
            {layers.map((l) => (
              <AnimatedIngredientLayer key={l.key} layer={l} reducedMotion={reducedMotion} />
            ))}
          </div>
        ) : undefined}
      </BowlSurface>
    </div>
  )
}
