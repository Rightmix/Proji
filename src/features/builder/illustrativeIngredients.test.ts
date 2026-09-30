import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ILLUSTRATIVE_INGREDIENTS, ILLUSTRATIVE_SOURCE } from './illustrativeIngredients'
import { DEVELOPMENT_FIXTURE_BOWLS } from '../catalog/fixtures'
import { fromCatalogComponents } from './configuration'
import { defaultIngredientIndex } from './ingredientRepository'

const root = resolve(__dirname, '../../..')
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

describe('C-03 fixture isolation', () => {
  it('source is tagged illustrative', () =>
    expect(ILLUSTRATIVE_SOURCE.dataStatus).toBe('illustrative-fixture'))
  it('not referenced by catalog, auth, Supabase or migrations', () => {
    const files = [
      ...walk(join(root, 'src/features/catalog')),
      ...walk(join(root, 'src/auth')),
      ...walk(join(root, 'supabase')),
      join(root, 'src/lib/supabase.ts'),
    ]
    for (const f of files)
      expect(readFileSync(f, 'utf8')).not.toMatch(/illustrativeIngredients|ILLUSTRATIVE_/)
  })
})

describe('C-04 the 15 spec ingredients', () => {
  it('matches the Stage 4 list and counts', () => {
    const by = (c: string) =>
      ILLUSTRATIVE_INGREDIENTS.filter((i) => i.category === c).map((i) => i.name)
    expect(by('base')).toEqual(['Brown Rice Kanji', 'Millet Kanji', 'Red Rice Kanji'])
    expect(by('protein')).toEqual([
      'Kerala Grilled Fish',
      'Pepper Chicken',
      'Roasted Soya Chunks',
      'Boiled Egg',
    ])
    expect(by('flavour')).toEqual([
      'Kerala Coconut Sauce',
      'Spicy Chilli Oil',
      'Herb Mint Sauce',
      'Garlic Tadka',
    ])
    expect(by('topping')).toEqual([
      'Roasted Peanuts',
      'Crispy Shallots',
      'Fresh Herbs',
      'Pickled Vegetables',
    ])
  })
  it('spec protein/kcal/price values are preserved', () => {
    const v = (id: string) => defaultIngredientIndex.byId.get(id)!.values
    expect(v('base.brown-rice-kanji')).toMatchObject({
      proteinG: 5,
      energyKcal: 220,
      priceMinor: 12000,
    })
    expect(v('protein.kerala-grilled-fish')).toMatchObject({
      proteinG: 28,
      energyKcal: 180,
      priceMinor: 15000,
    })
    expect(v('protein.boiled-egg')).toMatchObject({
      proteinG: 13,
      energyKcal: 140,
      priceMinor: 4000,
    })
    expect(v('flavour.kerala-coconut-sauce')).toMatchObject({ energyKcal: 80, priceMinor: 3000 })
    expect(v('topping.pickled-vegetables')).toMatchObject({ energyKcal: 20, priceMinor: 1000 })
  })
  it('ids use Stage 3 role.slug and unique; every asset file exists', () => {
    const ids = ILLUSTRATIVE_INGREDIENTS.map((i) => i.id)
    expect(new Set(ids).size).toBe(15)
    for (const i of ILLUSTRATIVE_INGREDIENTS) {
      expect(i.id).toMatch(new RegExp(`^${i.category}\\.[a-z0-9-]+$`))
      expect(existsSync(join(root, 'public', i.layerSrc))).toBe(true)
      expect(existsSync(join(root, 'public', i.thumbnailSrc))).toBe(true)
    }
  })
  it('Stage 3 catalog components map onto builder ids where they overlap', () => {
    const chicken = DEVELOPMENT_FIXTURE_BOWLS.find((b) => b.slug === 'kerala-pepper-chicken-kanji')!
    const { selection, unsupported } = fromCatalogComponents(
      chicken.components,
      defaultIngredientIndex,
    )
    expect(selection.base).toBe('base.brown-rice-kanji')
    expect(selection.protein).toBe('protein.pepper-chicken')
    expect(selection.toppings).toContain('topping.crispy-shallots')
    expect(unsupported).toEqual(['Kerala pepper seasoning', 'Curry leaves'])
  })
})

describe('P-16 asset budget', () => {
  it('whole builder asset library < 600 KB and each layer < 80 KB', () => {
    const files = walk(join(root, 'public/assets/bowl-builder'))
    const sizes = files.map((f) => statSync(f).size)
    expect(files).toHaveLength(30)
    expect(sizes.reduce((a, b) => a + b, 0)).toBeLessThan(600 * 1024)
    expect(Math.max(...sizes)).toBeLessThan(80 * 1024)
  })
})

describe('C-05 no health or nutrition claims in fixture copy', () => {
  it.each(ILLUSTRATIVE_INGREDIENTS.map((i) => [i.name, i]))('%s', (_n, i) => {
    expect(`${i.name} ${i.description}`).not.toMatch(
      /high[- ]protein|omega|fib(er|re)|low[- ]?gi|antioxidant|lean|clean|healthy|immun|detox|weight|cure|diabet|heart/i,
    )
  })
})
