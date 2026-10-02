import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../auth/context'
import { SaveBowlForm } from '../components/builder/SaveBowlDialog'
import { useAccountRepository } from '../features/account/accountContext'
import { UUID_RE } from '../features/account/validation'
import { decodeConfiguration, describeMissing } from '../features/builder/savedBowlCodec'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/bowl-builder.css'
import { SkipLink } from '../components/Layouts'
import { StickyFooter } from '../components/ui'
import { BowlRenderer } from '../components/builder/BowlRenderer'
import { BuilderTopBar } from '../components/builder/BuilderTopBar'
import { CategoryNavigation } from '../components/builder/CategoryNavigation'
import { CustomizationFooter } from '../components/builder/CustomizationFooter'
import { Dialog } from '../components/builder/Dialog'
import { IngredientSelector } from '../components/builder/IngredientSelector'
import { NutritionDetails } from '../components/builder/NutritionDetails'
import { NutritionSummary } from '../components/builder/NutritionSummary'
import { PrototypeCartSummary } from '../components/builder/PrototypeCartDialog'
import { PrototypeNotice } from '../components/builder/PrototypeNotice'
import { CatalogContext } from '../features/catalog/catalogContext'
import {
  assetsToPreload,
  canAdvance,
  defaultIngredientIndex,
  fromCatalogComponents,
  fromSearchParams,
  isComplete,
  preloadImages,
  toSearchParams,
  type IngredientIndex,
} from '../features/builder'
import { prototypeAddToCart, type PrototypeCartResult } from '../features/builder/cartBoundary'
import { useBowlBuilder } from '../features/builder/useBowlBuilder'
import { readDraft, saveDraft } from '../features/builder/draft'
import { addToCart } from '../features/cart/cartStore'
import { useReducedMotion } from '../features/builder/useReducedMotion'

