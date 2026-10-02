import { useId } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../ui'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import { formatAddOn } from '../../features/builder/pricing'
import { LIMITS, selectedIn } from '../../features/builder/selectionRules'
import {
  CATEGORIES,
  type Category,
  type LimitNotice,
  type Selection,
} from '../../features/builder/types'

const COPY: Record<Category, { legend: string; hint: string; sub: string }> = {
  base: { legend: 'Choose Your Base', hint: 'Pick one', sub: 'Pick one base to start' },
  protein: { legend: 'Choose Your Protein', hint: 'Pick one', sub: 'Pick one protein' },
  flavour: { legend: 'Choose Your Flavour', hint: 'Pick up to 2', sub: 'Pick up to 2 flavours' },
  topping: { legend: 'Choose Your Toppings', hint: 'Pick up to 3', sub: 'Pick up to 3 toppings' },
}
const NOUN: Record<'flavour' | 'topping', string> = { flavour: 'flavours', topping: 'toppings' }

/**
 * Stage 5.5 component grid: 3 compact tiles per row (2 when the container is genuinely
 * narrow). Native radio/checkbox inputs keep keyboard + screen-reader semantics; limits
 * come from the Stage 4 rules and the reducer remains the source of truth.
 */
export function IngredientSelector({
  category,
  selection,
  index,
  notice,
  onToggle,
}: {
  category: Category
  selection: Selection
  index: IngredientIndex
  notice: LimitNotice | null
  onToggle: (id: string) => void
}) {
  const name = useId()
  const value = selectedIn(selection, category)
  const single = category === 'base' || category === 'protein'
  const max = LIMITS[category].max
  const atMax = !single && value.length >= max
  const n = CATEGORIES.indexOf(category) + 1
  return (
    <div
      role="tabpanel"
      id={`panel-${category}`}
      aria-labelledby={`tab-${category}`}
      className="@container"
    >
      <fieldset className="min-w-0">
        <legend className="float-left text-base font-semibold">{COPY[category].legend}</legend>
        <span className="float-right mt-0.5 text-xs text-ink-muted" aria-hidden="true">
          {n}/4
        </span>
        <p className="clear-both text-xs text-ink-muted">
          {COPY[category].sub}
          <span className="sr-only">
            {' '}
            ({COPY[category].hint}, step {n} of 4)
          </span>
        </p>
        <div
          className="mt-2 grid grid-cols-3 gap-2 @max-[17rem]:grid-cols-2"
          data-testid="ingredient-grid"
        >
          {index.byCategory[category].map((i) => {
            const selected = value.includes(i.id)
            const blocked = atMax && !selected
            const v = i.values
            return (
              <label
                key={i.id}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center gap-1 rounded-lg border bg-surface p-1.5 pb-2 text-center transition-ui',
                  'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
                  selected
                    ? 'border-action-600 ring-2 ring-action-600'
                    : 'border-line hover:border-line-strong',
                  blocked && 'cursor-not-allowed opacity-45',
                )}
                data-testid="ingredient-tile"
              >
                <input
                  type={single ? 'radio' : 'checkbox'}
                  name={name}
                  value={i.id}
                  checked={selected}
                  disabled={blocked}
                  onChange={() => onToggle(i.id)}
                  className="sr-only"
                />
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-pill bg-action-600 text-ink-inverse"
                  >
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  </span>
                )}
                <img
                  src={i.thumbnailSrc}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full max-w-14 rounded-pill"
                />
                <span className="line-clamp-2 min-h-[2.4em] text-xs font-semibold leading-tight">
                  {i.name}
                </span>
                <span className="text-[0.68rem] font-semibold leading-tight">
                  {v.energyKcal} kcal
                </span>
                <span
                  className="text-[0.62rem] leading-tight text-ink-muted tabular-nums"
                  data-testid="tile-macros"
                >
                  <span className="font-semibold text-select-700">
                    <span aria-hidden="true">P</span>
                    {v.proteinG}g<span className="sr-only"> protein</span>
                  </span>{' '}
                  <span aria-hidden="true">C</span>
                  {v.carbsG}g<span className="sr-only"> carbs</span>{' '}
                  <span aria-hidden="true">F</span>
                  {v.fatG}g<span className="sr-only"> fat</span>
                </span>
                <span className="text-[0.7rem] font-semibold leading-tight">
                  {formatAddOn(v.priceMinor)}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {!single && (atMax || notice?.category === category) && (
        <p role="status" className="mt-3 rounded-md bg-select-50 px-3 py-2 text-sm text-select-700">
          You’ve picked the maximum of {max} {NOUN[category as 'flavour' | 'topping']}. Remove one
          to choose another.
        </p>
      )}
    </div>
  )
}
