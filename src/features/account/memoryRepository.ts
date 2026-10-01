import { encodeConfiguration } from '../builder/savedBowlCodec'
import type { BowlConfiguration } from '../builder/types'
import {
  AccountError,
  DEFAULT_PREFERENCES,
  type AccountRepository,
  type Address,
  type AddressInput,
  type Preferences,
  type Profile,
  type SavedBowlRecord,
} from './types'
import {
  normalizeAddress,
  validateAddress,
  validateBowlName,
  validateProfile,
  normalizeProfile,
} from './validation'

export interface MemoryStore {
  profiles: Record<string, Profile | undefined>
  addresses: (Address & { userId: string })[]
  preferences: Record<string, Preferences | undefined>
  bowls: (SavedBowlRecord & { userId: string })[]
  seq: number
}
export const emptyStore = (): MemoryStore => ({
  profiles: {},
  addresses: [],
  preferences: {},
  bowls: [],
  seq: 0,
})

/**
 * In-memory implementation that mirrors the database rules (ownership, limits,
 * single default, name uniqueness). For unit tests and the E2E test build only.
 */
export function createMemoryAccountRepository(
  store: MemoryStore,
  currentUserId: () => string | null,
  onChange: () => void = () => {},
): AccountRepository {
  const uid = () => {
    const u = currentUserId()
    if (!u)
      throw new AccountError('unauthenticated', 'Your session has expired. Please sign in again.')
    return u
  }
  const now = () => new Date(Date.UTC(2026, 9, 1, 0, 0, store.seq)).toISOString()
  const newId = () => {
    store.seq++
    return `00000000-0000-4000-8000-${String(store.seq).padStart(12, '0')}`
  }
  const own = <T extends { userId: string }>(rows: T[]) => {
    const u = uid()
    return rows.filter((r) => r.userId === u)
  }
  const strip = <T extends { userId: string }>({ userId: _u, ...rest }: T) => (void _u, rest)
  const done = <T>(v: T) => {
    onChange()
    return v
  }

  return {
    async getProfile() {
      const id = uid()
      store.profiles[id] ??= { id, fullName: null, phone: null }
      return done({ ...store.profiles[id]! })
    },
    async updateProfile(input) {
      const id = uid()
      if (Object.keys(validateProfile(input)).length)
        throw new AccountError('invalid', 'Invalid profile')
      store.profiles[id] = { id, ...normalizeProfile(input) }
      return done({ ...store.profiles[id]! })
    },
    async listAddresses() {
      return own(store.addresses)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(strip)
    },
    async createAddress(input) {
      const userId = uid()
      if (Object.keys(validateAddress(input)).length)
        throw new AccountError('invalid', 'Invalid address')
      const mine = own(store.addresses)
      if (mine.length >= 20) throw new AccountError('limit', 'You can save up to 20 addresses.')
      const isDefault = mine.length === 0 || Boolean(input.isDefault)
      if (isDefault) mine.forEach((a) => (a.isDefault = false))
      const t = now()
      const row = {
        ...normalizeAddress(input),
        id: newId(),
        userId,
        isDefault,
        createdAt: t,
        updatedAt: t,
      }
      store.addresses.push(row)
      return done(strip(row))
    },
    async updateAddress(id, input: AddressInput) {
      const row = own(store.addresses).find((a) => a.id === id)
      if (!row) throw new AccountError('not-found', 'Address not found')
      if (Object.keys(validateAddress(input)).length)
        throw new AccountError('invalid', 'Invalid address')
      Object.assign(row, normalizeAddress(input), { updatedAt: now() })
      return done(strip(row))
    },
    async deleteAddress(id) {
      const mine = own(store.addresses)
      const row = mine.find((a) => a.id === id)
      if (!row) throw new AccountError('not-found', 'Address not found')
      store.addresses = store.addresses.filter((a) => a !== row)
      if (row.isDefault) {
        const next = own(store.addresses).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
        if (next) next.isDefault = true
      }
      done(undefined)
    },
    async setDefaultAddress(id) {
      const mine = own(store.addresses)
      if (!mine.some((a) => a.id === id)) throw new AccountError('not-found', 'Address not found')
      mine.forEach((a) => (a.isDefault = a.id === id))
      done(undefined)
    },
    async getPreferences() {
      return { ...(store.preferences[uid()] ?? DEFAULT_PREFERENCES) }
    },
    async savePreferences(p) {
      store.preferences[uid()] = { ...p }
      return done({ ...p })
    },
    async listSavedBowls() {
      return own(store.bowls)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(strip)
    },
    async getSavedBowl(id) {
      const row = own(store.bowls).find((b) => b.id === id)
      return row ? strip(row) : null
    },
    async createSavedBowl(name, configuration: BowlConfiguration) {
      const userId = uid()
      const err = validateBowlName(name)
      if (err) throw new AccountError('invalid', err)
      const mine = own(store.bowls)
      if (mine.length >= 50) throw new AccountError('limit', 'You can save up to 50 bowls.')
      if (mine.some((b) => b.name.trim().toLowerCase() === name.trim().toLowerCase()))
        throw new AccountError('conflict', 'You already have a bowl with that name.')
      const t = now()
      const row = {
        id: newId(),
        userId,
        name: name.trim(),
        configuration: encodeConfiguration(configuration),
        createdAt: t,
        updatedAt: t,
      }
      store.bowls.push(row)
      return done(strip(row))
    },
    async renameSavedBowl(id, name) {
      const mine = own(store.bowls)
      const row = mine.find((b) => b.id === id)
      if (!row) throw new AccountError('not-found', 'Saved bowl not found')
      const err = validateBowlName(name)
      if (err) throw new AccountError('invalid', err)
      if (mine.some((b) => b !== row && b.name.trim().toLowerCase() === name.trim().toLowerCase()))
        throw new AccountError('conflict', 'You already have a bowl with that name.')
      row.name = name.trim()
      row.updatedAt = now()
      return done(strip(row))
    },
    async deleteSavedBowl(id) {
      const row = own(store.bowls).find((b) => b.id === id)
      if (!row) throw new AccountError('not-found', 'Saved bowl not found')
      store.bowls = store.bowls.filter((b) => b !== row)
      done(undefined)
    },
  }
}
