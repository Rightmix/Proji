import type { ReactNode } from 'react'
import { useBack } from '../../lib/useBack'
import { Icon } from '../ui'
import { cn } from '../../lib/cn'

export function BackButton({
  fallback,
  label = 'Back',
  className,
}: {
  fallback: string
  label?: string
  className?: string
}) {
  const back = useBack(fallback)
  return (
    <button
      type="button"
      onClick={back}
      aria-label={label}
      className={cn(
        'grid size-touch shrink-0 place-items-center rounded-pill text-ink hover:bg-surface-muted',
        className,
      )}
    >
      <Icon name="arrow-left" className="size-5" />
    </button>
  )
}

/** Secondary-screen header: top-left back arrow, centred title, optional right actions. */
export function BackHeader({
  title,
  subtitle,
  fallback,
  right,
  backLabel,
  className,
}: {
  title: string
  subtitle?: ReactNode
  fallback: string
  right?: ReactNode
  backLabel?: string
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-[2.75rem_1fr_auto] items-center gap-1 py-2', className)}>
      <BackButton fallback={fallback} label={backLabel} />
      <div className="min-w-0 text-center">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>
      <div className="flex min-w-touch justify-end">{right}</div>
    </div>
  )
}
