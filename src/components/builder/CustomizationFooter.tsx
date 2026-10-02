import { Button, Icon } from '../ui'
import { formatInr } from '../../features/builder/pricing'
import type { NutritionTotals } from '../../features/builder/nutrition'
import { STEP_LABEL } from '../../features/builder/stepLabels'
import { CATEGORIES, type Category } from '../../features/builder/types'

const g = (n: number) => (Number.isInteger(n) ? n : n.toFixed(1))

/** Sticky summary: "₹240 · 520 kcal · P 38g · C 61g · F 14g", then Next: <step> / Add to Cart. */
export function CustomizationFooter({
  step,
  canNext,
  canAddToCart,
  priceMinor,
  nutrition,
  onNext,
  onAddToCart,
}: {
  step: Category
  canNext: boolean
  canAddToCart: boolean
  priceMinor: number
  nutrition: NutritionTotals
  onNext: () => void
  onAddToCart: () => void
}) {
  const isLast = step === 'topping'
  const nextStep = CATEGORIES[CATEGORIES.indexOf(step) + 1]
  return (
    <div className="flex flex-col items-stretch gap-2">
      <p
        className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums max-[359px]:gap-x-1 max-[359px]:text-xs"
        aria-live="polite"
        data-testid="builder-summary"
      >
        <span className="text-lg font-bold max-[359px]:text-base" data-testid="live-price">
          <span className="sr-only">Illustrative price </span>
          {formatInr(priceMinor)}
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold">{nutrition.energyKcal} kcal</span>
        <span aria-hidden="true">·</span>
        <span>
          <span aria-hidden="true">P </span>
          {g(nutrition.proteinG)}g<span className="sr-only"> protein</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <span aria-hidden="true">C </span>
          {g(nutrition.carbsG)}g<span className="sr-only"> carbs</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <span aria-hidden="true">F </span>
          {g(nutrition.fatG)}g<span className="sr-only"> fat</span>
        </span>
      </p>
      {isLast ? (
        <Button size="lg" block onClick={onAddToCart} disabled={!canAddToCart}>
          Add to Cart <Icon name="arrow-right" className="size-5" />
        </Button>
      ) : (
        <Button size="lg" block onClick={onNext} disabled={!canNext}>
          Next: {STEP_LABEL[nextStep]} <Icon name="arrow-right" className="size-5" />
        </Button>
      )}
    </div>
  )
}
