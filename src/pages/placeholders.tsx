import { Link } from 'react-router-dom'
import { Placeholder } from '../components/Placeholder'
import { BowlSurface } from '../components/ui/BowlSurface'

export const Menu = () => <Placeholder title="Menu">Signature bowls arrive in Stage 3.</Placeholder>
export const Build = () => (
  <Placeholder title="Build your bowl">
    <p>The animated bowl builder arrives in Stage 4.</p>
    <BowlSurface emptyLabel="Your bowl builds here" className="mx-auto mt-8 w-56" />
  </Placeholder>
)
export const Admin = () => (
  <Placeholder title="Admin & R&D">Ingredient and recipe management arrive in Stage 7.</Placeholder>
)
export const Kitchen = () => (
  <Placeholder title="Kitchen">Kitchen tickets arrive in Stage 8.</Placeholder>
)
export const Unauthorized = () => (
  <Placeholder title="Access denied">
    Your account does not have permission to view this page.
  </Placeholder>
)
export const NotFound = () => (
  <Placeholder title="Page not found">
    <Link to="/" className="underline">
      Back to home
    </Link>
  </Placeholder>
)
