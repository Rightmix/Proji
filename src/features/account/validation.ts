import {
  ADDRESS_LABELS,
  SPICE_LEVELS,
  type AddressInput,
  type Preferences,
  type ProfileInput,
} from './types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export const PHONE_RE = /^\+?[0-9][0-9 ()-]{5,19}$/
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const POSTAL_RE = /^[A-Za-z0-9 -]{2,12}$/
const COUNTRY_RE = /^[A-Z]{2}$/

/** Countries offered in the UI. Data model is ISO 3166-1 alpha-2 and not limited to these. */
export const COUNTRIES = [
  { code: 'IN', name: 'India', postalLabel: 'PIN code', regionLabel: 'State' },
  {
    code: 'BH',
    name: 'Bahrain',
    postalLabel: 'Postal code (optional)',
    regionLabel: 'Governorate',
  },
] as const

const clean = (s: string | null | undefined) => {
  const t = (s ?? '').trim()
  return t.length ? t : null
}
const tooLong = (s: string | null, max: number) =>
  s && s.length > max ? `Keep this under ${max} characters.` : undefined

export function normalizeProfile(p: ProfileInput): ProfileInput {
  return { fullName: clean(p.fullName), phone: clean(p.phone) }
}
export function validateProfile(p: ProfileInput): FieldErrors<ProfileInput> {
  const n = normalizeProfile(p)
  const e: FieldErrors<ProfileInput> = {}
  if (n.fullName && n.fullName.length > 120) e.fullName = 'Keep your name under 120 characters.'
  if (n.phone && !PHONE_RE.test(n.phone))
    e.phone = 'Enter a valid phone number, e.g. +91 98470 12345.'
  return e
}

export function normalizeAddress(a: AddressInput): AddressInput {
  return {
    label: a.label,
    customLabel: a.label === 'other' ? clean(a.customLabel) : null,
    recipientName: (a.recipientName ?? '').trim(),
    phone: (a.phone ?? '').trim(),
    line1: (a.line1 ?? '').trim(),
    line2: clean(a.line2),
    area: clean(a.area),
    city: (a.city ?? '').trim(),
    region: clean(a.region),
    postalCode: clean(a.postalCode),
    countryCode: (a.countryCode ?? '').trim().toUpperCase(),
    landmark: clean(a.landmark),
    deliveryInstructions: clean(a.deliveryInstructions),
  }
}

export function validateAddress(raw: AddressInput): FieldErrors<AddressInput> {
  const a = normalizeAddress(raw)
  const e: FieldErrors<AddressInput> = {}
  if (!ADDRESS_LABELS.includes(a.label)) e.label = 'Choose a label.'
  if (a.customLabel && a.customLabel.length > 40)
    e.customLabel = 'Keep the label under 40 characters.'
  if (!a.recipientName) e.recipientName = 'Enter the recipient’s name.'
  else e.recipientName = tooLong(a.recipientName, 120)
  if (!a.phone) e.phone = 'Enter a contact phone number.'
  else if (!PHONE_RE.test(a.phone)) e.phone = 'Enter a valid phone number, e.g. +973 3300 1234.'
  if (!a.line1) e.line1 = 'Enter the building, house or flat details.'
  else e.line1 = tooLong(a.line1, 200)
  e.line2 = tooLong(a.line2, 200)
  e.area = tooLong(a.area, 120)
  if (!a.city) e.city = 'Enter the city or town.'
  else e.city = tooLong(a.city, 120)
  e.region = tooLong(a.region, 120)
  if (!COUNTRY_RE.test(a.countryCode)) e.countryCode = 'Choose a country.'
  if (a.postalCode && !POSTAL_RE.test(a.postalCode))
    e.postalCode = 'Use letters, numbers, spaces or hyphens only.'
  if (a.countryCode === 'IN' && !a.postalCode) e.postalCode = 'Enter the 6-digit PIN code.'
  else if (a.countryCode === 'IN' && a.postalCode && !/^[1-9][0-9]{5}$/.test(a.postalCode))
    e.postalCode = 'PIN codes have 6 digits.'
  e.landmark = tooLong(a.landmark, 120)
  e.deliveryInstructions = tooLong(a.deliveryInstructions, 300)
  for (const k of Object.keys(e) as (keyof AddressInput)[]) if (!e[k]) delete e[k]
  return e
}

export function validatePreferences(p: Preferences): FieldErrors<Preferences> {
  const e: FieldErrors<Preferences> = {}
  if (p.spiceLevel !== null && !SPICE_LEVELS.includes(p.spiceLevel))
    e.spiceLevel = 'Choose a spice level.'
  if (typeof p.includeCutlery !== 'boolean') e.includeCutlery = 'Choose yes or no.'
  return e
}

export function validateBowlName(name: string): string | null {
  const t = name.trim()
  if (!t) return 'Give your bowl a name.'
  if (t.length > 60) return 'Keep the name under 60 characters.'
  return null
}

export const emptyAddress = (countryCode = 'IN'): AddressInput => ({
  label: 'home',
  customLabel: null,
  recipientName: '',
  phone: '',
  line1: '',
  line2: null,
  area: null,
  city: '',
  region: null,
  postalCode: null,
  countryCode,
  landmark: null,
  deliveryInstructions: null,
})
