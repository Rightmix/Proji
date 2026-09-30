import { MediaCircle, SelectableCard, SelectableGroup } from '../ui'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import { formatAddOn } from '../../features/builder/pricing'
import { LIMITS, selectedIn } from '../../features/builder/selectionRules'
import type {
  BuilderIngredient,
  Category,
  LimitNotice,
  Selection,
} from '../../features/builder/types'

const COPY: Record<Category, { legend: string; hint: string }> = {
  base: { legend: 'Choose your base', hint: 'Pick one' },
  protein: { legend: 'Choose your protein', hint: 'Pick one' },
  flavour: { legend: 'Choose your flavours', hint: 'Pick up to 2' },
  topping: { legend: 'Add your toppings', hint: 'Pick up to 3' },
}
const NOUN: Record<'flavour' | 'topping', string> = { flavour: 'flavours', topping: 'toppings' }

function meta(i: BuilderIngredient) {
  const v = i.values
  const parts = [
    i.category === 'base' || i.category === 'protein' ? `${v.proteinG}g protein` : null,
    `${v.energyKcal} kcal`,
    formatAddOn(v.priceMinor),
  ]
  return parts.filter(Boolean).join(' • ')
}

export function IngredientSelector({
  category,
  selection,
  index,
  notice,
  onToggle,
}: {
  category: Category
  selection: Selection
  index: IngredientIndex
  notice: LimitNotice | null
  onToggle: (id: string) => void
}) {
  const value = selectedIn(selection, category)
  const single = category === 'base' || category === 'protein'
  const max = LIMITS[category].max
  const atMax = !single && value.length >= max
  return (
    <div role="tabpanel" id={`panel-${category}`} aria-labelledby={`tab-${category}`}>
      <SelectableGroup
        legend={COPY[category].legend}
        hint={COPY[category].hint}
        mode={single ? 'single' : 'multiple'}
        max={single ? undefined : max}
        value={value}
        onChange={(next) => {
          const added = next.find((id) => !value.includes(id))
          const removed = value.find((id) => !next.includes(id))
          const id = added ?? removed
          if (id) onToggle(id)
        }}
      >
        {index.byCategory[category].map((i) => (
          <SelectableCard
            key={i.id}
            value={i.id}
            title={i.name}
            description={i.description}
            meta={meta(i)}
            media={
              <MediaCircle>
                <img
                  src={i.thumbnailSrc}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="size-12"
                />
              </MediaCircle>
            }
          />
        ))}
      </SelectableGroup>
      {!single && (atMax || notice?.category === category) && (
        <p role="status" className="mt-3 rounded-md bg-select-50 px-3 py-2 text-sm text-select-700">
          You’ve picked the maximum of {max} {NOUN[category as 'flavour' | 'topping']}. Remove one
          to choose another.
        </p>
      )}
    </div>
  )
}
