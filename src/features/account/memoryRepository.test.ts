import { createMemoryAccountRepository, emptyStore } from './memoryRepository'
import { emptyAddress } from './validation'
import { AccountError, type AddressInput } from './types'
import type { BowlConfiguration } from '../builder/types'

const addr = (line1: string): AddressInput => ({
  ...emptyAddress('BH'),
  recipientName: 'A',
  phone: '+97333001234',
  line1,
  city: 'Manama',
})
const cfg: BowlConfiguration = {
  version: 1,
  baseId: 'base.millet-kanji',
  proteinId: 'protein.boiled-egg',
  flavourIds: [],
  toppingIds: [],
}

function setup() {
  const store = emptyStore()
  let who: string | null = 'user-a'
  const repo = createMemoryAccountRepository(store, () => who)
  return { store, repo, as: (u: string | null) => (who = u) }
}

describe('R-01 memory repository mirrors RLS ownership and DB rules', () => {
  it('user B cannot see or modify user A data', async () => {
    const { repo, as } = setup()
    const a = await repo.createAddress(addr('A1'))
    const b = await repo.createSavedBowl('Mine', cfg)
    await repo.savePreferences({ spiceLevel: 'hot', includeCutlery: false })
    as('user-b')
    expect(await repo.listAddresses()).toEqual([])
    expect(await repo.listSavedBowls()).toEqual([])
    expect(await repo.getSavedBowl(b.id)).toBeNull()
    expect((await repo.getPreferences()).spiceLevel).toBeNull()
    await expect(repo.updateAddress(a.id, addr('X'))).rejects.toMatchObject({ code: 'not-found' })
    await expect(repo.deleteAddress(a.id)).rejects.toMatchObject({ code: 'not-found' })
    await expect(repo.setDefaultAddress(a.id)).rejects.toMatchObject({ code: 'not-found' })
    await expect(repo.renameSavedBowl(b.id, 'x')).rejects.toMatchObject({ code: 'not-found' })
    await expect(repo.deleteSavedBowl(b.id)).rejects.toMatchObject({ code: 'not-found' })
    as('user-a')
    expect(await repo.listAddresses()).toHaveLength(1)
  })
  it('signed-out/expired session → unauthenticated', async () => {
    const { repo, as } = setup()
    as(null)
    await expect(repo.listAddresses()).rejects.toBeInstanceOf(AccountError)
    await expect(repo.getProfile()).rejects.toMatchObject({ code: 'unauthenticated' })
  })
  it('default address rules', async () => {
    const { repo } = setup()
    const a1 = await repo.createAddress(addr('A1'))
    const a2 = await repo.createAddress(addr('A2'))
    expect([a1.isDefault, a2.isDefault]).toEqual([true, false])
    const a3 = await repo.createAddress({ ...addr('A3'), isDefault: true })
    let list = await repo.listAddresses()
    expect(list.filter((a) => a.isDefault).map((a) => a.id)).toEqual([a3.id])
    await repo.setDefaultAddress(a2.id)
    list = await repo.listAddresses()
    expect(list.filter((a) => a.isDefault).map((a) => a.id)).toEqual([a2.id])
    await repo.deleteAddress(a2.id)
    list = await repo.listAddresses()
    expect(list.filter((a) => a.isDefault)).toHaveLength(1)
  })
  it('limits, name conflicts, validation', async () => {
    const { repo } = setup()
    for (let i = 0; i < 20; i++) await repo.createAddress(addr(`L${i}`))
    await expect(repo.createAddress(addr('L21'))).rejects.toMatchObject({ code: 'limit' })
    await repo.createSavedBowl('Gym Bowl', cfg)
    await expect(repo.createSavedBowl(' gym bowl ', cfg)).rejects.toMatchObject({
      code: 'conflict',
    })
    await expect(repo.createSavedBowl('', cfg)).rejects.toMatchObject({ code: 'invalid' })
    await expect(repo.createAddress({ ...addr('x'), phone: 'nope' })).rejects.toMatchObject({
      code: 'invalid',
    })
  })
  it('saved bowls store IDs only (no names/prices/macros)', async () => {
    const { repo } = setup()
    const b = await repo.createSavedBowl('Plain', cfg)
    expect(b.configuration).toEqual(cfg)
    expect(JSON.stringify(b.configuration)).not.toMatch(/price|kcal|name/i)
  })
  it('missing profile is created on read', async () => {
    const { repo, store } = setup()
    expect(store.profiles['user-a']).toBeUndefined()
    expect(await repo.getProfile()).toEqual({ id: 'user-a', fullName: null, phone: null })
  })
})
