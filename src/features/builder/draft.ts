import type { Category, Selection } from './types'
import type { IngredientIndex } from './ingredientRepository'
import { sanitizeSelection } from './selectionRules'
import { CATEGORIES } from './types'

/**
 * Session draft so Back / navigation never loses an in-progress bowl (Stage 5.5).
 * Untrusted on read: always sanitized against the current ingredient index.
 */
const KEY = 'proji-build-draft'

export function saveDraft(selection: Selection, step: Category) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ selection, step }))
  } catch {
    /* storage unavailable */
  }
}

export function readDraft(index: IngredientIndex): { selection: Selection; step: Category } | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as {
      selection?: Partial<Selection>
      step?: string
    } | null
    if (!raw?.selection) return null
    const selection = sanitizeSelection(raw.selection, index)
    const step = (CATEGORIES as readonly string[]).includes(raw.step ?? '')
      ? (raw.step as Category)
      : 'base'
    return { selection, step }
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
