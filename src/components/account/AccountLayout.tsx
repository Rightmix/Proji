import { NavLink, Outlet } from 'react-router-dom'
import { Container } from '../ui'
import { cn } from '../../lib/cn'

const links = [
  { to: '/account', label: 'Overview', end: true },
  { to: '/account/profile', label: 'Profile' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/bowls', label: 'Saved bowls' },
  { to: '/account/preferences', label: 'Preferences' },
  { to: '/account/orders', label: 'Orders' },
]

export function AccountLayout() {
  return (
    <Container className="py-6 sm:py-10">
      <nav aria-label="Account" className="-mx-1 mb-6 overflow-x-auto">
        <ul className="flex gap-1 px-1">
          {links.map((l) => (
            <li key={l.to} className="shrink-0">
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-touch items-center rounded-pill px-4 text-sm font-medium',
                    isActive ? 'bg-select-50 text-select-700' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </Container>
  )
}

export function PageTitle({ children }: { children: string }) {
  return <h1 className="font-display text-title font-semibold sm:text-3xl">{children}</h1>
}
