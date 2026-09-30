import { cn } from '../../lib/cn'

/** Persistent disclosure that prices/nutrition are illustrative and ordering is a prototype. */
export function PrototypeNotice({ className, long }: { className?: string; long?: boolean }) {
  return (
    <p className={cn('text-xs text-ink-muted', className)} data-testid="prototype-notice">
      <strong className="font-semibold text-ink">Prototype:</strong> illustrative prices &amp;
      nutrition, not validated
      {long &&
        '. No allergen information yet. Final recipes, nutrition and prices will be confirmed before ordering opens.'}
      {!long && '.'}
    </p>
  )
}
