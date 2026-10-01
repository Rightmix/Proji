import { useMemo, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { AccountContext } from './accountContext'
import { createSupabaseAccountRepository } from './supabaseRepository'
import type { AccountRepository } from './types'

export function AccountProvider({
  repository,
  children,
}: {
  repository?: AccountRepository | null
  children: ReactNode
}) {
  const repo = useMemo(
    () =>
      repository !== undefined
        ? repository
        : supabase
          ? createSupabaseAccountRepository(supabase)
          : null,
    [repository],
  )
  return <AccountContext.Provider value={repo}>{children}</AccountContext.Provider>
}
