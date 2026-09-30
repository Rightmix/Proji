import { createContext } from 'react'
import { createCatalogRepository, resolveCatalogSource } from './repository'
import type { CatalogRepository } from './types'

export const CatalogContext = createContext<CatalogRepository>(
  createCatalogRepository(resolveCatalogSource(import.meta.env)),
)
