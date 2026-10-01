import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/context'
import { Button, Card } from '../../components/ui'
import { PageTitle } from '../../components/account/AccountLayout'
import { ErrorState, Loading, Unavailable } from '../../components/account/States'
import { useAccountRepository } from '../../features/account/accountContext'
import { useResource } from '../../features/account/useResource'

const sections = [
  { to: '/account/profile', title: 'Profile', text: 'Your name and contact number' },
  { to: '/account/addresses', title: 'Addresses', text: 'Delivery addresses and your default' },
  { to: '/account/bowls', title: 'Saved bowls', text: 'Bowls you saved from the builder' },
  { to: '/account/preferences', title: 'Preferences', text: 'Spice level and cutlery' },
  { to: '/account/orders', title: 'Order history', text: 'Your past orders' },
]

export default function AccountOverview() {
  const { user, signOut } = useAuth()
  const repo = useAccountRepository()
  const { state, reload } = useResource(repo ? () => repo.getProfile() : null, 'profile')
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageTitle>Your account</PageTitle>
        <p className="mt-1 text-ink-muted">Signed in as {user?.email}</p>
        {!repo ? null : state.status === 'loading' ? (
          <Loading label="Loading profile…" />
        ) : state.status === 'error' ? (
          <ErrorState error={state.error} onRetry={reload} />
        ) : (
          <p className="mt-1">
            {state.data.fullName ? `Hello, ${state.data.fullName}` : 'Add your name in Profile.'}
          </p>
        )}
      </div>
      {!repo && <Unavailable />}
      <ul className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.to}>
            <Card className="relative p-4 has-focus-visible:outline-3 has-focus-visible:outline-focus">
              <h2 className="font-semibold">
                <Link to={s.to} className="after:absolute after:inset-0 focus-visible:outline-none">
                  {s.title}
                </Link>
              </h2>
              <p className="text-sm text-ink-muted">{s.text}</p>
            </Card>
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="self-start" onClick={() => void signOut()}>
        Sign out
      </Button>
    </div>
  )
}
