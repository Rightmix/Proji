import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse'
export type ButtonSize = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-ui select-none ' +
  'min-h-touch disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-action-600 text-ink-inverse hover:bg-action-700 active:bg-action-800 shadow-card',
  secondary:
    'border border-line-strong bg-surface text-ink hover:border-ink-muted active:bg-surface-muted',
  ghost: 'text-action-600 hover:bg-select-50 active:bg-select-100',
  inverse: 'bg-surface text-ink hover:bg-canvas',
}
const sizes: Record<ButtonSize, string> = {
  md: 'px-5 text-sm',
  lg: 'px-7 text-base min-h-12',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra?: string,
) {
  return cn(base, variants[variant], sizes[size], extra)
}
