import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { cn } from '../lib/cn'
import { Logo } from './Logo'
import { Container } from './ui/layout'
import { Icon } from './ui/Icon'
import { buttonClasses } from './ui/buttonStyles'

const navItems = [
  { to: '/menu', label: 'Menu' },
  { to: '/build', label: 'Build your bowl' },
]

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-touch items-center rounded-pill px-3 text-sm font-medium transition-ui',
    isActive ? 'bg-select-50 text-select-700' : 'text-ink-muted hover:text-ink',
  )
const mobileLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-12 items-center rounded-md px-4 text-base font-medium',
    isActive ? 'bg-select-50 text-select-700' : 'text-ink hover:bg-surface-muted',
  )

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-raised"
    >
      Skip to content
    </a>
  )
}

export function SiteHeader() {
  const { status, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const signedIn = status === 'signed-in'

  // Close the mobile panel whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <Container className="flex h-header items-center gap-2">
        <Link to="/" aria-label="PROJI home" className="mr-auto rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navItems.map((i) => (
            <NavLink key={i.to} to={i.to} className={desktopLink}>
              {i.label}
            </NavLink>
          ))}
          {signedIn ? (
            <>
              <NavLink to="/account" className={desktopLink}>
                Account
              </NavLink>
              <button
                type="button"
                onClick={() => void signOut()}
                className={buttonClasses('secondary', 'md', 'ml-2')}
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={buttonClasses('primary', 'md', 'ml-2')}>
              Sign in
            </NavLink>
          )}
        </nav>
        <button
          type="button"
          className="grid size-touch place-items-center rounded-pill text-ink hover:bg-surface-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} className="size-6" />
        </button>
      </Container>
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="border-t border-line bg-canvas md:hidden"
      >
        <Container className="flex flex-col gap-1 py-3">
          {navItems.map((i) => (
            <NavLink key={i.to} to={i.to} className={mobileLink}>
              {i.label}
            </NavLink>
          ))}
          {signedIn ? (
            <>
              <NavLink to="/account" className={mobileLink}>
                Account
              </NavLink>
              <button
                type="button"
                onClick={() => void signOut()}
                className={mobileLink({ isActive: false }) + ' text-left'}
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={buttonClasses('primary', 'lg', 'mt-2 w-full')}>
              Sign in
            </NavLink>
          )}
        </Container>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-line pb-safe">
      <Container className="flex flex-col gap-2 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <Logo className="text-base" />
        <p>Build Your Bowl. Build Your Body. · Calicut, Kerala</p>
      </Container>
    </footer>
  )
}

export function CustomerLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export function StaffLayout({ area }: { area: string }) {
  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <header className="sticky top-0 z-30 bg-bowl-900 pt-safe text-ink-inverse">
        <Container className="flex h-header items-center gap-3">
          <Link to="/" className="font-extrabold tracking-tight">
            PROJI
          </Link>
          <span className="rounded-pill bg-lime px-2.5 py-0.5 text-xs font-semibold text-ink">
            {area}
          </span>
        </Container>
      </header>
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
    </div>
  )
}
