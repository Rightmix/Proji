import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context'
import { hasAnyRole, type Role } from './roles'

/** Client-side route guard. Server-side RLS remains the source of truth. */
export function RequireRole({ allow, children }: { allow: readonly Role[]; children: ReactNode }) {
  const { status, roles } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <p role="status" className="p-6 text-ink-muted">
        Checking access…
      </p>
    )
  }
  if (status === 'signed-out') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (!hasAnyRole(roles, allow)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>
}
