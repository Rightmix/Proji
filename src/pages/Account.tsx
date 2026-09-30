import { useAuth } from '../auth/context'
import { Placeholder } from '../components/Placeholder'

export default function Account() {
  const { user, roles } = useAuth()
  return (
    <Placeholder title="Your account">
      <p>Signed in as {user?.email}</p>
      <p>Roles: {roles.length ? roles.join(', ') : 'none'}</p>
      <p className="mt-2">Addresses, saved bowls and order history arrive in Stage 5.</p>
    </Placeholder>
  )
}
