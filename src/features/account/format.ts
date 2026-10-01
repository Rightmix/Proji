import { COUNTRIES } from './validation'
import type { Address } from './types'

const LABEL = { home: 'Home', work: 'Work', other: 'Other' } as const
export const addressTitle = (a: Pick<Address, 'label' | 'customLabel'>) =>
  (a.label === 'other' && a.customLabel) || LABEL[a.label]
const country = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code

export function formatAddress(a: Address) {
  return [
    a.line1,
    a.line2,
    a.area,
    a.city,
    [a.region, a.postalCode].filter(Boolean).join(' '),
    country(a.countryCode),
  ]
    .filter(Boolean)
    .join(', ')
}
