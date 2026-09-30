import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type SurfaceTone = 'surface' | 'muted' | 'canvas' | 'inverse'

const tones: Record<SurfaceTone, string> = {
  surface: 'bg-surface border border-line shadow-card',
  muted: 'bg-surface-muted',
  canvas: 'bg-canvas border border-line',
  inverse: 'bg-bowl-800 text-ink-inverse',
}

/** Base surface. Hierarchy: canvas (page) → surface (card) → muted (inset). */
export function Card({
  tone = 'surface',
  className,
  ...rest
}: { tone?: SurfaceTone } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg', tones[tone], className)} {...rest} />
}
