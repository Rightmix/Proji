import type { RouteObject } from 'react-router-dom'
import { CustomerLayout, StaffLayout } from '../components/Layouts'
import { RequireRole } from '../auth/RequireRole'
import { AREA_ROLES } from '../auth/roles'
import Login from '../pages/Login'
import Account from '../pages/Account'
import Home from '../pages/Home'
import Menu from '../pages/Menu'
import BowlDetail from '../pages/BowlDetail'
import { Admin, Build, Kitchen, NotFound, Unauthorized } from '../pages/placeholders'

export const routes: RouteObject[] = [
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <Menu /> },
      { path: '/menu/:slug', element: <BowlDetail /> },
      { path: '/build', element: <Build /> },
      { path: '/login', element: <Login /> },
      {
        path: '/account',
        element: (
          <RequireRole allow={AREA_ROLES.account}>
            <Account />
          </RequireRole>
        ),
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
