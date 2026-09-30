import { StatTile } from '../ui'
import type { NutritionTotals } from '../../features/builder/nutrition'

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** Live macro strip (protein highlighted), matching the master layout. */
export function NutritionSummary({
  totals,
  highlight,
}: {
  totals: NutritionTotals
  highlight: boolean
}) {
  return (
    <div
      className="rounded-lg border border-line bg-surface px-1.5 py-1 shadow-card"
      aria-live="polite"
    >
      <div className="grid grid-cols-4 gap-1">
        <StatTile value={fmt(totals.energyKcal)} label="Kcal" />
        <StatTile value={`${fmt(totals.proteinG)}g`} label="Protein" highlight={highlight} />
        <StatTile value={`${fmt(totals.carbsG)}g`} label="Carbs" />
        <StatTile value={`${fmt(totals.fatG)}g`} label="Fats" />
      </div>
    </div>
  )
}
