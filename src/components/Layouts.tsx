import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/context'

const link = ({ isActive }: { isActive: boolean }) =>
  `px-2 py-1 rounded ${isActive ? 'text-proji-lime' : 'text-proji-offwhite/80 hover:text-proji-offwhite'}`

export function CustomerLayout() {
  const { status, signOut } = useAuth()
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-proji-black text-proji-offwhite">
        <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <NavLink to="/" className="mr-auto text-lg font-extrabold tracking-wide">
            PROJI
          </NavLink>
          <NavLink to="/menu" className={link}>
            Menu
          </NavLink>
          <NavLink to="/build" className={link}>
            Build
          </NavLink>
          {status === 'signed-in' ? (
            <>
              <NavLink to="/account" className={link}>
                Account
              </NavLink>
              <button
                type="button"
                onClick={() => void signOut()}
                className="px-2 py-1 text-proji-offwhite/80"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={link}>
              Sign in
            </NavLink>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export function StaffLayout({ area }: { area: string }) {
  return (
    <div className="min-h-dvh bg-white">
      <header className="flex items-center gap-3 bg-proji-black px-4 py-3 text-proji-offwhite">
        <NavLink to="/" className="font-extrabold">
          PROJI
        </NavLink>
        <span className="rounded bg-proji-lime px-2 py-0.5 text-xs font-semibold text-proji-black">
          {area}
        </span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
