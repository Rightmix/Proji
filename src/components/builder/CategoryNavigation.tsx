import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { SelectionIndicator } from '../ui'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import { canVisit, isCategorySatisfied } from '../../features/builder/selectionRules'
import { CATEGORIES, type Category, type Selection } from '../../features/builder/types'

const TAB_LABEL: Record<Category, string> = {
  base: 'Base',
  protein: 'Protein',
  flavour: 'Flavour',
  topping: 'Topping',
}

/** BASE / PROTEIN / FLAVOUR / TOPPING tabs (ARIA tabs pattern, roving focus). */
export function CategoryNavigation({
  step,
  selection,
  index,
  onSelect,
}: {
  step: Category
  selection: Selection
  index: IngredientIndex
  onSelect: (c: Category) => void
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent) => {
    const enabled = CATEGORIES.filter((c) => canVisit(selection, c))
    const i = enabled.indexOf(step)
    let next: Category | undefined
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length]
    else if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length]
    else if (e.key === 'Home') next = enabled[0]
    else if (e.key === 'End') next = enabled[enabled.length - 1]
    if (!next) return
    e.preventDefault()
    onSelect(next)
    refs.current[CATEGORIES.indexOf(next)]?.focus()
  }
  return (
    <div
      role="tablist"
      aria-label="Bowl steps"
      className="grid grid-cols-4 gap-2"
      onKeyDown={onKey}
    >
      {CATEGORIES.map((c, i) => {
        const active = c === step
        const locked = !canVisit(selection, c)
        const done = isCategorySatisfied(selection, c)
        const icon = index.byCategory[c][0]?.thumbnailSrc
        return (
          <button
            key={c}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`tab-${c}`}
            aria-selected={active}
            aria-controls={`panel-${c}`}
            aria-disabled={locked || undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => !locked && onSelect(c)}
            className={cn(
              'flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border bg-surface px-1 py-2 transition-ui',
              active ? 'border-select-500 bg-select-50 ring-1 ring-select-500' : 'border-line',
              locked ? 'cursor-not-allowed opacity-60' : 'hover:border-line-strong',
            )}
          >
            <span className="relative grid size-7 place-items-center">
              {done && !active ? (
                <SelectionIndicator selected className="size-7" />
              ) : (
                icon && (
                  <img src={icon} alt="" width={28} height={28} className="size-7 rounded-pill" />
                )
              )}
            </span>
            <span className="text-label font-semibold uppercase">
              {TAB_LABEL[c]}
              {done && <span className="sr-only"> (done)</span>}
              {locked && <span className="sr-only"> (locked)</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
