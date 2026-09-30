import { cn } from '../../lib/cn'

/** Compact value + label tile (e.g. macro summaries). Highlight = tinted fill + border, not colour alone. */
export function StatTile({
  value,
  label,
  highlight,
  className,
}: {
  value: string
  label: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={`${value} ${label}`}
      data-highlighted={highlight || undefined}
      className={cn(
        'flex min-w-0 flex-col items-center rounded-md border px-2 py-2 text-center',
        highlight ? 'border-select-500 bg-select-100 text-select-700' : 'border-transparent',
        className,
      )}
    >
      <span
        className={cn(
          'text-base leading-tight tabular-nums',
          highlight ? 'font-bold' : 'font-semibold',
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          'text-label font-medium uppercase',
          highlight ? 'text-select-700' : 'text-ink-muted',
        )}
      >
        {label}
      </span>
    </div>
  )
}
