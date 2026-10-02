import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../ui'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import { canVisit, isCategorySatisfied } from '../../features/builder/selectionRules'
import { CATEGORIES, type Category, type Selection } from '../../features/builder/types'
import { STEP_LABEL } from '../../features/builder/stepLabels'

/**
 * Stage 5.5 left vertical step rail (ARIA tabs, vertical). Completed steps show a check;
 * the active step gets the strong PROJI-green treatment. Arrow keys (both axes), Home/End.
 */
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
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length]
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
      next = enabled[(i - 1 + enabled.length) % enabled.length]
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
      aria-orientation="vertical"
      className="flex flex-col items-center gap-3"
      onKeyDown={onKey}
      data-testid="step-rail"
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
              'flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.68rem] font-semibold transition-ui',
              active ? 'bg-action-600 text-ink-inverse shadow-raised' : 'text-ink',
              locked ? 'cursor-not-allowed opacity-50' : !active && 'hover:bg-surface-muted',
            )}
          >
            <span
              className={cn(
                'grid size-9 place-items-center rounded-pill',
                active
                  ? 'bg-ink-inverse/20'
                  : done
                    ? 'bg-action-600 text-ink-inverse'
                    : 'bg-surface-muted',
              )}
            >
              {done && !active ? (
                <Icon name="check" className="size-4" strokeWidth={3} />
              ) : (
                icon && (
                  <img src={icon} alt="" width={28} height={28} className="size-7 rounded-pill" />
                )
              )}
            </span>
            <span>
              {STEP_LABEL[c]}
              {done && <span className="sr-only"> (done)</span>}
              {locked && <span className="sr-only"> (locked)</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
