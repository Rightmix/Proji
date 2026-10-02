import { Icon } from '../ui'

/** BYO header: back · "Build Your Own" · save + share. */
export function BuilderTopBar({
  onBack,
  onShare,
  onSave,
}: {
  onBack: () => void
  onShare: () => void
  /** Present once the bowl is complete (Stage 5 saved bowls). */
  onSave?: () => void
}) {
  return (
    <div className="grid grid-cols-[minmax(2.75rem,5.5rem)_1fr_minmax(2.75rem,5.5rem)] items-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
      >
        <Icon name="arrow-left" className="size-5" />
      </button>
      <div className="text-center">
        <h1 className="whitespace-nowrap text-lg font-semibold leading-tight">Build Your Own</h1>
        <p className="text-xs text-ink-muted max-[359px]:hidden">Create your perfect PROJI</p>
      </div>
      <div className="flex justify-end">
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            aria-label="Save bowl"
            className="grid size-touch place-items-center rounded-pill text-action-600 hover:bg-surface-muted"
          >
            <Icon name="heart" className="size-5" />
          </button>
        )}
        <button
          type="button"
          onClick={onShare}
          aria-label="Share this bowl"
          className="grid size-touch place-items-center rounded-pill hover:bg-surface-muted"
        >
          <Icon name="share" className="size-5" />
        </button>
      </div>
    </div>
  )
}
