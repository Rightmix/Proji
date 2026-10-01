import type { BowlConfiguration } from '../builder/types'

export interface Profile {
  id: string
  fullName: string | null
  phone: string | null
}
export type ProfileInput = Pick<Profile, 'fullName' | 'phone'>

export const ADDRESS_LABELS = ['home', 'work', 'other'] as const
export type AddressLabel = (typeof ADDRESS_LABELS)[number]

/** Country-agnostic delivery address (works for India PIN codes and Bahrain block/road). */
export interface AddressInput {
  label: AddressLabel
  customLabel: string | null
  recipientName: string
  phone: string
  line1: string
  line2: string | null
  area: string | null
  city: string
  region: string | null
  postalCode: string | null
  countryCode: string
  landmark: string | null
  deliveryInstructions: string | null
}
export interface Address extends AddressInput {
  id: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export const SPICE_LEVELS = ['mild', 'medium', 'hot'] as const
export type SpiceLevel = (typeof SPICE_LEVELS)[number]
/** Ordering-relevant only. No health/medical/wellness data by design. */
export interface Preferences {
  spiceLevel: SpiceLevel | null
  includeCutlery: boolean
}
export const DEFAULT_PREFERENCES: Preferences = { spiceLevel: null, includeCutlery: true }

/** Raw stored row — `configuration` is untrusted until decoded by savedBowlCodec. */
export interface SavedBowlRecord {
  id: string
  name: string
  configuration: unknown
  createdAt: string
  updatedAt: string
}

export type AccountErrorCode =
  'unauthenticated' | 'not-found' | 'conflict' | 'limit' | 'invalid' | 'unavailable' | 'unknown'
export class AccountError extends Error {
  constructor(
    public code: AccountErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AccountError'
  }
}

/**
 * Customer account data access. Implementations: Supabase (RLS-enforced) and an
 * in-memory one for tests/test builds. All methods act on the signed-in user only.
 */
export interface AccountRepository {
  getProfile(): Promise<Profile>
  updateProfile(input: ProfileInput): Promise<Profile>
  listAddresses(): Promise<Address[]>
  createAddress(input: AddressInput & { isDefault?: boolean }): Promise<Address>
  updateAddress(id: string, input: AddressInput): Promise<Address>
  deleteAddress(id: string): Promise<void>
  setDefaultAddress(id: string): Promise<void>
  getPreferences(): Promise<Preferences>
  savePreferences(p: Preferences): Promise<Preferences>
  listSavedBowls(): Promise<SavedBowlRecord[]>
  getSavedBowl(id: string): Promise<SavedBowlRecord | null>
  createSavedBowl(name: string, configuration: BowlConfiguration): Promise<SavedBowlRecord>
  renameSavedBowl(id: string, name: string): Promise<SavedBowlRecord>
  deleteSavedBowl(id: string): Promise<void>
}

/** Stage 6 boundary: real orders arrive later. */
export interface OrderSummary {
  id: string
  placedAt: string
  status: string
  totalMinor: number
  currency: string
}
export interface OrderHistoryRepository {
  readonly available: boolean
  listOrders(): Promise<OrderSummary[]>
}
