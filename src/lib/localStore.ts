import { useSyncExternalStore } from 'react'

/**
 * Tiny device-local store (localStorage) with React subscription. Storage can be
 * unavailable (private mode, blocked); every access is guarded and falls back to memory.
 */
export function createLocalStore<T>(key: string, initial: T, parse: (raw: unknown) => T) {
  let value: T = initial
  let loaded = false
  const listeners = new Set<() => void>()
  const load = () => {
    if (loaded) return
    loaded = true
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) value = parse(JSON.parse(raw))
    } catch {
      value = initial
    }
  }
  const emit = () => listeners.forEach((l) => l())
  return {
    get(): T {
      load()
      return value
    },
    set(next: T) {
      load()
      value = next
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* storage unavailable: keep in memory */
      }
      emit()
    },
    reset() {
      value = initial
      loaded = false
      emit()
    },
    subscribe(l: () => void) {
      listeners.add(l)
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          loaded = false
          l()
        }
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(l)
        window.removeEventListener('storage', onStorage)
      }
    },
  }
}

export function useLocalStore<T>(store: { get(): T; subscribe(l: () => void): () => void }): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
