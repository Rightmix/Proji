import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '../ui'
import { cn } from '../../lib/cn'
import { cartCount, useCart } from '../../features/cart/cartStore'

const ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/build', label: 'Build', icon: 'build' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
  { to: '/account', label: 'Account', icon: 'user' },
]

/** Mobile bottom navigation (hidden from md up, where the top header is used). */
export function BottomNav() {
  const count = cartCount(useCart())
  return (
    <nav
      aria-label="Primary"
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-safe backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map((i) => (
          <li key={i.to}>
            <NavLink
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold',
                  isActive ? 'text-action-600' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              <span className="relative">
                <Icon name={i.icon} className="size-6" />
                {i.to === '/cart' && count > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-1 grid min-w-4 place-items-center rounded-pill bg-action-600 px-1 text-[0.6rem] leading-4 text-ink-inverse"
                  >
                    {count}
                  </span>
                )}
              </span>
              {i.label}
              {i.to === '/cart' && count > 0 && <span className="sr-only">, {count} items</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
