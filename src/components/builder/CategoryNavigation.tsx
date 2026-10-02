import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../ui'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import { canVisit, isCategorySatisfied } from '../../features/builder/selectionRules'
import { CATEGORIES, type Category, type Selection } from '../../features/builder/types'
import { STEP_LABEL } from '../../features/builder/stepLabels'

/**
 * Left step rail of the selection workspace (Stage 5.5 refinement, Lola-style interaction).
 * A single highlight slides to the active step; completed steps carry a check badge.
 * ARIA tabs (vertical): arrow keys on both axes, Home/End.
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
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null)
  const active = CATEGORIES.indexOf(step)

  // Measure the active tab so the highlight can slide to it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active]
      if (el) setPill({ top: el.offsetTop, height: el.offsetHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

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
      className="relative flex min-h-full flex-col gap-1.5 rounded-xl bg-select-50 p-1.5"
      onKeyDown={onKey}
      data-testid="step-rail"
    >
      {pill && (
        <span
          aria-hidden="true"
          data-testid="rail-indicator"
          className="rail-indicator absolute inset-x-1.5 rounded-lg bg-action-600 shadow-raised"
          style={{ transform: `translateY(${pill.top - 6}px)`, height: pill.height, top: 6 }}
        />
      )}
      {CATEGORIES.map((c, i) => {
        const isActive = c === step
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
            aria-selected={isActive}
            aria-controls={`panel-${c}`}
            aria-disabled={locked || undefined}
            aria-label={`${STEP_LABEL[c]}${done ? ' (done)' : ''}${locked ? ' (locked)' : ''}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => !locked && onSelect(c)}
            className={cn(
              'relative z-10 flex min-h-13 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[0.66rem] font-semibold leading-tight tracking-tight transition-colors duration-300',
              isActive ? 'text-ink-inverse' : 'text-ink',
              locked ? 'cursor-not-allowed opacity-50' : !isActive && 'hover:bg-select-100',
            )}
          >
            <span className="relative">
              {icon && (
                <img
                  src={icon}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 rounded-pill bg-surface"
                />
              )}
              {done && (
                <span
                  aria-hidden="true"
                  data-testid="step-check"
                  className="absolute -right-1.5 -top-1 grid size-4 place-items-center rounded-pill border border-surface bg-action-600 text-ink-inverse"
                >
                  <Icon name="check" className="size-2.5" strokeWidth={3.5} />
                </span>
              )}
            </span>
            <span>{STEP_LABEL[c]}</span>
          </button>
        )
      })}
    </div>
  )
}
