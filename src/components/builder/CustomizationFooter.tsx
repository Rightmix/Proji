import { Button, Icon } from '../ui'
import { formatInr } from '../../features/builder/pricing'

/** Sticky footer: Next (or Add to Cart on the last step) + View Nutrition. */
export function CustomizationFooter({
  isLast,
  canNext,
  canAddToCart,
  priceMinor,
  onNext,
  onAddToCart,
  onViewNutrition,
}: {
  isLast: boolean
  canNext: boolean
  canAddToCart: boolean
  priceMinor: number
  onNext: () => void
  onAddToCart: () => void
  onViewNutrition: () => void
}) {
  return (
    <div className="flex flex-col items-stretch gap-1">
      {isLast ? (
        <Button size="lg" block onClick={onAddToCart} disabled={!canAddToCart}>
          Add to Cart <span aria-hidden="true">|</span> {formatInr(priceMinor)}
        </Button>
      ) : (
        <Button size="lg" block onClick={onNext} disabled={!canNext}>
          Next <Icon name="arrow-right" className="size-5" />
        </Button>
      )}
      <button
        type="button"
        onClick={onViewNutrition}
        className="min-h-touch text-sm font-semibold text-ink hover:underline"
      >
        View Nutrition
      </button>
    </div>
  )
}
