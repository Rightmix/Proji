import type { ReactNode } from 'react'
import { CatalogContext } from './catalogContext'
import type { CatalogRepository } from './types'

/** Injects a catalog repository (tests, previews, Stage 7 Supabase source). */
export function CatalogProvider({
  repository,
  children,
}: {
  repository: CatalogRepository
  children: ReactNode
}) {
  return <CatalogContext.Provider value={repository}>{children}</CatalogContext.Provider>
}
