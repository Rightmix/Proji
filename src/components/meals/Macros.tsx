import { cn } from '../../lib/cn'

export interface MacroValues {
  energyKcal: number
  proteinG: number
  carbsG: number
  fatG: number
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
const DOT = { protein: 'bg-macro-protein', carbs: 'bg-macro-carbs', fat: 'bg-macro-fat' } as const

function Macro({ kind, grams, label }: { kind: keyof typeof DOT; grams: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span aria-hidden="true" className={cn('size-1.5 rounded-pill', DOT[kind])} />
      {fmt(grams)}g<span className="sr-only"> {label}</span>
    </span>
  )
}

/** Compact "520 kcal · ●34g ●68g ●18g" line used on cards, cart and summaries. */
export function MacroLine({
  values,
  className,
  showKcal = true,
}: {
  values: MacroValues
  className?: string
  showKcal?: boolean
}) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-ink-muted',
        className,
      )}
    >
      {showKcal && <span className="font-semibold text-ink">{fmt(values.energyKcal)} kcal</span>}
      <Macro kind="protein" grams={values.proteinG} label="protein" />
      <Macro kind="carbs" grams={values.carbsG} label="carbs" />
      <Macro kind="fat" grams={values.fatG} label="fat" />
    </p>
  )
}

/** Small label that marks every estimate as illustrative (data-safety requirement). */
export function IllustrativeTag({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-[0.65rem] font-medium uppercase tracking-wide text-ink-muted', className)}
      data-testid="illustrative-tag"
    >
      Illustrative
    </span>
  )
}
