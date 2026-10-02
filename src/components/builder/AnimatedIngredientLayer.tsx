import { useEffect, useState, type CSSProperties } from 'react'
import type { BowlLayer } from '../../features/builder/layerOrdering'

export type LayerPhase = 'loading' | 'entering' | 'settled' | 'error'

/**
 * One ingredient layer. Mounted per unique key, so a replaced ingredient unmounts
 * immediately (no stale/duplicate layers) and its pending load can never resurface.
 * The enter animation starts only once the image has decoded.
 */
export function AnimatedIngredientLayer({
  layer,
  reducedMotion,
}: {
  layer: BowlLayer
  reducedMotion: boolean
}) {
  const [phase, setPhase] = useState<LayerPhase>('loading')
  // Safety net: settle even if `animationend` never fires (tab hidden, CSS unsupported).
  useEffect(() => {
    if (phase !== 'entering') return
    const t = window.setTimeout(() => setPhase('settled'), layer.animation.durationMs + 150)
    return () => window.clearTimeout(t)
  }, [phase, layer.animation.durationMs])
  const style = {
    zIndex: layer.zIndex,
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
    '--layer-duration': `${layer.animation.durationMs}ms`,
    '--layer-easing': layer.animation.easing,
    '--layer-placeholder': layer.placeholderColor,
  } as CSSProperties
  return (
    <div
      className="bowl-layer"
      style={style}
      data-testid="bowl-layer"
      data-category={layer.category}
      data-slot={layer.slot}
      data-ingredient={layer.ingredientId}
      data-phase={phase}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget || e.currentTarget.contains(e.target as Node))
          setPhase('settled')
      }}
    >
      {phase === 'error' ? (
        <LayerFallback layer={layer} />
      ) : (
        <img
          src={layer.src}
          alt=""
          draggable={false}
          decoding="async"
          ref={(img) => {
            // Cached images can finish before React attaches onLoad; catch that case.
            if (img?.complete && img.naturalWidth > 0)
              queueMicrotask(() =>
                setPhase((p) => (p === 'loading' ? (reducedMotion ? 'settled' : 'entering') : p)),
              )
          }}
          onLoad={() =>
            setPhase((p) => (p === 'loading' ? (reducedMotion ? 'settled' : 'entering') : p))
          }
          onError={() => setPhase('error')}
        />
      )}
    </div>
  )
}

/** Simple colour shape per category if an asset fails to load. */
function LayerFallback({ layer }: { layer: BowlLayer }) {
  const c = layer.placeholderColor
  const shapes: Record<BowlLayer['category'], CSSProperties> = {
    base: {
      borderRadius: '50%',
      background: `radial-gradient(circle, ${c} 0 60%, color-mix(in srgb, ${c} 70%, black) 100%)`,
    },
    protein: { inset: '32%', borderRadius: '30%', background: c, position: 'absolute' },
    flavour: {
      borderRadius: '50%',
      border: `6px solid ${c}`,
      inset: '16%',
      position: 'absolute',
      clipPath: 'inset(0 0 55% 0)',
    },
    topping: { position: 'absolute', inset: '8% 38% 78% 38%', borderRadius: '40%', background: c },
  }
  return (
    <span className="layer-fallback" data-testid="layer-fallback" style={shapes[layer.category]} />
  )
}
