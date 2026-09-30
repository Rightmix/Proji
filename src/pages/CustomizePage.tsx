import { useContext, useEffect, useMemo, useState } from 'react'
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
import { useReducedMotion } from '../features/builder/useReducedMotion'

export default function CustomizePage({
  index = defaultIngredientIndex,
}: {
  index?: IngredientIndex
}) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const catalog = useContext(CatalogContext)
  const initial = useMemo(() => fromSearchParams(params, index), []) // eslint-disable-line react-hooks/exhaustive-deps -- initial URL only
  const { state, dispatch, layers, nutrition, price, items, configuration } = useBowlBuilder(
    index,
    initial,
  )
  const reducedMotion = useReducedMotion()
  const [dialog, setDialog] = useState<'nutrition' | 'cart' | null>(null)
  const [cartResult, setCartResult] = useState<PrototypeCartResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [presetNote, setPresetNote] = useState<string | null>(null)
  const { selection, step, notice } = state

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
    setCartResult(prototypeAddToCart(configuration))
    setDialog('cart')
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <SkipLink />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <div className="mx-auto max-w-md lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-10 lg:px-8">
          <section
            aria-label="Bowl preview"
            data-testid="sticky-preview"
            className="sticky top-0 z-20 bg-canvas px-4 pb-3 pt-safe lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:pb-8"
          >
            <BuilderTopBar priceMinor={price.amountMinor} onBack={onBack} onShare={onShare} />
            <div className="flex justify-center rounded-xl bg-surface py-2.5 shadow-card lg:py-8">
              <BowlRenderer
                layers={layers}
                reducedMotion={reducedMotion}
                className="builder-bowl"
              />
            </div>
            <div className="mt-3">
              <NutritionSummary totals={nutrition} highlight={selection.base !== null} />
            </div>
            <PrototypeNotice className="mt-1.5 text-center" />
          </section>

          <div className="flex min-h-[60dvh] flex-col px-4 lg:min-h-dvh lg:pt-8">
            {presetNote && (
              <p
                role="status"
                className="mb-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
              >
                {presetNote}
              </p>
            )}
            <CategoryNavigation
              step={step}
              selection={selection}
              index={index}
              onSelect={(c) => dispatch({ type: 'goTo', step: c })}
            />
            <div className="mt-5 flex-1 pb-4">
              <IngredientSelector
                key={step}
                category={step}
                selection={selection}
                index={index}
                notice={notice}
                onToggle={(id) => dispatch({ type: 'select', id })}
              />
            </div>
            <StickyFooter className="-mx-4 lg:mx-0">
              <CustomizationFooter
                isLast={step === 'topping'}
                canNext={canAdvance(selection, step)}
                canAddToCart={isComplete(selection)}
                priceMinor={price.amountMinor}
                onNext={() => dispatch({ type: 'next' })}
                onAddToCart={onAddToCart}
                onViewNutrition={() => setDialog('nutrition')}
              />
            </StickyFooter>
          </div>
        </div>
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
