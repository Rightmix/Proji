import { useId } from 'react'
import { cn } from '../../../lib/cn'
import type { CatalogFilters, FilterOption } from '../filters'
import type { BaseFamily, ProteinType } from '../types'

const chip =
  'inline-flex min-h-touch cursor-pointer items-center rounded-pill border px-4 text-sm font-medium transition-ui ' +
  'has-checked:border-select-500 has-checked:bg-select-50 has-checked:text-select-700 ' +
  'border-line-strong bg-surface text-ink hover:border-ink-muted ' +
  'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus'

function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: FilterOption<T>[]
  value: T | null
  onChange: (v: T | null) => void
}) {
  const name = useId()
  if (options.length < 2) return null
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-label font-semibold uppercase text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {[{ value: null, label: 'All' } as { value: T | null; label: string }, ...options].map(
          (o) => (
            <label key={o.value ?? 'all'} className={chip}>
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          ),
        )}
      </div>
    </fieldset>
  )
}

export function FilterBar({
  filters,
  options,
  onChange,
  className,
}: {
  filters: CatalogFilters
  options: { base: FilterOption<BaseFamily>[]; protein: FilterOption<ProteinType>[] }
  onChange: (f: CatalogFilters) => void
  className?: string
}) {
  return (
    <div role="search" aria-label="Filter bowls" className={cn('flex flex-col gap-4', className)}>
      <ChipGroup
        legend="Base"
        options={options.base}
        value={filters.base}
        onChange={(base) => onChange({ ...filters, base })}
      />
      <ChipGroup
        legend="Protein"
        options={options.protein}
        value={filters.protein}
        onChange={(protein) => onChange({ ...filters, protein })}
      />
      <label className={cn(chip, 'self-start')}>
        <input
          type="checkbox"
          className="sr-only"
          checked={filters.availableOnly}
          onChange={(e) => onChange({ ...filters, availableOnly: e.target.checked })}
        />
        Available now only
      </label>
    </div>
  )
}
