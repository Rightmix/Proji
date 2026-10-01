import type { RouteObject } from 'react-router-dom'
import { CustomerLayout, StaffLayout } from '../components/Layouts'
import { RequireRole } from '../auth/RequireRole'
import { AREA_ROLES } from '../auth/roles'
import Login from '../pages/Login'
import { AccountLayout } from '../components/account/AccountLayout'
import Home from '../pages/Home'
import Menu from '../pages/Menu'
import BowlDetail from '../pages/BowlDetail'
import { Admin, Kitchen, NotFound, Unauthorized } from '../pages/placeholders'

export const routes: RouteObject[] = [
  {
    // Stage 4 builder: full-screen layout per the approved master; own lazy chunk.
    path: '/build',
    lazy: () => import('../pages/CustomizePage').then((m) => ({ Component: m.default })),
  },
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <Menu /> },
      { path: '/menu/:slug', element: <BowlDetail /> },
      { path: '/login', element: <Login /> },
      {
        path: '/account',
        element: (
          <RequireRole allow={AREA_ROLES.account}>
            <AccountLayout />
          </RequireRole>
        ),
        children: [
          {
            index: true,
            lazy: () =>
              import('../pages/account/AccountOverview').then((m) => ({ Component: m.default })),
          },
          {
            path: 'profile',
            lazy: () =>
              import('../pages/account/ProfilePage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'addresses',
            lazy: () =>
              import('../pages/account/AddressesPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'addresses/new',
            lazy: () =>
              import('../pages/account/AddressFormPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'addresses/:id',
            lazy: () =>
              import('../pages/account/AddressFormPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'preferences',
            lazy: () =>
              import('../pages/account/PreferencesPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'bowls',
            lazy: () =>
              import('../pages/account/SavedBowlsPage').then((m) => ({ Component: m.default })),
          },
          {
            path: 'orders',
            lazy: () =>
              import('../pages/account/OrdersPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireRole allow={AREA_ROLES.admin}>
        <StaffLayout area="Admin / R&D" />
      </RequireRole>
    ),
    children: [{ index: true, element: <Admin /> }],
  },
  {
    path: '/kitchen',
    element: (
      <RequireRole allow={AREA_ROLES.kitchen}>
        <StaffLayout area="Kitchen" />
      </RequireRole>
    ),
    children: [{ index: true, element: <Kitchen /> }],
  },
]
