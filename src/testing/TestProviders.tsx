/**
 * E2E TEST BUILD ONLY (VITE_TEST_AUTH=true). Never included in normal builds: main.tsx
 * imports this file behind a build-time constant, so it is tree-shaken out otherwise.
 * Simulates Supabase auth + an RLS-equivalent in-memory account store in sessionStorage.
 */
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { AuthContext, type AuthState } from '../auth/context'
import type { Role } from '../auth/roles'
import { AccountProvider } from '../features/account/AccountProvider'
import {
  createMemoryAccountRepository,
  emptyStore,
  type MemoryStore,
} from '../features/account/memoryRepository'

const SESSION = 'proji-test-session'
const STORE = 'proji-test-store'
const EXPIRED = 'proji-test-expired'
export const TEST_PASSWORD = 'password123'

const read = <T,>(k: string, fallback: T): T => {
  try {
    return JSON.parse(sessionStorage.getItem(k) ?? '') as T
  } catch {
    return fallback
  }
}
const idFor = (email: string) => {
  let h = 0
  for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return `00000000-0000-4000-a000-${h.toString(16).padStart(12, '0').slice(-12)}`
}
const rolesFor = (email: string): Role[] =>
  email.startsWith('kitchen')
    ? ['kitchen']
    : email.startsWith('admin')
      ? ['admin', 'customer']
      : ['customer']

export function TestProviders({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ id: string; email: string } | null>(() =>
    read(SESSION, null),
  )
  const store = useMemo<MemoryStore>(() => read(STORE, emptyStore()), [])
  const repo = useMemo(
    () =>
      createMemoryAccountRepository(
        store,
        () =>
          sessionStorage.getItem(EXPIRED)
            ? null
            : (read<{ id: string } | null>(SESSION, null)?.id ?? null),
        () => sessionStorage.setItem(STORE, JSON.stringify(store)),
      ),
    [store],
  )
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (password !== TEST_PASSWORD) return 'Invalid login credentials'
    const s = { id: idFor(email), email }
    sessionStorage.setItem(SESSION, JSON.stringify(s))
    sessionStorage.removeItem(EXPIRED)
    setSession(s)
    return null
  }, [])
  const signOut = useCallback(async () => {
    sessionStorage.removeItem(SESSION)
    setSession(null)
  }, [])
  const value = useMemo<AuthState>(
    () => ({
      status: session ? 'signed-in' : 'signed-out',
      user: session ? ({ id: session.id, email: session.email } as User) : null,
      roles: session ? rolesFor(session.email) : [],
      configured: true,
      signInWithPassword,
      signUp: async () => 'Sign-up is disabled in the test build.',
      signOut,
    }),
    [session, signInWithPassword, signOut],
  )
  return (
    <AuthContext.Provider value={value}>
      <AccountProvider repository={repo}>{children}</AccountProvider>
    </AuthContext.Provider>
  )
}
