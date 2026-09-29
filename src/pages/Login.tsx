import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/context'

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
    <section className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold">Sign in</h1>
      {!configured && (
        <p role="alert" className="mt-3 rounded bg-proji-beige/40 p-3 text-sm">
          Authentication is not configured in this environment.
        </p>
      )}
      <form onSubmit={submit('in')} className="mt-6 space-y-3">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded bg-proji-black py-2 font-semibold text-proji-offwhite disabled:opacity-50"
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={busy || !configured}
          onClick={() => void submit('up')()}
          className="w-full rounded border border-proji-black py-2 font-semibold disabled:opacity-50"
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
