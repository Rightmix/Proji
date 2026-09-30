import { cn } from '../../lib/cn'
import { Icon } from './Icon'

/** Circular check shown on selectable cards/tiles. Purely visual; state lives on the input. */
export function SelectionIndicator({
  selected,
  className,
}: {
  selected: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-pill border-2 transition-ui',
        selected
          ? 'border-select-500 bg-select-500 text-ink-inverse'
          : 'border-line-strong bg-surface',
        className,
      )}
    >
      {selected && <Icon name="check" className="size-3.5" strokeWidth={3} />}
    </span>
  )
}
