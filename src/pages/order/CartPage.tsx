import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, ButtonLink, Container, Icon } from '../../components/ui'
import { BackHeader } from '../../components/shell/BackHeader'
import { IllustrativeTag, MacroLine } from '../../components/meals/Macros'
import { ConfigImage } from '../../components/meals/ConfigImage'
import { ConfirmDialog } from '../../components/account/ConfirmDialog'
import {
  clearCart,
  removeFromCart,
  setQuantity,
  useCart,
  cartCount,
} from '../../features/cart/cartStore'
import { priceCart } from '../../features/cart/cartTotals'
import { decodeConfiguration, describeMissing } from '../../features/builder/savedBowlCodec'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import { formatInr } from '../../features/builder/pricing'

/** Prototype cart (device-local). Totals recomputed from the ingredient source each render. */
export default function CartPage() {
  const items = useCart()
  const { lines, subtotalMinor, nutrition, hasUnavailable } = priceCart(items, IDX)
  const [confirmClear, setConfirmClear] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const count = cartCount(items)

  return (
    <Container className="flex max-w-2xl flex-col gap-4 pb-8 pt-1 md:pt-6">
      <BackHeader
        title={`Your Cart (${count})`}
        fallback="/"
        right={
          items.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="min-h-touch px-2 text-sm font-semibold text-action-600"
            >
              Clear
            </button>
          )
        }
      />
      {message && (
        <p role="status" className="text-sm text-select-700">
          {message}
        </p>
      )}
      {items.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-ink-muted">Add a signature bowl or build your own.</p>
          <div className="mt-4 flex justify-center gap-2">
            <ButtonLink to="/build">Build Your Own</ButtonLink>
            <ButtonLink to="/categories/all" variant="secondary">
              Browse meals
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3" aria-label="Cart items">
            {lines.map((l) => {
              const sel = (() => {
                const r = decodeConfiguration(l.item.configuration, IDX)
                return r.status === 'invalid' ? null : r.selection
              })()
              return (
                <li
                  key={l.item.id}
                  className="flex gap-3 rounded-lg border border-line bg-surface p-3 shadow-card"
                >
                  <ConfigImage
                    selection={sel}
                    label={`${l.item.name} — prototype illustration`}
                    className="w-20 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-semibold leading-snug">
                        {l.item.mealSlug ? (
                          <Link to={`/menu/${l.item.mealSlug}`}>{l.item.name}</Link>
                        ) : (
                          l.item.name
                        )}
                      </h2>
                      <button
                        type="button"
                        aria-label={`Remove ${l.item.name}`}
                        onClick={() => {
                          removeFromCart(l.item.id)
                          setMessage(`${l.item.name} removed.`)
                        }}
                        className="grid size-touch shrink-0 place-items-center rounded-pill text-ink-muted hover:bg-surface-muted"
                      >
                        <Icon name="trash" className="size-5" />
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {l.item.mealSlug ? 'Signature bowl' : 'Custom bowl'}
                    </p>
                    {l.status === 'ok' ? (
                      <>
                        <MacroLine values={l.nutrition} />
                        <div className="mt-1 flex items-center justify-between">
                          <div
                            className="flex items-center gap-1"
                            role="group"
                            aria-label={`Quantity for ${l.item.name}`}
                          >
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${l.item.name}`}
                              disabled={l.item.quantity <= 1}
                              onClick={() => setQuantity(l.item.id, l.item.quantity - 1)}
                              className="grid size-touch place-items-center rounded-pill border border-line disabled:opacity-40"
                            >
                              <Icon name="minus" className="size-4" />
                            </button>
                            <span
                              className="w-6 text-center font-semibold tabular-nums"
                              aria-live="polite"
                            >
                              {l.item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${l.item.name}`}
                              disabled={l.item.quantity >= 20}
                              onClick={() => setQuantity(l.item.id, l.item.quantity + 1)}
                              className="grid size-touch place-items-center rounded-pill border border-line disabled:opacity-40"
                            >
                              <Icon name="plus" className="size-4" />
                            </button>
                          </div>
                          <p className="font-bold tabular-nums">
                            {formatInr(l.unitPriceMinor * l.item.quantity)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-danger">
                        No longer available
                        {l.missing?.length
                          ? `: ${l.missing.map((m) => describeMissing(m, IDX)).join(', ')}`
                          : ''}
                        . Remove it to continue.
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <Link
            to="/"
            className="flex min-h-touch items-center justify-center gap-2 rounded-pill bg-select-50 text-sm font-semibold text-action-600"
          >
            <Icon name="plus" className="size-4" /> Add more items
          </Link>

          <section
            aria-labelledby="summary-title"
            className="rounded-lg border border-line bg-surface p-4 shadow-card"
          >
            <h2 id="summary-title" className="sr-only">
              Order summary
            </h2>
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatInr(subtotalMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Delivery fee</dt>
                <dd>To be confirmed</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums" data-testid="cart-total">
                  {formatInr(subtotalMinor)}{' '}
                  <span className="text-xs font-normal text-ink-muted">+ delivery</span>
                </dd>
              </div>
            </dl>
            <div
              className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"
              data-testid="cart-nutrition"
            >
              <MacroLine values={nutrition} />
              <IllustrativeTag />
            </div>
            <p className="mt-2 text-xs text-ink-muted" data-testid="prototype-notice">
              <strong className="font-semibold text-ink">Prototype cart:</strong> saved on this
              device only. Prices and nutrition are illustrative, not validated.
            </p>
          </section>
          {hasUnavailable && (
            <p role="alert" className="text-sm text-danger">
              Remove unavailable items before checkout.
            </p>
          )}
          {hasUnavailable ? (
            <Button size="lg" block disabled>
              Proceed to Checkout
            </Button>
          ) : (
            <ButtonLink to="/checkout" size="lg" block>
              Proceed to Checkout <Icon name="arrow-right" className="size-5" />
            </ButtonLink>
          )}
        </>
      )}
      <ConfirmDialog
        open={confirmClear}
        title="Clear cart?"
        body="All items will be removed from your cart."
        confirmLabel="Clear cart"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearCart()
          setConfirmClear(false)
          setMessage('Cart cleared.')
        }}
      />
    </Container>
  )
}
