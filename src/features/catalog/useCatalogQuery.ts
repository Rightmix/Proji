import { useCallback, useContext, useEffect, useState } from 'react'
import { CatalogContext } from './catalogContext'
import type { CatalogRepository } from './types'

export type AsyncState<T> =
  { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T }

/** Loads data from the catalog repository with loading/error/retry handling. */
export function useCatalogQuery<T>(load: (repo: CatalogRepository) => Promise<T>, key: string) {
  const repo = useContext(CatalogContext)
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [lastKey, setLastKey] = useState(`${key}#${attempt}`)
  if (lastKey !== `${key}#${attempt}`) {
    setLastKey(`${key}#${attempt}`)
    setState({ status: 'loading' })
  }
  useEffect(() => {
    let active = true
    load(repo).then(
      (data) => active && setState({ status: 'ready', data }),
      (error: unknown) =>
        active &&
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        }),
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` identifies the query
  }, [repo, key, attempt])
  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { state, retry }
}
