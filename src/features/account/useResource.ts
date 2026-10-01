import { useCallback, useEffect, useState } from 'react'
import { AccountError } from './types'

export type Resource<T> =
  { status: 'loading' } | { status: 'error'; error: AccountError } | { status: 'ready'; data: T }

export const asAccountError = (e: unknown) =>
  e instanceof AccountError
    ? e
    : new AccountError('unknown', e instanceof Error ? e.message : String(e))

/** Loads data with loading/error/reload handling; stale responses are ignored. */
export function useResource<T>(load: (() => Promise<T>) | null, key: string) {
  const [state, setState] = useState<Resource<T>>({ status: 'loading' })
  const [nonce, setNonce] = useState(0)
  const [lastKey, setLastKey] = useState(`${key}#${nonce}`)
  if (lastKey !== `${key}#${nonce}`) {
    setLastKey(`${key}#${nonce}`)
    setState({ status: 'loading' })
  }
  useEffect(() => {
    if (!load) return
    let active = true
    load().then(
      (data) => active && setState({ status: 'ready', data }),
      (e) => active && setState({ status: 'error', error: asAccountError(e) }),
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` identifies the query
  }, [key, nonce])
  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { state, reload, setState }
}
