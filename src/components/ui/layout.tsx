import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Centered, gutter-safe content width. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-content px-safe sm:px-6', className)} {...rest} />
}

export function Section({
  title,
  eyebrow,
  children,
  className,
  id,
}: {
  title?: string
  eyebrow?: string
  children: ReactNode
  className?: string
  id?: string
}) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section aria-labelledby={headingId} id={id} className={cn('py-12 sm:py-16', className)}>
      <Container>
        {eyebrow && <p className="text-label font-semibold uppercase text-select-700">{eyebrow}</p>}
        {title && (
          <h2 id={headingId} className="mt-1 font-display text-title font-semibold sm:text-3xl">
            {title}
          </h2>
        )}
        <div className={cn(title && 'mt-8')}>{children}</div>
      </Container>
    </section>
  )
}

/**
 * Bottom-docked action bar respecting the home-indicator safe area.
 * Stage 4 uses this for Next / View Nutrition / Add to Cart.
 */
export function StickyFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 border-t border-line bg-surface/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-surface/85',
        className,
      )}
    >
      <Container className="py-3">{children}</Container>
    </div>
  )
}
