import { ButtonLink } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { ErrorState, Loading } from '../../components/account/States'
import { useOrderHistory } from '../../features/account/accountContext'
import { useResource } from '../../features/account/useResource'

/** Stage 6 boundary: renders real orders once an OrderHistoryRepository is provided. */
export default function OrdersPage() {
  const orders = useOrderHistory()
  const { state, reload } = useResource(
    orders.available ? () => orders.listOrders() : null,
    'orders',
  )
  return (
    <section>
      <PageTitle>Order history</PageTitle>
      {!orders.available ? (
        <div
          className="mt-6 rounded-lg border border-line bg-surface p-6"
          data-testid="orders-empty"
        >
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 text-ink-muted">
            Ordering opens in a later release. Your orders will appear here.
          </p>
          <ButtonLink to="/build" variant="secondary" className="mt-4">
            Build a bowl
          </ButtonLink>
        </div>
      ) : state.status === 'loading' ? (
        <Loading label="Loading orders…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <p className="mt-6">No orders yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {state.data.map((o) => (
            <li key={o.id} className="rounded-md border border-line bg-surface p-4">
              {new Date(o.placedAt).toLocaleDateString()} · {o.status}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
