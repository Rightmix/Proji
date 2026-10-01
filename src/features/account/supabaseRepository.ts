import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { encodeConfiguration } from '../builder/savedBowlCodec'
import {
  AccountError,
  DEFAULT_PREFERENCES,
  type AccountRepository,
  type Address,
  type AddressInput,
  type Profile,
  type SavedBowlRecord,
} from './types'
import { normalizeAddress, normalizeProfile, UUID_RE } from './validation'

/** Map PostgREST/Auth errors to stable AccountError codes. */
export function toAccountError(
  e: PostgrestError | { code?: string; message: string; status?: number } | null,
): AccountError {
  const code = e?.code ?? ''
  const msg = e?.message ?? 'Something went wrong.'
  if (
    code === 'PGRST301' ||
    (code === '42501' && /jwt|auth/i.test(msg)) ||
    (e as { status?: number })?.status === 401
  )
    return new AccountError('unauthenticated', 'Your session has expired. Please sign in again.')
  if (code === '23505') return new AccountError('conflict', 'That name is already used.')
  if (code === '23514' && /limit/.test(msg)) return new AccountError('limit', msg)
  if (code === '23514' || code === '22P02' || code === '23502')
    return new AccountError('invalid', 'Some details are not valid.')
  if (code === 'PGRST116' || code === 'P0002') return new AccountError('not-found', 'Not found.')
  return new AccountError('unknown', msg)
}

type AddressRow = {
  id: string
  label: Address['label']
  custom_label: string | null
  recipient_name: string
  phone: string
  line1: string
  line2: string | null
  area: string | null
  city: string
  region: string | null
  postal_code: string | null
  country_code: string
  landmark: string | null
  delivery_instructions: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}
const ADDRESS_COLS =
  'id,label,custom_label,recipient_name,phone,line1,line2,area,city,region,postal_code,country_code,landmark,delivery_instructions,is_default,created_at,updated_at'

