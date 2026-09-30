import { cn } from '../lib/cn'

/** PROJI wordmark with leaf accent. Provisional until final brand artwork is supplied. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-start font-sans text-xl font-extrabold tracking-tight text-action-700',
        className,
      )}
    >
      PROJ
      <span className="relative">
        I
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className="absolute -top-1.5 left-1 size-2.5 text-lime"
        >
          <path d="M1 11C1 5 5 1 11 1c0 6-4 10-10 10z" fill="currentColor" />
        </svg>
      </span>
    </span>
  )
}
