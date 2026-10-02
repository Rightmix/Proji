import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Container, Icon, type IconName } from '../../components/ui'
import { BackHeader } from '../../components/shell/BackHeader'
import { IllustrativeTag } from '../../components/meals/Macros'
import { AuthContext } from '../../auth/context'
import { useAccountRepository } from '../../features/account/accountContext'
import { useResource } from '../../features/account/useResource'
import { addressTitle, formatAddress } from '../../features/account/format'
import { useCart } from '../../features/cart/cartStore'
import { priceCart } from '../../features/cart/cartTotals'
import { TIME_SLOTS, nextDays } from '../../features/cart/checkoutOptions'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import { formatInr } from '../../features/builder/pricing'
import { cn } from '../../lib/cn'

const option =
  'flex cursor-pointer items-center gap-3 rounded-md border bg-surface p-3 transition-ui has-checked:border-action-600 has-checked:ring-1 has-checked:ring-action-600 border-line ' +
  'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus'
const chip =
  'flex min-h-touch cursor-pointer flex-col items-center justify-center rounded-md border px-2 py-1 text-center text-xs font-semibold transition-ui border-line bg-surface ' +
  'has-checked:border-action-600 has-checked:bg-select-50 has-checked:text-select-700 has-focus-visible:outline-3 has-focus-visible:outline-focus'

function Step({
  n,
  title,
  action,
  children,
}: {
  n: number
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`step-${n}`} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id={`step-${n}`} className="font-semibold">
          {n}. {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * Checkout UI boundary (Stage 5.5). Collects nothing server-side and creates no order:
 * payment and order placement are Stage 6. The confirmation screen is a labelled preview.
 */
export default function CheckoutPage() {
  const auth = useContext(AuthContext)
  const repo = useAccountRepository()
  const signedIn = auth?.status === 'signed-in'
  const { state } = useResource(
    signedIn && repo ? () => repo.listAddresses() : null,
    `checkout:${signedIn}`,
  )
  const addresses = state.status === 'ready' ? state.data : []
  const [addressId, setAddressId] = useState<string | null>(null)
  const chosen = addressId ?? addresses.find((a) => a.isDefault)?.id ?? null
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery')
  const days = useMemo(() => nextDays(new Date()), [])
  const [day, setDay] = useState(days[0].key)
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0])
  const items = useCart()
  const { subtotalMinor } = priceCart(items, IDX)
  const methods: { v: 'delivery' | 'pickup'; label: string; icon: IconName }[] = [
    { v: 'delivery', label: 'Delivery', icon: 'truck' },
    { v: 'pickup', label: 'Pickup', icon: 'store' },
  ]

  return (
    <Container className="flex max-w-2xl flex-col gap-5 pb-36 pt-1 md:pt-6">
      <BackHeader title="Checkout" fallback="/cart" />
      <Step
        n={1}
        title="Delivery details"
        action={
          signedIn && (
            <Link
              to="/account/addresses"
              className="inline-flex min-h-touch items-center text-sm font-semibold text-action-600"
            >
              Change
            </Link>
          )
        }
      >
        {!signedIn ? (
          <div className="rounded-md border border-line bg-surface p-3 text-sm">
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="font-semibold text-action-600 underline"
            >
              Sign in
            </Link>{' '}
            to use your saved addresses.
          </div>
        ) : state.status === 'loading' ? (
          <p role="status" className="text-sm text-ink-muted">
            Loading addresses…
          </p>
        ) : addresses.length === 0 ? (
          <Link
            to="/account/addresses/new"
            className="rounded-md border border-dashed border-line-strong p-3 text-sm font-semibold text-action-600"
          >
            Add a delivery address
          </Link>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Delivery address</legend>
            {addresses.map((a) => (
              <label key={a.id} className={option}>
                <input
                  type="radio"
                  name="address"
                  className="sr-only"
                  checked={chosen === a.id}
                  onChange={() => setAddressId(a.id)}
                />
                <Icon name="home" className="size-5 shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{addressTitle(a)}</span>
                  <span className="block truncate text-xs text-ink-muted">{formatAddress(a)}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </Step>

      <Step n={2} title="Delivery method">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Delivery method</legend>
          {methods.map((m) => (
            <label key={m.v} className={cn(option, 'justify-center')}>
              <input
                type="radio"
                name="method"
                className="sr-only"
                checked={method === m.v}
                onChange={() => setMethod(m.v)}
              />
              <Icon name={m.icon} className="size-5" />
              <span className="text-sm font-semibold">{m.label}</span>
            </label>
          ))}
        </fieldset>
      </Step>

      <Step n={3} title={method === 'delivery' ? 'Delivery time' : 'Pickup time'}>
        <fieldset className="grid grid-cols-4 gap-2">
          <legend className="sr-only">Day</legend>
          {days.map((d) => (
            <label key={d.key} className={chip}>
              <input
                type="radio"
                name="day"
                className="sr-only"
                checked={day === d.key}
                onChange={() => setDay(d.key)}
              />
              {d.label}
              <span className="font-normal">{d.sub}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <legend className="sr-only">Time window</legend>
          {TIME_SLOTS.map((t) => (
            <label key={t} className={chip}>
              <input
                type="radio"
                name="slot"
                className="sr-only"
                checked={slot === t}
                onChange={() => setSlot(t)}
              />
              {t}
            </label>
          ))}
        </fieldset>
        <p className="text-xs text-ink-muted">
          Time windows are provisional and will be confirmed when ordering opens.
        </p>
      </Step>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-safe backdrop-blur">
        <Container className="flex max-w-2xl flex-col gap-2 py-3">
          <p className="flex items-center justify-between text-sm">
            <span>
              Total <IllustrativeTag />
            </span>
            <span className="font-bold tabular-nums">{formatInr(subtotalMinor)} + delivery</span>
          </p>
          <p
            role="note"
            className="rounded-md bg-beige/30 px-3 py-2 text-xs"
            data-testid="stage6-boundary"
          >
            Payment and order placement open in a later release. Continuing does not create an
            order.
          </p>
          <Button size="lg" block disabled aria-describedby="pay-later">
            Continue to Payment
          </Button>
          <span id="pay-later" className="sr-only">
            Payments are not available yet.
          </span>
          <Link
            to="/checkout/confirmation"
            className="text-center text-xs font-semibold text-action-600 underline"
          >
            Preview the order confirmation screen
          </Link>
        </Container>
      </div>
    </Container>
  )
}
