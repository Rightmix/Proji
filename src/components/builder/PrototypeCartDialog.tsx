import type { BowlConfiguration } from '../../features/builder/types'
import type { IngredientIndex } from '../../features/builder/ingredientRepository'
import type { BowlLayer } from '../../features/builder/layerOrdering'
import { formatInr } from '../../features/builder/pricing'
import { Button, ButtonLink } from '../ui'
import { BowlRenderer } from './BowlRenderer'

/** Final prototype state shown after "Add to Cart". No order, cart or payment is created. */
export function PrototypeCartSummary({
  configuration,
  layers,
  priceMinor,
  index,
  onClose,
}: {
  configuration: BowlConfiguration
  layers: readonly BowlLayer[]
  priceMinor: number
  index: IngredientIndex
  onClose: () => void
}) {
  const name = (id: string) => index.byId.get(id)?.name ?? id
  const rows: [string, string[]][] = [
    ['Base', [configuration.baseId]],
    ['Protein', [configuration.proteinId]],
    ['Flavours', configuration.flavourIds],
    ['Toppings', configuration.toppingIds],
  ]
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="rounded-md border border-beige bg-beige/30 p3 px-3 py-2 text-sm">
        <strong>Prototype only.</strong> Added to the cart on this device — no order was created and
        no payment was taken.
      </p>
      <BowlRenderer layers={layers} reducedMotion className="mx-auto w-40" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map(([k, ids]) => (
          <div key={k} className="contents">
            <dt className="font-semibold">{k}</dt>
            <dd>{ids.length ? ids.map(name).join(', ') : 'None'}</dd>
          </div>
        ))}
        <dt className="font-semibold">Illustrative total</dt>
        <dd className="font-bold tabular-nums">{formatInr(priceMinor)}</dd>
      </dl>
      <ButtonLink to="/cart" block>
        View cart
      </ButtonLink>
      <Button variant="secondary" block onClick={onClose}>
        Keep customising
      </Button>
    </div>
  )
}
