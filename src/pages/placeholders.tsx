import { Link } from 'react-router-dom'
import { Placeholder } from '../components/Placeholder'

export function Home() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold">PROJI</h1>
      <p className="mt-2 text-lg">
        Build Your Bowl. <span className="text-proji-lime">Build Your Body.</span>
      </p>
      <Link
        to="/build"
        className="mt-8 inline-block rounded-full bg-proji-lime px-6 py-3 font-semibold text-proji-black"
      >
        Build your bowl
      </Link>
    </section>
  )
}
export const Menu = () => <Placeholder title="Menu">Signature bowls arrive in Stage 3.</Placeholder>
export const Build = () => (
  <Placeholder title="Build your bowl">The animated bowl builder arrives in Stage 4.</Placeholder>
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
