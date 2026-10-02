import { Icon } from '../ui'

/** BYO header: back · "Build Your Own" · share. (Live price moved to the sticky summary.) */
export function BuilderTopBar({ onBack, onShare }: { onBack: () => void; onShare: () => void }) {
  return (
    <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
      >
        <Icon name="arrow-left" className="size-5" />
      </button>
      <div className="text-center">
        <h1 className="text-lg font-semibold">Build Your Own</h1>
        <p className="text-xs text-ink-muted">Create your perfect PROJI</p>
      </div>
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