export const addressFromRow = (r: AddressRow): Address => ({
  id: r.id,
  label: r.label,
  customLabel: r.custom_label,
  recipientName: r.recipient_name,
  phone: r.phone,
  line1: r.line1,
  line2: r.line2,
  area: r.area,
  city: r.city,
  region: r.region,
  postalCode: r.postal_code,
  countryCode: r.country_code,
  landmark: r.landmark,
  deliveryInstructions: r.delivery_instructions,
  isDefault: r.is_default,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

/** Only client-writable columns. user_id/id/timestamps are set by the database. */
export function addressToRow(input: AddressInput) {
  const a = normalizeAddress(input)
  return {
    label: a.label,
    custom_label: a.customLabel,
    recipient_name: a.recipientName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    area: a.area,
    city: a.city,
    region: a.region,
    postal_code: a.postalCode,
    country_code: a.countryCode,
    landmark: a.landmark,
    delivery_instructions: a.deliveryInstructions,
  }
}

const bowlFromRow = (r: {
  id: string
  name: string
  configuration: unknown
  created_at: string
  updated_at: string
}): SavedBowlRecord => ({
  id: r.id,
  name: r.name,
  configuration: r.configuration,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

/** Browser repository using the publishable key; every query is constrained by RLS. */
export function createSupabaseAccountRepository(client: SupabaseClient): AccountRepository {
  const userId = async () => {
    const { data } = await client.auth.getSession()
    const id = data.session?.user.id
    if (!id)
      throw new AccountError('unauthenticated', 'Your session has expired. Please sign in again.')
    return id
  }
  const check = <T>(res: { data: T; error: PostgrestError | null }) => {
    if (res.error) throw toAccountError(res.error)
    return res.data
  }
  const one = <T>(res: { data: T; error: PostgrestError | null }): NonNullable<T> => {
    const d = check(res)
    if (d === null || d === undefined) throw new AccountError('not-found', 'Not found.')
    return d as NonNullable<T>
  }
  const guardId = (id: string) => {
    if (!UUID_RE.test(id)) throw new AccountError('not-found', 'Not found.')
  }

  return {
    async getProfile() {
      const id = await userId()
      const row = check(
        await client.from('profiles').select('id,full_name,phone').eq('id', id).maybeSingle(),
      )
      if (row) return { id: row.id, fullName: row.full_name, phone: row.phone } as Profile
      // Missing-profile recovery (RLS allows inserting only your own row).
      const created = one(
        await client.from('profiles').insert({ id }).select('id,full_name,phone').single(),
      )
      return { id: created.id, fullName: created.full_name, phone: created.phone }
    },
    async updateProfile(input) {
      const id = await userId()
      const p = normalizeProfile(input)
      const row = one(
        await client
          .from('profiles')
          .update({ full_name: p.fullName, phone: p.phone })
          .eq('id', id)
          .select('id,full_name,phone')
          .single(),
      )
      return { id: row.id, fullName: row.full_name, phone: row.phone }
    },
    async listAddresses() {
      const rows = check(
        await client.from('customer_addresses').select(ADDRESS_COLS).order('created_at'),
      )
      return (rows as AddressRow[]).map(addressFromRow)
    },
    async createAddress(input) {
      const row = check(
        await client
          .from('customer_addresses')
          .insert({ ...addressToRow(input), is_default: Boolean(input.isDefault) })
          .select(ADDRESS_COLS)
          .single(),
      )
      return addressFromRow(row as AddressRow)
    },
    async updateAddress(id, input) {
      guardId(id)
      const row = check(
        await client
          .from('customer_addresses')
          .update(addressToRow(input))
          .eq('id', id)
          .select(ADDRESS_COLS)
          .maybeSingle(),
      )
      if (!row) throw new AccountError('not-found', 'Address not found')
      return addressFromRow(row as AddressRow)
    },
    async deleteAddress(id) {
      guardId(id)
      const rows = check(await client.from('customer_addresses').delete().eq('id', id).select('id'))
      if (!rows?.length) throw new AccountError('not-found', 'Address not found')
    },
    async setDefaultAddress(id) {
      guardId(id)
      check(await client.rpc('set_default_address', { address_id: id }))
    },
    async getPreferences() {
      const row = check(
        await client
          .from('customer_preferences')
          .select('spice_level,include_cutlery')
          .maybeSingle(),
      )
      return row
        ? { spiceLevel: row.spice_level, includeCutlery: row.include_cutlery }
        : { ...DEFAULT_PREFERENCES }
    },
    async savePreferences(p) {
      const row = one(
        await client
          .from('customer_preferences')
          .upsert(
            {
              user_id: await userId(),
              spice_level: p.spiceLevel,
              include_cutlery: p.includeCutlery,
            },
            { onConflict: 'user_id' },
          )
          .select('spice_level,include_cutlery')
          .single(),
      )
      return { spiceLevel: row.spice_level, includeCutlery: row.include_cutlery }
    },
    async listSavedBowls() {
      const rows = check(
        await client
          .from('saved_bowls')
          .select('id,name,configuration,created_at,updated_at')
          .order('updated_at', { ascending: false }),
      )
      return (rows ?? []).map(bowlFromRow)
    },
    async getSavedBowl(id) {
      if (!UUID_RE.test(id)) return null
      const row = check(
        await client
          .from('saved_bowls')
          .select('id,name,configuration,created_at,updated_at')
          .eq('id', id)
          .maybeSingle(),
      )
      return row ? bowlFromRow(row) : null
    },
    async createSavedBowl(name, configuration) {
      const row = one(
        await client
          .from('saved_bowls')
          .insert({ name: name.trim(), configuration: encodeConfiguration(configuration) })
          .select('id,name,configuration,created_at,updated_at')
          .single(),
      )
      return bowlFromRow(row)
    },
    async renameSavedBowl(id, name) {
      guardId(id)
      const row = check(
        await client
          .from('saved_bowls')
          .update({ name: name.trim() })
          .eq('id', id)
          .select('id,name,configuration,created_at,updated_at')
          .maybeSingle(),
      )
      if (!row) throw new AccountError('not-found', 'Saved bowl not found')
      return bowlFromRow(row)
    },
    async deleteSavedBowl(id) {
      guardId(id)
      const rows = check(await client.from('saved_bowls').delete().eq('id', id).select('id'))
      if (!rows?.length) throw new AccountError('not-found', 'Saved bowl not found')
    },
  }
}
