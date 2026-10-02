import { useRef, useState, type FormEvent } from 'react'
import { Button, ButtonLink, Card } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { ConfirmDialog } from '../../components/account/ConfirmDialog'
import { TextField } from '../../components/account/FormField'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError, useResource } from '../../features/account/useResource'
import { validateBowlName } from '../../features/account/validation'
import type { AccountError, SavedBowlRecord } from '../../features/account/types'
import { decodeConfiguration, describeMissing } from '../../features/builder/savedBowlCodec'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import { selectedIngredients } from '../../features/builder/nutrition'

function Summary({ bowl }: { bowl: SavedBowlRecord }) {
  const r = decodeConfiguration(bowl.configuration, IDX)
  if (r.status === 'invalid')
    return <p className="text-sm text-danger">This saved bowl can’t be opened.</p>
  const names = selectedIngredients(r.selection, IDX).map((i) => i.name)
  return (
    <>
      <p className="text-sm text-ink-muted">{names.join(' · ') || 'No ingredients available'}</p>
      {r.status === 'stale' && (
        <p className="text-sm text-danger">
          No longer available: {r.missing.map((m) => describeMissing(m, IDX)).join(', ')}
        </p>
      )}
    </>
  )
}

function RenameForm({
  bowl,
  onDone,
}: {
  bowl: SavedBowlRecord
  onDone: (b: SavedBowlRecord | null) => void
}) {
  const repo = useAccountRepository()!
  const input = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(bowl.name)
  const [error, setError] = useState<string>()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateBowlName(name)
    if (err) {
      setError(err)
      return input.current?.focus()
    }
    try {
      onDone(await repo.renameSavedBowl(bowl.id, name))
    } catch (x) {
      const ae = asAccountError(x)
      setError(
        ae.code === 'conflict'
          ? 'You already have a bowl with that name.'
          : 'Couldn’t rename this bowl.',
      )
      input.current?.focus()
    }
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <TextField
        ref={input}
        label="Bowl name"
        name="name"
        maxLength={60}
        autoFocus
        value={name}
        error={error}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit">Save name</Button>
        <Button variant="ghost" onClick={() => onDone(null)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function SavedBowlsPage() {
  const repo = useAccountRepository()
  const { state, reload } = useResource(repo ? () => repo.listSavedBowls() : null, 'bowls')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<SavedBowlRecord | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [failure, setFailure] = useState<AccountError | null>(null)

  return (
    <section className="flex flex-col gap-4">
      <PageTitle
        right={
          <ButtonLink to="/build" variant="ghost" className="px-2">
            Build a bowl
          </ButtonLink>
        }
      >
        Saved bowls
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
        <Loading label="Loading saved bowls…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">No saved bowls yet</h2>
          <p className="mt-1 text-ink-muted">
            Build a bowl and choose “Save bowl” to keep it here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {state.data.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-col gap-2 p-4">
                {renaming === b.id ? (
                  <RenameForm
                    bowl={b}
                    onDone={(updated) => {
                      setRenaming(null)
                      if (updated) {
                        setMessage(`Renamed to “${updated.name}”.`)
                        reload()
                      }
                    }}
                  />
                ) : (
                  <>
                    <h2 className="font-semibold">{b.name}</h2>
                    <Summary bowl={b} />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <ButtonLink
                        to={`/build?saved=${b.id}`}
                        aria-label={`Open ${b.name} in the builder`}
                      >
                        Open in builder
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        aria-label={`Rename ${b.name}`}
                        onClick={() => setRenaming(b.id)}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-danger"
                        aria-label={`Delete ${b.name}`}
                        onClick={() => setPendingDelete(b)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete saved bowl?"
        body={pendingDelete ? `“${pendingDelete.name}” will be removed from your saved bowls.` : ''}
        confirmLabel="Delete bowl"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          const b = pendingDelete!
          setPendingDelete(null)
          setFailure(null)
          try {
            await repo!.deleteSavedBowl(b.id)
            setMessage(`“${b.name}” deleted.`)
            reload()
          } catch (e) {
            setFailure(asAccountError(e))
          }
        }}
      />
    </section>
  )
}
