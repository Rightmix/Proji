import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/context'
import { Icon, type IconName } from '../../components/ui'
import { ErrorState, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { useResource } from '../../features/account/useResource'

function Row({
  to,
  icon,
  label,
  hint,
}: {
  to?: string
  icon: IconName
  label: string
  hint?: string
}) {
  const inner = (
    <>
      <Icon name={icon} className="size-5 shrink-0 text-ink-muted" />
      <span className="flex-1">
        {label}
        {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      </span>
      {to && <Icon name="chevron-right" className="size-4 text-ink-muted" />}
    </>
  )
  return (
    <li>
      {to ? (
        <Link
          to={to}
          className="flex min-h-12 items-center gap-3 rounded-md px-1 hover:bg-surface-muted"
        >
          {inner}
        </Link>
      ) : (
        <span aria-disabled="true" className="flex min-h-12 items-center gap-3 px-1 text-ink-muted">
          {inner}
        </span>
      )}
    </li>
  )
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-lg border border-line bg-surface px-3 py-1 shadow-card"
    >
      {title && <h2 className="pt-2 text-sm font-semibold">{title}</h2>}
      <ul className="divide-y divide-line">{children}</ul>
    </section>
  )
}

/** Stage 5.5 mobile account hub. Unbuilt features are shown disabled ("coming later"). */
export default function AccountOverview() {
  const { user, signOut } = useAuth()
  const repo = useAccountRepository()
  const { state, reload } = useResource(repo ? () => repo.getProfile() : null, 'profile')
  const name = state.status === 'ready' ? state.data.fullName : null
  const initial = (name || user?.email || '?').trim().charAt(0).toUpperCase()
  return (
    <div className="flex flex-col gap-4 pt-3">
      <Link
        to="/account/profile"
        className="flex items-center gap-3 rounded-lg p-1"
        aria-label="Edit profile"
      >
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-pill bg-action-600 text-2xl font-bold text-ink-inverse"
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{name || 'Your account'}</h1>
          <span className="block truncate text-sm text-ink-muted">Signed in as {user?.email}</span>
        </span>
        <Icon name="chevron-right" className="size-5 text-ink-muted" />
      </Link>
      {!repo && <Unavailable />}
      {state.status === 'error' && <ErrorState error={state.error} onRetry={reload} />}

      <Group>
        <Row to="/account/orders" icon="box" label="Orders" />
        <Row to="/account/bowls" icon="heart" label="Saved bowls" />
        <Row to="/favourites" icon="heart" label="Favourites" hint="on this device" />
      </Group>
      <Group title="Food preferences">
        <Row icon="sliders" label="Dietary preferences" hint="Coming later" />
        <Row to="/account/preferences" icon="flame" label="Spice level" />
        <Row to="/account/preferences" icon="utensils" label="Cutlery" />
      </Group>
      <Group title="Delivery">
        <Row to="/account/addresses" icon="pin" label="Addresses" />
      </Group>
      <Group title="Account">
        <Row to="/account/profile" icon="user" label="Profile" />
      </Group>
      <Group title="PROJI">
        <Row icon="repeat" label="Subscription" hint="Coming later" />
        <Row icon="gift" label="Refer & earn" hint="Coming later" />
        <Row icon="tag" label="Offers" hint="Coming later" />
      </Group>
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex min-h-12 items-center justify-center gap-2 rounded-pill border border-line-strong bg-surface font-semibold"
      >
        <Icon name="logout" className="size-5" /> Sign out
      </button>
    </div>
  )
}
