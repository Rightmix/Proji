import { createCatalogRepository, createStaticRepository, resolveCatalogSource } from './repository'
import { DEVELOPMENT_FIXTURE_BOWLS } from './fixtures'

describe('D-05 catalog source selection', () => {
  it('fixtures in dev and test', () => {
    expect(resolveCatalogSource({ DEV: true, MODE: 'development' })).toBe('fixtures')
    expect(resolveCatalogSource({ DEV: false, MODE: 'test' })).toBe('fixtures')
  })
  it('production defaults to empty; explicit override respected', () => {
    expect(resolveCatalogSource({ DEV: false, MODE: 'production' })).toBe('empty')
    expect(
      resolveCatalogSource({ DEV: false, MODE: 'production', VITE_CATALOG_SOURCE: 'fixtures' }),
    ).toBe('fixtures')
    expect(resolveCatalogSource({ DEV: true, VITE_CATALOG_SOURCE: 'empty' })).toBe('empty')
    expect(
      resolveCatalogSource({ DEV: false, MODE: 'production', VITE_CATALOG_SOURCE: 'bogus' }),
    ).toBe('empty')
  })
  it('empty source serves no bowls', async () => {
    expect(await createCatalogRepository('empty').listBowls()).toEqual([])
  })
  it('repository sorts and finds by slug', async () => {
    const repo = createCatalogRepository('fixtures')
    const list = await repo.listBowls()
    expect(list.map((b) => b.sortOrder)).toEqual(
      [...list.map((b) => b.sortOrder)].sort((a, b) => a - b),
    )
    expect((await repo.getBowl('coconut-fish-millet-kanji'))?.id).toBe('dev-bowl-002')
    expect(await repo.getBowl('nope')).toBeNull()
  })
  it('refuses to serve an invalid catalog', async () => {
    const repo = createStaticRepository([
      DEVELOPMENT_FIXTURE_BOWLS[0],
      DEVELOPMENT_FIXTURE_BOWLS[0],
    ])
    await expect(repo.listBowls()).rejects.toThrow(/integrity/)
  })
})

describe('D-05 fixtures are not in the main bundle path', () => {
  it('lazy source is only invoked on first read', async () => {
    const loader = vi.fn(async () => DEVELOPMENT_FIXTURE_BOWLS)
    const repo = createStaticRepository(loader)
    expect(loader).not.toHaveBeenCalled()
    await repo.listBowls()
    await repo.getBowl('x')
    expect(loader).toHaveBeenCalledTimes(1)
  })
})
