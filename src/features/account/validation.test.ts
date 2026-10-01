import {
  emptyAddress,
  normalizeAddress,
  validateAddress,
  validateBowlName,
  validatePreferences,
  validateProfile,
} from './validation'
import type { AddressInput } from './types'

const india: AddressInput = {
  ...emptyAddress('IN'),
  recipientName: 'Akhil',
  phone: '+91 98470 12345',
  line1: 'Flat 4B, Sea View Apartments',
  city: 'Kozhikode',
  region: 'Kerala',
  postalCode: '673001',
}
const bahrain: AddressInput = {
  ...emptyAddress('BH'),
  label: 'work',
  recipientName: 'Akhil',
  phone: '+973 3300 1234',
  line1: 'Building 2411',
  line2: 'Road 2832',
  area: 'Block 428, Seef',
  city: 'Manama',
}

describe('V-01 profile', () => {
  it('accepts empty and valid values', () => {
    expect(validateProfile({ fullName: '', phone: '' })).toEqual({})
    expect(validateProfile({ fullName: 'Akhil Raj', phone: '+973 3300-1234' })).toEqual({})
  })
  it('rejects bad phone and long names', () => {
    expect(validateProfile({ fullName: 'x'.repeat(121), phone: 'call me' })).toEqual({
      fullName: expect.any(String),
      phone: expect.any(String),
    })
  })
})

describe('V-02 address', () => {
  it('valid India and Bahrain addresses (Bahrain postal code optional)', () => {
    expect(validateAddress(india)).toEqual({})
    expect(validateAddress(bahrain)).toEqual({})
  })
  it('India requires a 6-digit PIN', () => {
    expect(validateAddress({ ...india, postalCode: null }).postalCode).toMatch(/PIN/)
    expect(validateAddress({ ...india, postalCode: '67300' }).postalCode).toMatch(/6 digits/)
  })
  it('country-agnostic: any ISO alpha-2 code is structurally valid', () => {
    expect(validateAddress({ ...bahrain, countryCode: 'ae' })).toEqual({})
    expect(validateAddress({ ...bahrain, countryCode: 'UAE' }).countryCode).toBeDefined()
  })
  it('required fields, whitespace-only and length limits', () => {
    const e = validateAddress({
      ...india,
      recipientName: '  ',
      phone: '',
      line1: '',
      city: '',
      deliveryInstructions: 'x'.repeat(301),
    })
    expect(Object.keys(e).sort()).toEqual([
      'city',
      'deliveryInstructions',
      'line1',
      'phone',
      'recipientName',
    ])
  })
  it('normalises: trims, blanks → null, custom label only for other', () => {
    const n = normalizeAddress({ ...india, line2: '  ', customLabel: 'Gym', countryCode: ' in ' })
    expect(n.line2).toBeNull()
    expect(n.customLabel).toBeNull()
    expect(n.countryCode).toBe('IN')
    expect(normalizeAddress({ ...india, label: 'other', customLabel: ' Gym ' }).customLabel).toBe(
      'Gym',
    )
  })
  it('rejects unsafe postal codes', () => {
    expect(validateAddress({ ...bahrain, postalCode: '<b>' }).postalCode).toBeDefined()
  })
})

describe('V-03 preferences and bowl names', () => {
  it('preferences', () => {
    expect(validatePreferences({ spiceLevel: null, includeCutlery: true })).toEqual({})
    expect(
      validatePreferences({ spiceLevel: 'nuclear' as never, includeCutlery: true }).spiceLevel,
    ).toBeDefined()
  })
  it('bowl names', () => {
    expect(validateBowlName('  ')).toMatch(/name/)
    expect(validateBowlName('x'.repeat(61))).toMatch(/60/)
    expect(validateBowlName('Post-gym bowl')).toBeNull()
  })
})
