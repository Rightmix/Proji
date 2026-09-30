import { Link } from 'react-router-dom'
import { Placeholder } from '../components/Placeholder'

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
