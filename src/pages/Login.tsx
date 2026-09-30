import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { buttonClasses } from '../components/ui/buttonStyles'

export default function Login() {
  const { status, configured, signInWithPassword, signUp } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  if (status === 'signed-in') return <Navigate to={from} replace />

  const submit = (mode: 'in' | 'up') => async (e?: FormEvent) => {
    e?.preventDefault()
    setBusy(true)
    const err =
      mode === 'in' ? await signInWithPassword(email, password) : await signUp(email, password)
    setBusy(false)
    setMessage(err ?? (mode === 'up' ? 'Check your email to confirm your account.' : null))
  }

  return (
    <section className="mx-auto w-full max-w-sm px-safe py-12">
      <h1 className="font-display text-title font-semibold sm:text-3xl">Sign in</h1>
      {!configured && (
        <p role="alert" className="mt-4 rounded-md border border-beige bg-beige/30 p-3 text-sm">
          Authentication is not configured in this environment.
        </p>
      )}
      <form onSubmit={submit('in')} className="mt-6 space-y-3">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block min-h-touch w-full rounded-md border border-line-strong bg-surface px-3 text-base transition-ui focus:border-action-600"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block min-h-touch w-full rounded-md border border-line-strong bg-surface px-3 text-base transition-ui focus:border-action-600"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !configured}
          className={buttonClasses('primary', 'lg', 'w-full')}
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={busy || !configured}
          onClick={() => void submit('up')()}
          className={buttonClasses('secondary', 'lg', 'w-full')}
        >
          Create account
        </button>
      </form>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  )
}
