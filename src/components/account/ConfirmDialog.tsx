import { Button } from '../ui'
import { Dialog } from '../builder/Dialog'

/** Destructive-action confirmation (native modal dialog; Escape cancels). */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}) {
  return (
    <Dialog id="confirm" open={open} onClose={onCancel} title={title}>
      <p>{body}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          onClick={onConfirm}
          disabled={busy}
          className="bg-danger hover:bg-danger active:bg-danger"
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} data-autofocus>
          Cancel
        </Button>
      </div>
    </Dialog>
  )
}
