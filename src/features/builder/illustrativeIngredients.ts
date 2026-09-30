import type { BuilderIngredient, IngredientSource } from './types'

/**
 * ============================================================================
 *  ILLUSTRATIVE DESIGN FIXTURES — PROTOTYPE ONLY
 * ============================================================================
 * Nutrition and ₹ prices below come from the Stage 4 planning spec (protein/kcal/price)
 * plus explicitly illustrative carbs/fat values. They are NOT validated nutrition, NOT
 * approved menu prices and carry NO allergen or health claims. Do not seed into Supabase,
 * do not reuse in the Stage 3 catalog. Stage 7 supplies validated recipe data.
 * Layer/thumbnail images are procedural prototype illustrations (see
 * docs/stages/STAGE_04_ASSETS.md), not production photography.
 */
const A = '/assets/bowl-builder'

function ing(
  category: BuilderIngredient['category'],
  slug: string,
  name: string,
  description: string,
  v: [kcal: number, protein: number, carbs: number, fat: number, rupees: number],
  placeholderColor: string,
): BuilderIngredient {
  const folder = { base: 'bases', protein: 'proteins', flavour: 'flavours', topping: 'toppings' }[
    category
  ]
  return {
    id: `${category}.${slug}`,
    category,
    name,
    description,
    values: { energyKcal: v[0], proteinG: v[1], carbsG: v[2], fatG: v[3], priceMinor: v[4] * 100 },
    layerSrc: `${A}/${folder}/${slug}.webp`,
    thumbnailSrc: `${A}/thumbnails/${category}.${slug}.webp`,
    placeholderColor,
  }
}

export const ILLUSTRATIVE_INGREDIENTS: readonly BuilderIngredient[] = [
  ing(
    'base',
    'brown-rice-kanji',
    'Brown Rice Kanji',
    'Slow-cooked brown rice',
    [220, 5, 45, 2, 120],
    '#d6c4a6',
  ),
  ing(
    'base',
    'millet-kanji',
    'Millet Kanji',
    'Slow-cooked millet',
    [200, 6, 40, 2, 130],
    '#decc96',
  ),
  ing(
    'base',
    'red-rice-kanji',
    'Red Rice Kanji',
    'Kerala matta rice',
    [230, 5, 48, 2, 130],
    '#cea69a',
  ),
  ing(
    'protein',
    'kerala-grilled-fish',
    'Kerala Grilled Fish',
    'Kerala-style grilled',
    [180, 28, 0, 8, 150],
    '#c47834',
  ),
  ing(
    'protein',
    'pepper-chicken',
    'Pepper Chicken',
    'Pepper-seasoned',
    [200, 30, 2, 7, 140],
    '#e8c8a8',
  ),
  ing(
    'protein',
    'roasted-soya-chunks',
    'Roasted Soya Chunks',
    'Roasted, plant-based',
    [160, 20, 8, 1, 90],
    '#7a4824',
  ),
  ing('protein', 'boiled-egg', 'Boiled Egg', 'Boiled, halved', [140, 13, 1, 10, 40], '#f0b028'),
  ing(
    'flavour',
    'kerala-coconut-sauce',
    'Kerala Coconut Sauce',
    'Classic, creamy',
    [80, 1, 3, 7, 30],
    '#f6f0e0',
  ),
  ing(
    'flavour',
    'spicy-chilli-oil',
    'Spicy Chilli Oil',
    'Bold & spicy',
    [30, 0, 1, 3, 20],
    '#c43416',
  ),
  ing(
    'flavour',
    'herb-mint-sauce',
    'Herb Mint Sauce',
    'Fresh & tangy',
    [25, 1, 3, 1, 20],
    '#569242',
  ),
  ing('flavour', 'garlic-tadka', 'Garlic Tadka', 'Aromatic', [45, 0, 2, 4, 20], '#d6a23a'),
  ing(
    'topping',
    'roasted-peanuts',
    'Roasted Peanuts',
    'Crunchy & nutty',
    [60, 3, 2, 5, 20],
    '#c48c50',
  ),
  ing(
    'topping',
    'crispy-shallots',
    'Crispy Shallots',
    'Adds texture',
    [45, 1, 5, 3, 20],
    '#965018',
  ),
  ing(
    'topping',
    'fresh-herbs',
    'Fresh Herbs',
    'Coriander, curry leaves',
    [10, 0, 2, 0, 10],
    '#4a8e34',
  ),
  ing(
    'topping',
    'pickled-vegetables',
    'Pickled Vegetables',
    'Tangy & fresh',
    [20, 0, 4, 0, 10],
    '#ec6e22',
  ),
]

export const ILLUSTRATIVE_SOURCE: IngredientSource = {
  dataStatus: 'illustrative-fixture',
  ingredients: ILLUSTRATIVE_INGREDIENTS,
}
