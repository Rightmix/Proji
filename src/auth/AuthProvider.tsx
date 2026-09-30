import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthState, type AuthStatus } from './context'
import { isRole, type Role } from './roles'

async function fetchRoles(userId: string): Promise<Role[]> {
  if (!supabase) return []
  // RLS only returns the caller's own rows. UI checks are convenience; the DB enforces access.
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId)
  if (error || !data) return []
  return data.map((r) => r.role).filter(isRole)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'signed-out')
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    if (!supabase) return
    const apply = async (u: User | null) => {
      setUser(u)
      setRoles(u ? await fetchRoles(u.id) : [])
      setStatus(u ? 'signed-in' : 'signed-out')
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      void apply(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      roles,
      configured: supabase !== null,
      signInWithPassword,
      signUp,
      signOut,
    }),
    [status, user, roles, signInWithPassword, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