export default function CustomizePage({
  index = defaultIngredientIndex,
}: {
  index?: IngredientIndex
}) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const catalog = useContext(CatalogContext)
  // Initial bowl: explicit share params win; otherwise (no catalog/saved preset) the
  // session draft, so returning via Back never loses work (Stage 5.5).
  const [boot] = useState(() => {
    const fromUrl = fromSearchParams(params, index)
    if (fromUrl) return { initial: fromUrl, step: undefined, fromDraft: false }
    if (params.get('bowl') || params.get('saved'))
      return { initial: null, step: undefined, fromDraft: false }
    const d = readDraft(index)
    return { initial: d?.selection ?? null, step: d?.step, fromDraft: Boolean(d) }
  })
  const initial = boot.fromDraft ? null : boot.initial
  const { state, dispatch, layers, nutrition, price, items, configuration } = useBowlBuilder(
    index,
    boot.initial,
    boot.step,
  )
  const reducedMotion = useReducedMotion()
  const [dialog, setDialog] = useState<'nutrition' | 'cart' | 'save' | null>(null)
  const auth = useContext(AuthContext)
  const accounts = useAccountRepository()
  const [cartResult, setCartResult] = useState<PrototypeCartResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [presetNote, setPresetNote] = useState<string | null>(null)
  const { selection, step, notice } = state
  useEffect(() => saveDraft(selection, step), [selection, step])

  // Stage 3 → Stage 4: /build?bowl=<catalog slug> preloads compatible components.
  const bowlSlug = params.get('bowl')
  useEffect(() => {
    if (!bowlSlug || initial) return
    let active = true
    catalog.getBowl(bowlSlug).then(
      (bowl) => {
        if (!active || !bowl) return
        const { selection: sel, unsupported } = fromCatalogComponents(bowl.components, index)
        dispatch({ type: 'load', selection: sel })
        setPresetNote(
          `Started from ${bowl.name}.` +
            (unsupported.length
              ? ` Not yet available in the builder: ${unsupported.join(', ')}.`
              : ''),
        )
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [bowlSlug, catalog, index, initial, dispatch])

  // Stage 5: /build?saved=<id> restores a saved bowl through the canonical codec.
  const savedId = params.get('saved')
  const authStatus = auth?.status ?? 'signed-out'
  const savedLinkNote =
    !savedId || initial
      ? null
      : !UUID_RE.test(savedId)
        ? 'This saved bowl link is not valid.'
        : authStatus !== 'loading' && (authStatus !== 'signed-in' || !accounts)
          ? 'Sign in to open your saved bowl.'
          : null
  useEffect(() => {
    if (!savedId || initial || !UUID_RE.test(savedId) || authStatus !== 'signed-in' || !accounts)
      return
    let active = true
    accounts.getSavedBowl(savedId).then(
      (rec) => {
        if (!active) return
        if (!rec) return setPresetNote('We couldn’t find that saved bowl.')
        const r = decodeConfiguration(rec.configuration, index)
        if (r.status === 'invalid')
          return setPresetNote(`“${rec.name}” can’t be opened because its saved data is not valid.`)
        dispatch({
          type: 'load',
          selection: r.selection,
          step: r.status === 'ok' ? 'topping' : 'base',
        })
        setPresetNote(
          r.status === 'ok'
            ? `Opened “${rec.name}”.`
            : `Opened “${rec.name}”. No longer available: ${r.missing.map((m) => describeMissing(m, index)).join(', ')}. Please choose replacements.`,
        )
      },
      () => active && setPresetNote('We couldn’t open that saved bowl. Please try again.'),
    )
    return () => {
      active = false
    }
  }, [savedId, initial, authStatus, accounts, index, dispatch])

  useEffect(() => {
    preloadImages(assetsToPreload(step, index))
  }, [step, index])

  const onBack = () => {
    if (step !== 'base') return dispatch({ type: 'back' })
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }

  const onShare = async () => {
    const url = `${window.location.origin}/build?${toSearchParams(selection).toString()}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My PROJI bowl', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast('Link copied')
    } catch {
      setToast(`Share link: ${url}`)
    }
  }

  const onAddToCart = () => {
    if (!configuration) return
    const result = prototypeAddToCart(configuration)
    addToCart({ name: 'Custom bowl', mealSlug: null, configuration: result.configuration })
    setCartResult(result)
    setDialog('cart')
  }

  return (
    <div className="builder-page min-h-dvh bg-canvas">
      <SkipLink />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <div className="mx-auto max-w-md px-3 pt-safe lg:max-w-6xl lg:px-8">
          <BuilderTopBar onBack={onBack} onShare={onShare} />
          <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,26rem)] lg:gap-8">
            <div className="sticky top-2 self-start pt-1 lg:top-8">
              <CategoryNavigation
                step={step}
                selection={selection}
                index={index}
                onSelect={(c) => dispatch({ type: 'goTo', step: c })}
              />
            </div>
            <section
              aria-label="Bowl preview"
              data-testid="sticky-preview"
              className="sticky top-0 z-20 -mx-1 bg-canvas px-1 pb-2 lg:top-8 lg:col-start-2 lg:row-start-1 lg:self-start"
            >
              <div className="flex justify-center py-1 lg:py-6">
                <BowlRenderer
                  layers={layers}
                  reducedMotion={reducedMotion}
                  className="builder-bowl"
                />
              </div>
              <NutritionSummary totals={nutrition} highlight={selection.base !== null} />
              <PrototypeNotice className="mt-1 text-center" />
            </section>
            <div className="col-start-2 flex min-h-[50dvh] flex-col lg:col-start-3 lg:row-start-1 lg:pt-6">
              {(presetNote ?? savedLinkNote) && (
                <p
                  role="status"
                  className="mb-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
                >
                  {presetNote ?? savedLinkNote}
                </p>
              )}
              <div className="flex-1 pb-4">
                <IngredientSelector
                  key={step}
                  category={step}
                  selection={selection}
                  index={index}
                  notice={notice}
                  onToggle={(id) => dispatch({ type: 'select', id })}
                />
              </div>
            </div>
          </div>
        </div>
        <StickyFooter className="lg:mx-auto lg:max-w-6xl">
          <CustomizationFooter
            step={step}
            canNext={canAdvance(selection, step)}
            canAddToCart={isComplete(selection)}
            priceMinor={price.amountMinor}
            nutrition={nutrition}
            onNext={() => dispatch({ type: 'next' })}
            onAddToCart={onAddToCart}
            onViewNutrition={() => setDialog('nutrition')}
            onSave={configuration ? () => setDialog('save') : undefined}
          />
        </StickyFooter>
      </main>

      {toast && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-sm rounded-md bg-bowl-900 px-4 py-2 text-center text-sm text-ink-inverse"
        >
          {toast}
        </p>
      )}

      <Dialog
        id="nutrition"
        open={dialog === 'nutrition'}
        onClose={() => setDialog(null)}
        title="Nutrition"
      >
        <NutritionDetails items={items} totals={nutrition} price={price} />
      </Dialog>
      <Dialog id="save" open={dialog === 'save'} onClose={() => setDialog(null)} title="Save bowl">
        {configuration && (
          <SaveBowlForm
            configuration={configuration}
            signedIn={authStatus === 'signed-in'}
            shareSearch={toSearchParams(selection).toString()}
            onClose={() => setDialog(null)}
          />
        )}
      </Dialog>
      <Dialog id="cart" open={dialog === 'cart'} onClose={() => setDialog(null)} title="Your bowl">
        {cartResult && (
          <PrototypeCartSummary
            configuration={cartResult.configuration}
            layers={layers}
            priceMinor={price.amountMinor}
            index={index}
            onClose={() => setDialog(null)}
          />
        )}
      </Dialog>
    </div>
  )
}
