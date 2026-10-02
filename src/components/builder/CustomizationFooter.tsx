import { Button, Icon } from '../ui'
import { formatInr } from '../../features/builder/pricing'
import type { NutritionTotals } from '../../features/builder/nutrition'
import { MacroLine } from '../meals/Macros'
import { STEP_LABEL } from '../../features/builder/stepLabels'
import { CATEGORIES, type Category } from '../../features/builder/types'

/** Sticky summary: live price + macros, then "Next: <step>" or "Add to Cart". */
export function CustomizationFooter({
  step,
  canNext,
  canAddToCart,
  priceMinor,
  nutrition,
  onNext,
  onAddToCart,
  onViewNutrition,
  onSave,
}: {
  step: Category
  canNext: boolean
  canAddToCart: boolean
  priceMinor: number
  nutrition: NutritionTotals
  onNext: () => void
  onAddToCart: () => void
  onViewNutrition: () => void
  onSave?: () => void
}) {
  const isLast = step === 'topping'
  const nextStep = CATEGORIES[CATEGORIES.indexOf(step) + 1]
  return (
    <div className="flex flex-col items-stretch gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-bold tabular-nums" aria-live="polite" data-testid="live-price">
          <span className="sr-only">Illustrative price </span>
          {formatInr(priceMinor)}
        </p>
        <MacroLine values={nutrition} className="justify-end" />
      </div>
      {isLast ? (
        <Button size="lg" block onClick={onAddToCart} disabled={!canAddToCart}>
          Add to Cart <Icon name="arrow-right" className="size-5" />
        </Button>
      ) : (
        <Button size="lg" block onClick={onNext} disabled={!canNext}>
          Next: {STEP_LABEL[nextStep]} <Icon name="arrow-right" className="size-5" />
        </Button>
      )}
      <div className="flex justify-center gap-6">
        <button
          type="button"
          onClick={onViewNutrition}
          className="min-h-touch text-sm font-semibold text-ink hover:underline"
        >
          View Nutrition
        </button>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="min-h-touch text-sm font-semibold text-action-600 hover:underline"
          >
            Save bowl
          </button>
        )}
      </div>
    </div>
  )
}
