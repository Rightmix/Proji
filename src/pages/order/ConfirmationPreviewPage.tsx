import { Button, Container, Icon } from '../../components/ui'
import { BackHeader } from '../../components/shell/BackHeader'
import { cn } from '../../lib/cn'

const STEPS = ['Confirmed', 'Preparing', 'Out for delivery', 'Delivered'] as const

/** DESIGN PREVIEW of the order-confirmation screen. No order exists; Stage 6 implements it. */
export default function ConfirmationPreviewPage() {
  return (
    <Container className="flex max-w-xl flex-col gap-4 pb-10 pt-1 md:pt-6">
      <BackHeader title="Order confirmation preview" fallback="/checkout" />
      <p role="alert" className="rounded-md border border-beige bg-beige/30 px-3 py-2 text-sm">
        <strong>Design preview only.</strong> No order was placed and nothing was charged. Real
        orders arrive in a later release.
      </p>
      <div
        aria-label="Preview of the confirmation screen"
        role="group"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong p-5 text-center"
      >
        <span className="grid size-16 place-items-center rounded-pill bg-action-600 text-ink-inverse">
          <Icon name="check" className="size-9" strokeWidth={3} />
        </span>
        <p className="text-2xl font-bold">Order Placed!</p>
        <p className="text-sm text-ink-muted">Your delicious PROJI is on the way.</p>
        <div className="w-full rounded-lg border border-line bg-surface p-4 text-left">
          <p className="font-semibold">Order #PROJI-PREVIEW</p>
          <ol
            className="mt-3 grid grid-cols-4 gap-1 text-center text-[0.65rem]"
            aria-label="Order status (preview)"
          >
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-pill border-2',
                    i === 0
                      ? 'border-action-600 bg-action-600 text-ink-inverse'
                      : 'border-line-strong',
                  )}
                >
                  {i === 0 && <Icon name="check" className="size-3.5" strokeWidth={3} />}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <Icon name="truck" className="size-4" /> Delivery destination and time window appear
            here.
          </p>
        </div>
        <Button size="lg" block disabled>
          Track Order
        </Button>
        <Button size="lg" block variant="secondary" disabled>
          View Order Details
        </Button>
      </div>
    </Container>
  )
}
