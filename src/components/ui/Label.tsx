import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** Small uppercase label (e.g. "PICK ONE", tab captions, stat labels). */
export function Label({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-label font-semibold uppercase text-ink-muted', className)}
      {...rest}
    />
  )
}
