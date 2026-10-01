import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui'
import type { AccountError } from '../../features/account/types'

export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="py-6 text-ink-muted">
      {label}
    </p>
  )
}

/** Error display; expired sessions get a sign-in path back to the same page. */
export function ErrorState({ error, onRetry }: { error: AccountError; onRetry?: () => void }) {
  const location = useLocation()
  if (error.code === 'unauthenticated')
    return (
      <div role="alert" className="rounded-lg border border-danger/40 bg-surface p-5">
        <p className="font-semibold">Your session has expired.</p>
        <Link
          to="/login"
          state={{ from: location.pathname + location.search }}
          className="mt-3 inline-flex min-h-touch items-center font-semibold text-action-600 underline"
        >
          Sign in again
        </Link>
      </div>
    )
  return (
    <div role="alert" className="rounded-lg border border-danger/40 bg-surface p-5">
      <p className="font-semibold">
        {error.code === 'not-found' ? 'We couldn’t find that.' : 'Something went wrong.'}
      </p>
      {onRetry && error.code !== 'not-found' && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function Unavailable() {
  return (
    <div role="alert" className="rounded-lg border border-line bg-surface p-5">
      Accounts are not available in this environment.
    </div>
  )
}
