import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Role } from './roles'

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in'

export interface AuthState {
  status: AuthStatus
  user: User | null
  roles: Role[]
  configured: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
