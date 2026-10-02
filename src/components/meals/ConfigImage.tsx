import { useMemo } from 'react'
import { BowlRenderer } from '../builder/BowlRenderer'
import { buildLayers } from '../../features/builder/layerOrdering'
import { defaultIngredientIndex as IDX } from '../../features/builder/ingredientRepository'
import type { Selection } from '../../features/builder/types'

/** Small static bowl preview for a configuration (cart lines, summaries). */
export function ConfigImage({
  selection,
  label,
  className,
}: {
  selection: Selection | null
  label: string
  className?: string
}) {
  const layers = useMemo(() => (selection ? buildLayers(selection, IDX) : []), [selection])
  return (
    <div className={className}>
      <BowlRenderer layers={layers} reducedMotion label={label} />
    </div>
  )
}
