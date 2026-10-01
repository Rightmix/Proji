import { addressFromRow, addressToRow, toAccountError } from './supabaseRepository'
import { emptyAddress } from './validation'

describe('Supabase mapping', () => {
  it('addressToRow never sends ownership or server-managed columns', () => {
    const row = addressToRow({
      ...emptyAddress('IN'),
      recipientName: ' A ',
      phone: '123456',
      line1: 'x',
      city: 'y',
      postalCode: '673001',
    })
    expect(Object.keys(row)).not.toEqual(expect.arrayContaining(['user_id']))
    for (const k of ['user_id', 'id', 'created_at', 'updated_at', 'is_default'])
      expect(row).not.toHaveProperty(k)
    expect(row.recipient_name).toBe('A')
  })
  it('row ↔ domain mapping', () => {
    const a = addressFromRow({
      id: 'i',
      label: 'work',
      custom_label: null,
      recipient_name: 'R',
      phone: '1',
      line1: 'L',
      line2: null,
      area: null,
      city: 'C',
      region: null,
      postal_code: null,
      country_code: 'BH',
      landmark: null,
      delivery_instructions: null,
      is_default: true,
      created_at: 't',
      updated_at: 'u',
    })
    expect(a).toMatchObject({ id: 'i', label: 'work', countryCode: 'BH', isDefault: true })
  })
  it('maps database errors to stable codes', () => {
    expect(toAccountError({ code: 'PGRST301', message: 'JWT expired' }).code).toBe(
      'unauthenticated',
    )
    expect(toAccountError({ code: '23505', message: 'dup' }).code).toBe('conflict')
    expect(toAccountError({ code: '23514', message: 'saved bowl limit reached' }).code).toBe(
      'limit',
    )
    expect(toAccountError({ code: '23514', message: 'violates check' }).code).toBe('invalid')
    expect(toAccountError({ code: 'P0002', message: 'address not found' }).code).toBe('not-found')
    expect(toAccountError({ code: 'XX', message: 'boom' }).code).toBe('unknown')
  })
})
