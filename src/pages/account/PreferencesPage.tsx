import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError, useResource } from '../../features/account/useResource'
import { SPICE_LEVELS, type AccountError, type Preferences } from '../../features/account/types'

const SPICE_LABEL = { mild: 'Mild', medium: 'Medium', hot: 'Hot' } as const

function PreferencesForm({ initial }: { initial: Preferences }) {
  const repo = useAccountRepository()!
  const [p, setP] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failure, setFailure] = useState<AccountError | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    setFailure(null)
    try {
      setP(await repo.savePreferences(p))
      setMessage('Preferences saved.')
    } catch (err) {
      setFailure(asAccountError(err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="mt-6 flex max-w-md flex-col gap-6">
      <fieldset>
        <legend className="font-semibold">Spice level</legend>
        <p className="text-sm text-ink-muted">Used as a default note for future orders.</p>
        <div className="mt-2 flex flex-col gap-1">
          {[null, ...SPICE_LEVELS].map((lvl) => (
            <label key={lvl ?? 'none'} className="flex min-h-touch items-center gap-3">
              <input
                type="radio"
                name="spice"
                className="size-5 accent-[var(--color-action-600)]"
                checked={p.spiceLevel === lvl}
                onChange={() => setP({ ...p, spiceLevel: lvl })}
              />
              {lvl ? SPICE_LABEL[lvl] : 'No preference'}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex min-h-touch items-center gap-3">
        <input
          type="checkbox"
          className="size-5 accent-[var(--color-action-600)]"
          checked={p.includeCutlery}
          onChange={(e) => setP({ ...p, includeCutlery: e.target.checked })}
        />
        Include cutlery with my orders
      </label>
      <Button type="submit" disabled={busy} className="self-start">
        {busy ? 'Saving…' : 'Save preferences'}
      </Button>
      {message && (
        <p role="status" className="text-select-700">
          {message}
        </p>
      )}
      {failure && <ErrorState error={failure} />}
    </form>
  )
}

export default function PreferencesPage() {
  const repo = useAccountRepository()
  const { state, reload } = useResource(repo ? () => repo.getPreferences() : null, 'prefs')
  return (
    <section>
      <PageTitle>Preferences</PageTitle>
      {!repo ? (
        <Unavailable />
      ) : state.status === 'loading' ? (
        <Loading label="Loading preferences…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : (
        <PreferencesForm initial={state.data} />
      )}
    </section>
  )
}
