import { useState } from 'react'
import { Dialog } from '../builder/Dialog'
import { Icon } from '../ui'
import { cn } from '../../lib/cn'

/**
 * Floating customer-support (CX) button. Sits above the bottom nav / sticky CTAs via
 * --fab-offset. Live chat is not connected yet, so it explains that honestly.
 */
export function ChatButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label="Chat with PROJI support"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed right-4 z-30 grid size-12 place-items-center rounded-pill bg-action-600 text-ink-inverse shadow-raised hover:bg-action-700',
          'bottom-[calc(var(--fab-offset,5rem)+env(safe-area-inset-bottom))] md:bottom-6',
          className,
        )}
      >
        <Icon name="chat" className="size-6" />
      </button>
      <Dialog id="chat" open={open} onClose={() => setOpen(false)} title="Chat with PROJI">
        <p>Live support chat opens together with ordering.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Until then, there is nothing to track or change on an order — ordering is not open yet.
        </p>
      </Dialog>
    </>
  )
}
