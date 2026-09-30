# Stage 4 Asset Manifest (prototype)

**Status: PROTOTYPE ILLUSTRATIONS. These are not production photography and not approved final assets.**

All 30 files in `public/assets/bowl-builder/` are **procedurally generated illustrations** made by `tools/assets/generate_builder_assets.py`. The script is deterministic, so the same seeds always give the same output. They stand in for the approved hybrid photography and AI-assisted library (D-008), which has not been produced yet. Replacing them only requires new files with the same names and canvas rules; no code changes.

## Canvas and alignment rules
- Every layer is a 560×560 transparent WebP covering the bowl **interior**, with an overhead view and shared lighting direction (shadow offset down-right).
- **Base:** fills the interior disc, with rim shading.
- **Protein:** centred, covering roughly the inner 60%.
- **Flavour:** drawn as an arc near the rim in the upper sector (about 205°–335°). The renderer rotates slot 1 by 180°, so two sauces never overlap each other or cover the protein.
- **Topping:** drawn as a cluster in the upper rim sector (−90° ± 38°). The renderer rotates slots by 60°, 180° and 300°. Toppings sit on the rim ring, not on the protein.
- **Stacking:** base (z 10) < protein (20) < flavours (30–31) < toppings (40–42). This is defined in `src/features/builder/layerOrdering.ts`.
- **Thumbnails:** 112×112 circular WebP for the ingredient cards and tab icons.
- **Empty bowl:** pure CSS (`BowlSurface`), 0 bytes.

## Inventory
| Category | Layers (`<category folder>/<slug>.webp`) | Thumbnails (`thumbnails/<category>.<slug>.webp`) |
|---|---|---|
| Bases (3) | brown-rice-kanji, millet-kanji, red-rice-kanji | ✓ |
| Proteins (4) | kerala-grilled-fish, pepper-chicken, roasted-soya-chunks, boiled-egg | ✓ |
| Flavours (4) | kerala-coconut-sauce, spicy-chilli-oil, herb-mint-sauce, garlic-tadka | ✓ (ramekin) |
| Toppings (4) | roasted-peanuts, crispy-shallots, fresh-herbs, pickled-vegetables | ✓ |

**Weight:** 30 files, about 430 KB in total. Layers are 8–34 KB each and thumbnails 2–4 KB, with a unit-test budget of < 600 KB total and < 80 KB per file.

**Loading:**
- The builder only fetches the current step's layers plus the next step's thumbnails and layers (`assetPreloader.ts`).
- Card thumbnails are lazy-loaded.
- Only selected layers are rendered.

## Replacement workflow (production)
1. Photograph the real prepared ingredients and the master bowl under consistent overhead lighting (D-008).
2. Use AI assistance only for controlled cutouts and missing views, and manually review every composite.
3. Export at 560–720 px WebP with alpha, matching the alignment rules above. Keep each layer < 80 KB.
4. Replace the files, update this manifest's status, and re-run `e2e/builder-visual.spec.ts --update-snapshots` after visual review.
