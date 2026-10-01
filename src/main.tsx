import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AccountProvider } from './features/account/AccountProvider'
import { routes } from './app/routes'
import { TestProviders } from './testing/TestProviders'
import './index.css'

const router = createBrowserRouter(routes)
const root = createRoot(document.getElementById('root')!)
const render = (Providers: (p: { children: ReactNode }) => ReactNode) =>
  root.render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  )

if (import.meta.env.VITE_TEST_AUTH === 'true') {
  // E2E-only build: simulated auth + in-memory account store. The build-time constant makes
  // this branch dead code in normal builds, so TestProviders is tree-shaken (check:bundle).
  render(TestProviders)
} else {
  render(({ children }) => (
    <AuthProvider>
      <AccountProvider>{children}</AccountProvider>
    </AuthProvider>
  ))
}
