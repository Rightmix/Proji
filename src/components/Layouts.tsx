import type { CSSProperties } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useMatches } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { cn } from '../lib/cn'
import { Logo } from './Logo'
import { Container } from './ui/layout'
import { BottomNav } from './shell/BottomNav'
import { ChatButton } from './shell/ChatButton'
import { cartCount, useCart } from '../features/cart/cartStore'
import { buttonClasses } from './ui/buttonStyles'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/build', label: 'Build your bowl' },
]

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-touch items-center rounded-pill px-3 text-sm font-medium transition-ui',
    isActive ? 'bg-select-50 text-select-700' : 'text-ink-muted hover:text-ink',
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

export interface ShellHandle {
  /** Hide the mobile bottom nav (full-screen flows with their own sticky CTA). */
  hideNav?: boolean
  /** Hide the floating chat button. */
  hideChat?: boolean
}

/** Desktop/tablet top navigation (md+). Mobile uses BottomNav. */
export function SiteHeader() {
  const { status, signOut } = useAuth()
  const count = cartCount(useCart())
  const signedIn = status === 'signed-in'
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-canvas/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-canvas/80 md:block">
      <Container className="flex h-header items-center gap-2">
        <Link to="/" aria-label="PROJI home" className="mr-auto rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {navItems.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} className={desktopLink}>
              {i.label}
            </NavLink>
          ))}
          <NavLink to="/cart" className={desktopLink}>
            Cart{count > 0 ? ` (${count})` : ''}
          </NavLink>
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
      </Container>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="hidden border-t border-line pb-safe md:block">
      <Container className="flex flex-col gap-2 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <Logo className="text-base" />
        <p>Build Your Bowl. Build Your Body. · Calicut, Kerala</p>
      </Container>
    </footer>
  )
}

/** Customer app shell: desktop header, mobile bottom nav, floating chat, scroll restoration. */
export function CustomerLayout() {
  const matches = useMatches()
  const handle = Object.assign(
    {},
    ...matches.map((m) => (m.handle as ShellHandle | undefined) ?? {}),
  ) as ShellHandle
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ '--fab-offset': handle.hideNav ? '6.5rem' : '5rem' } as CSSProperties}
    >
      <SkipLink />
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className={cn(
          'flex-1 focus:outline-none',
          !handle.hideNav && (handle.hideChat ? 'pb-20' : 'pb-36') + ' md:pb-0',
        )}
      >
        <Outlet />
      </main>
      <SiteFooter />
      {!handle.hideNav && <BottomNav />}
      {!handle.hideChat && <ChatButton />}
      <ScrollRestoration />
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
