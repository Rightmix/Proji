import { defaultIngredientIndex as IDX } from './ingredientRepository'
import { assetsToPreload, preloadImages, resetPreloadCache } from './assetPreloader'

describe('R-08 progressive preloading', () => {
  beforeEach(() => resetPreloadCache())
  it('base step: base layers + protein thumbnails/layers only', () => {
    const urls = assetsToPreload('base', IDX)
    expect(urls.filter((u) => u.includes('/bases/'))).toHaveLength(3)
    expect(urls.some((u) => u.includes('/flavours/') || u.includes('flavour.'))).toBe(false)
    expect(urls.some((u) => u.includes('/toppings/') || u.includes('topping.'))).toBe(false)
  })
  it('topping step has no next step', () => {
    expect(assetsToPreload('topping', IDX).every((u) => u.includes('/toppings/'))).toBe(true)
  })
  it('each url is requested once per session', () => {
    const created: HTMLImageElement[] = []
    const make = () => {
      const i = {} as HTMLImageElement
      created.push(i)
      return i
    }
    preloadImages(['/a.webp', '/b.webp'], make)
    preloadImages(['/a.webp', '/c.webp'], make)
    expect(created.map((i) => i.src)).toEqual(['/a.webp', '/b.webp', '/c.webp'])
  })
})
