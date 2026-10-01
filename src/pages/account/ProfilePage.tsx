import { useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/context'
import { Button } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { TextField } from '../../components/account/FormField'
import { focusFirstInvalid } from '../../lib/focus'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { asAccountError, useResource } from '../../features/account/useResource'
import { validateProfile, type FieldErrors } from '../../features/account/validation'
import type { AccountError, Profile, ProfileInput } from '../../features/account/types'

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const repo = useAccountRepository()!
  const { user } = useAuth()
  const form = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<ProfileInput>({
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
  })
  const [errors, setErrors] = useState<FieldErrors<ProfileInput>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failure, setFailure] = useState<AccountError | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setFailure(null)
    const errs = validateProfile(values)
    setErrors(errs)
    if (Object.keys(errs).length)
      return requestAnimationFrame(() => focusFirstInvalid(form.current))
    setBusy(true)
    try {
      onSaved(await repo.updateProfile(values))
      setMessage('Profile saved.')
    } catch (err) {
      setFailure(asAccountError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form ref={form} noValidate onSubmit={submit} className="mt-6 flex max-w-md flex-col gap-4">
      <div>
        <p className="block text-sm font-medium">Email</p>
        <p className="mt-1 text-ink-muted">{user?.email}</p>
      </div>
      <TextField
        label="Full name"
        name="fullName"
        autoComplete="name"
        value={values.fullName ?? ''}
        error={errors.fullName}
        onChange={(e) => setValues({ ...values, fullName: e.target.value })}
      />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        hint="Include your country code, e.g. +91 or +973."
        value={values.phone ?? ''}
        error={errors.phone}
        onChange={(e) => setValues({ ...values, phone: e.target.value })}
      />
      <Button type="submit" disabled={busy} className="self-start">
        {busy ? 'Saving…' : 'Save profile'}
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

export default function ProfilePage() {
  const repo = useAccountRepository()
  const { state, reload, setState } = useResource(repo ? () => repo.getProfile() : null, 'profile')
  return (
    <section>
      <PageTitle>Profile</PageTitle>
      {!repo ? (
        <Unavailable />
      ) : state.status === 'loading' ? (
        <Loading label="Loading profile…" />
      ) : state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={reload} />
      ) : (
        <ProfileForm profile={state.data} onSaved={(p) => setState({ status: 'ready', data: p })} />
      )}
    </section>
  )
}
