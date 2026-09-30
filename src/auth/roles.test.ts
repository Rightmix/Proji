import { AREA_ROLES, hasAnyRole, isRole } from './roles'

describe('roles', () => {
  it('validates role strings', () => {
    expect(isRole('admin')).toBe(true)
    expect(isRole('superuser')).toBe(false)
    expect(isRole(undefined)).toBe(false)
  })
  it('customer cannot enter admin or kitchen', () => {
    expect(hasAnyRole(['customer'], AREA_ROLES.admin)).toBe(false)
    expect(hasAnyRole(['customer'], AREA_ROLES.kitchen)).toBe(false)
    expect(hasAnyRole(['customer'], AREA_ROLES.account)).toBe(true)
  })
  it('kitchen cannot enter admin', () => {
    expect(hasAnyRole(['customer', 'kitchen'], AREA_ROLES.admin)).toBe(false)
    expect(hasAnyRole(['customer', 'kitchen'], AREA_ROLES.kitchen)).toBe(true)
  })
  it('admin and rd enter admin area', () => {
    expect(hasAnyRole(['admin'], AREA_ROLES.admin)).toBe(true)
    expect(hasAnyRole(['rd'], AREA_ROLES.admin)).toBe(true)
    expect(hasAnyRole(['rd'], AREA_ROLES.kitchen)).toBe(false)
  })
})
