import '../../styles/bowl-builder.css'
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
  label,
}: {
  layers: readonly BowlLayer[]
  reducedMotion: boolean
  className?: string
  /** Override the accessible name (e.g. meal card previews). */
  label?: string
}) {
  const computed = layers.length
    ? `Your bowl: ${layers.map((l) => l.name).join(', ')}`
    : 'Your bowl is empty'
  return (
    <div
      role="img"
      aria-label={label ?? computed}
      className={cn('relative isolate', className)}
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
