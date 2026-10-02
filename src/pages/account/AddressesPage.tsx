import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, ButtonLink, Card } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { ConfirmDialog } from '../../components/account/ConfirmDialog'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError, useResource } from '../../features/account/useResource'
import { addressTitle, formatAddress } from '../../features/account/format'
import type { AccountError, Address } from '../../features/account/types'

export default function AddressesPage() {
  const repo = useAccountRepository()
  const location = useLocation()
  const { state, reload } = useResource(repo ? () => repo.listAddresses() : null, 'addresses')
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )
  const [failure, setFailure] = useState<AccountError | null>(null)

  const act = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true)
    setFailure(null)
    setMessage(null)
    try {
      await fn()
      setMessage(ok)
      reload()
    } catch (e) {
      setFailure(asAccountError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <PageTitle
        right={
          repo && (
            <ButtonLink to="/account/addresses/new" variant="ghost" className="px-2">
              Add address
            </ButtonLink>
          )
        }
      >
        Addresses
      </PageTitle>
      {message && (
        <p role="status" className="text-select-700">
          {message}
        </p>
      )}
      {failure && <ErrorState error={failure} onRetry={reload} />}
      {!repo ? (
        <Unavailable />
      ) : state.status === 'loading' ? (
        <Loading label="Loading addresses…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">No saved addresses</h2>
          <p className="mt-1 text-ink-muted">Add a delivery address to use it at checkout later.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {state.data.map((a) => (
            <li key={a.id}>
              <Card
                className="flex h-full flex-col gap-2 p-4"
                aria-label={`${addressTitle(a)} address`}
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{addressTitle(a)}</h2>
                  {a.isDefault && (
                    <span className="rounded-pill border border-select-500 bg-select-50 px-2 py-0.5 text-xs font-semibold text-select-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm">
                  {a.recipientName} · {a.phone}
                </p>
                <p className="text-sm text-ink-muted">{formatAddress(a)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <ButtonLink
                    to={`/account/addresses/${a.id}`}
                    variant="secondary"
                    aria-label={`Edit ${addressTitle(a)} address`}
                  >
                    Edit
                  </ButtonLink>
                  {!a.isDefault && (
                    <Button
                      variant="ghost"
                      disabled={busy}
                      aria-label={`Make ${addressTitle(a)} the default address`}
                      onClick={() =>
                        act(
                          () => repo.setDefaultAddress(a.id),
                          `${addressTitle(a)} is now your default address.`,
                        )
                      }
                    >
                      Set as default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="text-danger"
                    disabled={busy}
                    aria-label={`Delete ${addressTitle(a)} address`}
                    onClick={() => setPendingDelete(a)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete address?"
        body={
          pendingDelete
            ? `“${addressTitle(pendingDelete)}” at ${pendingDelete.line1} will be removed.`
            : ''
        }
        confirmLabel="Delete address"
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const a = pendingDelete!
          setPendingDelete(null)
          void act(() => repo!.deleteAddress(a.id), 'Address deleted.')
        }}
      />
    </section>
  )
}
