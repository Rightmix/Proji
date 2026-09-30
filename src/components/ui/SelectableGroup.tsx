import { createContext, useContext, useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Label } from './Label'
import { SelectionIndicator } from './SelectionIndicator'

type Mode = 'single' | 'multiple'
interface GroupCtx {
  name: string
  mode: Mode
  value: readonly string[]
  atMax: boolean
  toggle: (v: string) => void
}
const Ctx = createContext<GroupCtx | null>(null)

export interface SelectableGroupProps {
  legend: string
  /** Visual hint shown beside the legend, e.g. "Pick one" / "Pick up to 2". */
  hint?: string
  mode: Mode
  /** Max selections for `multiple` mode. */
  max?: number
  value: readonly string[]
  onChange: (next: string[]) => void
  children: ReactNode
  className?: string
}

/**
 * Accessible single/multi-select built on native radio/checkbox inputs
 * (keyboard, arrow-key and screen-reader behaviour come from the platform).
 * Presentation only — selection rules for the bowl builder belong to Stage 4.
 */
export function SelectableGroup({
  legend,
  hint,
  mode,
  max,
  value,
  onChange,
  children,
  className,
}: SelectableGroupProps) {
  const name = useId()
  const atMax = mode === 'multiple' && max !== undefined && value.length >= max
  const toggle = (v: string) => {
    if (mode === 'single') return onChange([v])
    if (value.includes(v)) return onChange(value.filter((x) => x !== v))
    if (!atMax) onChange([...value, v])
  }
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="float-left mb-3 text-base font-semibold">{legend}</legend>
      {hint && <Label className="float-right mt-1">{hint}</Label>}
      <div className="clear-both flex flex-col gap-2.5">
        <Ctx.Provider value={{ name, mode, value, atMax, toggle }}>{children}</Ctx.Provider>
      </div>
    </fieldset>
  )
}

export interface SelectableCardProps {
  value: string
  title: string
  description?: string
  meta?: ReactNode
  media?: ReactNode
  disabled?: boolean
}

export function SelectableCard({
  value,
  title,
  description,
  meta,
  media,
  disabled,
}: SelectableCardProps) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('SelectableCard must be inside SelectableGroup')
  const selected = ctx.value.includes(value)
  const blocked = disabled || (ctx.atMax && !selected)
  return (
    <label
      className={cn(
        'flex min-h-touch cursor-pointer items-center gap-3 rounded-md border bg-surface p-3 transition-ui',
        'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
        selected
          ? 'border-select-500 bg-select-50 ring-1 ring-select-500'
          : 'border-line hover:border-line-strong',
        blocked && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        type={ctx.mode === 'single' ? 'radio' : 'checkbox'}
        name={ctx.name}
        value={value}
        checked={selected}
        disabled={blocked}
        onChange={() => ctx.toggle(value)}
        className="sr-only"
      />
      {media}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug">{title}</span>
        {description && <span className="block text-sm text-ink-muted">{description}</span>}
        {meta && <span className="mt-0.5 block text-xs text-ink-muted">{meta}</span>}
      </span>
      <SelectionIndicator selected={selected} />
    </label>
  )
}
