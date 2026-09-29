export const ROLES = ['customer', 'admin', 'rd', 'kitchen'] as const
export type Role = (typeof ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/** Roles permitted in each privileged route area. Mirrors database policies. */
export const AREA_ROLES = {
  account: ['customer', 'admin', 'rd', 'kitchen'],
  admin: ['admin', 'rd'],
  kitchen: ['kitchen', 'admin'],
} as const satisfies Record<string, readonly Role[]>

export function hasAnyRole(userRoles: readonly Role[], allowed: readonly Role[]): boolean {
  return userRoles.some((r) => allowed.includes(r))
}
