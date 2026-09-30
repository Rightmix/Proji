import type { BuilderIngredient } from '../../features/builder/types'
import type { NutritionTotals } from '../../features/builder/nutrition'
import { formatInr, type PriceTotal } from '../../features/builder/pricing'
import { PrototypeNotice } from './PrototypeNotice'

/** Per-ingredient breakdown table for the View Nutrition dialog. */
export function NutritionDetails({
  items,
  totals,
  price,
}: {
  items: readonly BuilderIngredient[]
  totals: NutritionTotals
  price: PriceTotal
}) {
  if (!items.length)
    return <p className="text-ink-muted">Choose a base to see nutrition estimates.</p>
  return (
    <div className="flex flex-col gap-4">
      <PrototypeNotice long />
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">Illustrative nutrition and price per ingredient</caption>
          <thead>
            <tr className="border-b border-line text-left text-label uppercase text-ink-muted">
              <th scope="col" className="py-2 pr-2 font-semibold">
                Ingredient
              </th>
              <th scope="col" className="px-1 text-right font-semibold">
                Kcal
              </th>
              <th scope="col" className="px-1 text-right font-semibold">
                Protein
              </th>
              <th scope="col" className="px-1 text-right font-semibold">
                Carbs
              </th>
              <th scope="col" className="px-1 text-right font-semibold">
                Fat
              </th>
              <th scope="col" className="pl-1 text-right font-semibold">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-line">
                <th scope="row" className="py-2 pr-2 text-left font-medium">
                  {i.name}
                </th>
                <td className="px-1 text-right">{i.values.energyKcal}</td>
                <td className="px-1 text-right">{i.values.proteinG}g</td>
                <td className="px-1 text-right">{i.values.carbsG}g</td>
                <td className="px-1 text-right">{i.values.fatG}g</td>
                <td className="pl-1 text-right">{formatInr(i.values.priceMinor)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <th scope="row" className="py-2 pr-2 text-left">
                Total
              </th>
              <td className="px-1 text-right">{totals.energyKcal}</td>
              <td className="px-1 text-right">{totals.proteinG}g</td>
              <td className="px-1 text-right">{totals.carbsG}g</td>
              <td className="px-1 text-right">{totals.fatG}g</td>
              <td className="pl-1 text-right">{formatInr(price.amountMinor)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
