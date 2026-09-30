import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Matte-black overhead bowl frame. Stage 4 renders ingredient layers as `children`
 * (absolutely positioned, same square canvas). No builder logic here.
 */
export function BowlSurface({
  children,
  emptyLabel,
  className,
}: {
  children?: ReactNode
  emptyLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative aspect-square rounded-pill bg-bowl-800 shadow-bowl',
        'bg-[radial-gradient(circle_at_50%_45%,var(--color-bowl-700)_0%,var(--color-bowl-800)_55%,var(--color-bowl-900)_100%)]',
        className,
      )}
    >
      <div className="absolute inset-[7%] overflow-hidden rounded-pill bg-bowl-900 shadow-[inset_0_6px_18px_rgb(0_0_0/0.6)]">
        {children}
        {!children && emptyLabel && (
          <span className="absolute inset-0 grid place-items-center px-[18%] text-center text-label font-medium uppercase tracking-[0.25em] text-ink-inverse/80">
            {emptyLabel}
          </span>
        )}
      </div>
    </div>
  )
}
