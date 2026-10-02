import { useMemo, useReducer } from 'react'
import { buildLayers } from './layerOrdering'
import { computeNutrition, selectedIngredients } from './nutrition'
import { computePrice } from './pricing'
import { toConfiguration } from './configuration'
import { createReducer, initialState } from './selectionRules'
import type { IngredientIndex } from './ingredientRepository'
import type { Category, Selection } from './types'

/**
 * Single canonical builder state. Everything visible — layers, macros, price and the
 * final configuration — is derived from `state.selection`; nothing is stored twice.
 */
export function useBowlBuilder(
  index: IngredientIndex,
  initial?: Selection | null,
  initialStep?: Category,
) {
  const reducer = useMemo(() => createReducer(index), [index])
  const [state, dispatch] = useReducer(reducer, initial ?? undefined, (sel) =>
    sel
      ? reducer(initialState(), { type: 'load', selection: sel, step: initialStep })
      : initialState(),
  )
  const derived = useMemo(
    () => ({
      layers: buildLayers(state.selection, index),
      nutrition: computeNutrition(state.selection, index),
      price: computePrice(state.selection, index),
      items: selectedIngredients(state.selection, index),
      configuration: toConfiguration(state.selection),
    }),
    [state.selection, index],
  )
  return { state, dispatch, ...derived }
}
