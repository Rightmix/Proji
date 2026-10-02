import { assets } from '../../lib/assets'
import type { SignatureBowl } from './types'

/**
 * DEVELOPMENT FIXTURES — NOT PRODUCTION DATA.
 * Concept bowls for building and testing the catalog UI. Names/components are
 * illustrative, not final recipes. Nutrition, prices and allergens are intentionally
 * 'unavailable' and must come from Stage 7 validated recipes.
 * Never seed these into Supabase.
 */
const unvalidated = { status: 'unavailable' } as const

function fixture(
  b: Omit<SignatureBowl, 'nutrition' | 'price' | 'allergens' | 'recipeVersionId' | 'dataStatus'>,
): SignatureBowl {
  return {
    ...b,
    nutrition: unvalidated,
    price: unvalidated,
    allergens: unvalidated,
    recipeVersionId: null,
    dataStatus: 'development-fixture',
  }
}

export const DEVELOPMENT_FIXTURE_BOWLS: readonly SignatureBowl[] = [
  fixture({
    id: 'dev-bowl-001',
    slug: 'kerala-pepper-chicken-kanji',
    name: 'Kerala Pepper Chicken Kanji',
    summary: 'Brown rice kanji, pepper chicken, curry leaves',
    description:
      'Concept: slow-cooked brown rice kanji with pepper-seasoned chicken, finished with curry leaves and crispy shallots.',
    baseFamily: 'brown-rice',
    proteinType: 'chicken',
    components: [
      { ingredientId: 'base.brown-rice-kanji', name: 'Brown rice kanji', role: 'base' },
      { ingredientId: 'protein.pepper-chicken', name: 'Pepper chicken', role: 'protein' },
      { ingredientId: 'flavour.kerala-pepper', name: 'Kerala pepper seasoning', role: 'flavour' },
      { ingredientId: 'topping.curry-leaves', name: 'Curry leaves', role: 'topping' },
      { ingredientId: 'topping.crispy-shallots', name: 'Crispy shallots', role: 'topping' },
    ],
    image: assets.homeHeroBowl,
    availability: { state: 'available' },
    sortOrder: 10,
  }),
  fixture({
    id: 'dev-bowl-002',
    slug: 'coconut-fish-millet-kanji',
    name: 'Coconut Fish Millet Kanji',
    summary: 'Millet kanji, grilled fish, coconut sauce',
    description:
      'Concept: millet kanji with Kerala-style grilled fish, a coconut sauce and seasonal vegetables.',
    baseFamily: 'millet',
    proteinType: 'fish',
    components: [
      { ingredientId: 'base.millet-kanji', name: 'Millet kanji', role: 'base' },
      { ingredientId: 'protein.kerala-grilled-fish', name: 'Kerala grilled fish', role: 'protein' },
      {
        ingredientId: 'flavour.kerala-coconut-sauce',
        name: 'Kerala coconut sauce',
        role: 'flavour',
      },
      {
        ingredientId: 'vegetable.seasonal-vegetables',
        name: 'Seasonal vegetables',
        role: 'vegetable',
      },
      { ingredientId: 'topping.fresh-herbs', name: 'Fresh herbs', role: 'topping' },
    ],
    image: null,
    availability: { state: 'available' },
    sortOrder: 20,
  }),
  fixture({
    id: 'dev-bowl-003',
    slug: 'tandoori-paneer-red-rice-kanji',
    name: 'Tandoori Paneer Red Rice Kanji',
    summary: 'Kerala matta red rice kanji, tandoori paneer',
    description:
      'Concept: Kerala matta red rice kanji with tandoori-spiced paneer and roasted onions.',
    baseFamily: 'red-rice',
    proteinType: 'vegetarian',
    components: [
      { ingredientId: 'base.red-rice-kanji', name: 'Red rice kanji', role: 'base' },
      { ingredientId: 'protein.tandoori-paneer', name: 'Tandoori paneer', role: 'protein' },
      { ingredientId: 'flavour.tandoori', name: 'Tandoori seasoning', role: 'flavour' },
      { ingredientId: 'topping.roasted-onions', name: 'Roasted onions', role: 'topping' },
      { ingredientId: 'accompaniment.papadam', name: 'Papadam', role: 'accompaniment' },
    ],
    image: null,
    availability: { state: 'sold-out', note: 'Sample sold-out state' },
    sortOrder: 30,
  }),
  fixture({
    id: 'dev-bowl-004',
    slug: 'kerala-beef-roast-quinoa-bowl',
    name: 'Kerala Beef Roast Quinoa Bowl',
    summary: 'Quinoa base, Kerala-style beef roast',
    description: 'Concept: quinoa bowl with Kerala-style beef roast, onions and curry leaves.',
    baseFamily: 'quinoa',
    proteinType: 'beef',
    components: [
      { ingredientId: 'base.quinoa', name: 'Quinoa', role: 'base' },
      { ingredientId: 'protein.kerala-beef-roast', name: 'Kerala beef roast', role: 'protein' },
      { ingredientId: 'topping.curry-leaves', name: 'Curry leaves', role: 'topping' },
      { ingredientId: 'topping.roasted-onions', name: 'Roasted onions', role: 'topping' },
    ],
    image: null,
    availability: { state: 'coming-soon' },
    sortOrder: 40,
  }),
  // Stage 5.5: discovery samples composed only of Stage 4 builder ingredients, so the
  // UI can show labelled ILLUSTRATIVE estimates (see src/features/meals/mealEstimate.ts).
  fixture({
    id: 'dev-bowl-005',
    slug: 'pepper-chicken-brown-rice-bowl',
    name: 'Pepper Chicken Brown Rice Bowl',
    summary: 'Brown rice kanji, pepper chicken, garlic tadka',
    description:
      'Concept: brown rice kanji with pepper chicken, garlic tadka, crispy shallots and fresh herbs.',
    baseFamily: 'brown-rice',
    proteinType: 'chicken',
    components: [
      { ingredientId: 'base.brown-rice-kanji', name: 'Brown rice kanji', role: 'base' },
      { ingredientId: 'protein.pepper-chicken', name: 'Pepper chicken', role: 'protein' },
      { ingredientId: 'flavour.garlic-tadka', name: 'Garlic tadka', role: 'flavour' },
      { ingredientId: 'topping.crispy-shallots', name: 'Crispy shallots', role: 'topping' },
      { ingredientId: 'topping.fresh-herbs', name: 'Fresh herbs', role: 'topping' },
    ],
    image: null,
    availability: { state: 'available' },
    sortOrder: 50,
  }),
  fixture({
    id: 'dev-bowl-006',
    slug: 'grilled-fish-millet-bowl',
    name: 'Grilled Fish Millet Bowl',
    summary: 'Millet kanji, grilled fish, herb mint sauce',
    description:
      'Concept: millet kanji with Kerala-style grilled fish, herb mint sauce, pickled vegetables and herbs.',
    baseFamily: 'millet',
    proteinType: 'fish',
    components: [
      { ingredientId: 'base.millet-kanji', name: 'Millet kanji', role: 'base' },
      { ingredientId: 'protein.kerala-grilled-fish', name: 'Kerala grilled fish', role: 'protein' },
      { ingredientId: 'flavour.herb-mint-sauce', name: 'Herb mint sauce', role: 'flavour' },
      { ingredientId: 'topping.pickled-vegetables', name: 'Pickled vegetables', role: 'topping' },
      { ingredientId: 'topping.fresh-herbs', name: 'Fresh herbs', role: 'topping' },
    ],
    image: null,
    availability: { state: 'available' },
    sortOrder: 60,
  }),
  fixture({
    id: 'dev-bowl-007',
    slug: 'chilli-soya-red-rice-bowl',
    name: 'Chilli Soya Red Rice Bowl',
    summary: 'Red rice kanji, roasted soya, chilli oil',
    description:
      'Concept: Kerala matta red rice kanji with roasted soya chunks, chilli oil, peanuts and pickled vegetables.',
    baseFamily: 'red-rice',
    proteinType: 'vegetarian',
    components: [
      { ingredientId: 'base.red-rice-kanji', name: 'Red rice kanji', role: 'base' },
      { ingredientId: 'protein.roasted-soya-chunks', name: 'Roasted soya chunks', role: 'protein' },
      { ingredientId: 'flavour.spicy-chilli-oil', name: 'Spicy chilli oil', role: 'flavour' },
      { ingredientId: 'topping.roasted-peanuts', name: 'Roasted peanuts', role: 'topping' },
      { ingredientId: 'topping.pickled-vegetables', name: 'Pickled vegetables', role: 'topping' },
    ],
    image: null,
    availability: { state: 'available' },
    sortOrder: 70,
  }),
  fixture({
    id: 'dev-bowl-008',
    slug: 'coconut-egg-millet-kanji',
    name: 'Coconut Egg Millet Kanji',
    summary: 'Millet kanji, boiled egg, coconut sauce',
    description: 'Concept: millet kanji with boiled egg, Kerala coconut sauce and crispy shallots.',
    baseFamily: 'millet',
    proteinType: 'egg',
    components: [
      { ingredientId: 'base.millet-kanji', name: 'Millet kanji', role: 'base' },
      { ingredientId: 'protein.boiled-egg', name: 'Boiled egg', role: 'protein' },
      {
        ingredientId: 'flavour.kerala-coconut-sauce',
        name: 'Kerala coconut sauce',
        role: 'flavour',
      },
      { ingredientId: 'topping.crispy-shallots', name: 'Crispy shallots', role: 'topping' },
    ],
    image: null,
    availability: { state: 'available' },
    sortOrder: 80,
  }),
]
