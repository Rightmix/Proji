import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '../ui'

/** Native modal <dialog> (focus trap, Escape, inert background from the platform). */
export function Dialog({
  open,
  onClose,
  title,
  children,
  id,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  id: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // Prefer an explicitly marked initial focus target (e.g. Cancel on destructive dialogs).
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="builder-dialog m-auto w-[min(92vw,30rem)] rounded-xl bg-surface p-0 text-ink shadow-raised"
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id={`${id}-title`} className="font-display text-title font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-touch shrink-0 place-items-center rounded-pill hover:bg-surface-muted"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
