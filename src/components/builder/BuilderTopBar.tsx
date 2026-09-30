import { Icon } from '../ui'
import { formatInr } from '../../features/builder/pricing'

/** Master top bar: back · Customize · live illustrative price · share. */
export function BuilderTopBar({
  priceMinor,
  onBack,
  onShare,
}: {
  priceMinor: number
  onBack: () => void
  onShare: () => void
}) {
  return (
    <div className="flex h-header items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
      >
        <Icon name="arrow-left" className="size-5" />
      </button>
      <h1 className="mr-auto text-lg font-semibold">Customize</h1>
      <p className="text-lg font-bold tabular-nums" aria-live="polite" data-testid="live-price">
        <span className="sr-only">Illustrative price </span>
        {formatInr(priceMinor)}
      </p>
      <button
        type="button"
        onClick={onShare}
        aria-label="Share this bowl"
        className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
      >
        <Icon name="share" className="size-5" />
      </button>
    </div>
  )
}
