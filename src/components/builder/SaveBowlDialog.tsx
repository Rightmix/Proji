import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button, ButtonLink } from '../ui'
import { TextField } from '../account/FormField'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError } from '../../features/account/useResource'
import { validateBowlName } from '../../features/account/validation'
import type { BowlConfiguration } from '../../features/builder/types'

/** Stage 5 save flow. Persists the canonical BowlConfiguration (IDs only). */
export function SaveBowlForm({
  configuration,
  signedIn,
  shareSearch,
  onClose,
}: {
  configuration: BowlConfiguration
  signedIn: boolean
  /** Query string that restores this bowl, used to return here after sign-in. */
  shareSearch: string
  onClose: () => void
}) {
  const repo = useAccountRepository()
  const location = useLocation()
  const input = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  if (!repo) return <p role="alert">Saving bowls is not available in this environment.</p>
  if (!signedIn)
    return (
      <div className="flex flex-col gap-3">
        <p>Sign in to save this bowl to your account.</p>
        <Link
          to="/login"
          state={{ from: `${location.pathname}?${shareSearch}` }}
          className="inline-flex min-h-touch items-center self-start rounded-pill bg-action-600 px-5 font-semibold text-ink-inverse"
        >
          Sign in to save
        </Link>
      </div>
    )
  if (saved)
    return (
      <div className="flex flex-col gap-3">
        <p role="status">“{saved}” is saved to your account.</p>
        <div className="flex gap-2">
          <ButtonLink to="/account/bowls" variant="secondary">
            View saved bowls
          </ButtonLink>
          <Button variant="ghost" onClick={onClose}>
            Keep customising
          </Button>
        </div>
      </div>
    )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateBowlName(name)
    if (err) {
      setError(err)
      return input.current?.focus()
    }
    setBusy(true)
    try {
      const rec = await repo.createSavedBowl(name, configuration)
      setSaved(rec.name)
    } catch (x) {
      const ae = asAccountError(x)
      setError(
        ae.code === 'conflict'
          ? 'You already have a bowl with that name.'
          : ae.code === 'limit'
            ? 'You’ve reached the limit of 50 saved bowls.'
            : ae.code === 'unauthenticated'
              ? 'Your session has expired. Please sign in again.'
              : 'Couldn’t save this bowl. Please try again.',
      )
      input.current?.focus()
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        ref={input}
        label="Bowl name"
        name="bowlName"
        maxLength={60}
        data-autofocus
        placeholder="e.g. Post-gym fish bowl"
        value={name}
        error={error}
        onChange={(e) => setName(e.target.value)}
      />
      <p className="text-xs text-ink-muted">
        We save your ingredient choices only. Prices and nutrition are recalculated when you reopen
        it.
      </p>
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save bowl'}
      </Button>
    </form>
  )
}
