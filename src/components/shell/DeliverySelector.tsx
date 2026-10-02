import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { Icon } from '../ui'
import { AuthContext } from '../../auth/context'
import { useAccountRepository } from '../../features/account/accountContext'
import { useResource } from '../../features/account/useResource'
import { addressTitle } from '../../features/account/format'

/** "Deliver to Home ▾" pill. Uses the signed-in customer's default address when available. */
export function DeliverySelector() {
  const auth = useContext(AuthContext)
  const repo = useAccountRepository()
  const signedIn = auth?.status === 'signed-in'
  const { state } = useResource(
    signedIn && repo ? () => repo.listAddresses() : null,
    `deliver:${signedIn}`,
  )
  const def = state.status === 'ready' ? state.data.find((a) => a.isDefault) : undefined
  const label = def ? addressTitle(def) : signedIn ? 'Add address' : 'Set location'
  return (
    <Link
      to={signedIn ? '/account/addresses' : '/login'}
      state={signedIn ? undefined : { from: '/account/addresses' }}
      className="inline-flex min-h-touch items-center gap-2 rounded-pill border border-line bg-surface px-3 text-left shadow-card"
    >
      <Icon name="pin" className="size-5 text-action-600" />
      <span className="leading-tight">
        <span className="block text-[0.65rem] text-ink-muted">Deliver to</span>
        <span className="block text-sm font-semibold">{label}</span>
      </span>
      <Icon name="chevron-down" className="size-4 text-ink-muted" />
    </Link>
  )
}
