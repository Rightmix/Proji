import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink, Card, Container, Icon, Label } from '../components/ui'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { COMPONENT_ROLES, type ComponentRole, type SignatureBowl } from '../features/catalog'
import {
  AvailabilityBadge,
  BowlImage,
  FixtureBadge,
} from '../features/catalog/components/CatalogBits'
import { DevDataNotice, StatusMessage } from '../features/catalog/components/Notices'

const ROLE_LABEL: Record<ComponentRole, string> = {
  base: 'Base',
  protein: 'Protein',
  flavour: 'Flavour',
  vegetable: 'Vegetables',
  topping: 'Toppings',
  accompaniment: 'On the side',
}

function Pending({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <dt className="font-medium">{label}</dt>
      <dd className="text-sm text-ink-muted">Pending validation</dd>
    </div>
  )
}

function Facts({ bowl }: { bowl: SignatureBowl }) {
  // Validated values are rendered by Stage 7; Stage 3 never displays unvalidated figures.
  const rows: [string, SignatureBowl['nutrition' | 'price' | 'allergens']][] = [
    ['Price', bowl.price],
    ['Nutrition', bowl.nutrition],
    ['Allergens', bowl.allergens],
  ]
  return (
    <Card tone="canvas" className="px-4">
      <dl>
        {rows.map(([label, v]) =>
          v.status === 'unavailable' ? (
            <Pending key={label} label={label} />
          ) : (
            <div
              key={label}
              className="flex justify-between gap-3 border-b border-line py-3 last:border-0"
            >
              <dt className="font-medium">{label}</dt>
              <dd className="text-sm">Validated — shown from Stage 7</dd>
            </div>
          ),
        )}
      </dl>
    </Card>
  )
}

export default function BowlDetail() {
  const { slug = '' } = useParams()
  const { state, retry } = useCatalogQuery((r) => r.getBowl(slug), `bowl:${slug}`)
  const back = (
    <Link
      to="/menu"
      className="inline-flex min-h-touch items-center gap-1 text-sm font-medium text-action-600 hover:underline"
    >
      <Icon name="arrow-left" className="size-4" /> Back to menu
    </Link>
  )

  if (state.status === 'loading')
    return (
      <Container className="py-10">
        {back}
        <p role="status" className="mt-6 text-ink-muted">
          Loading bowl…
        </p>
      </Container>
    )
  if (state.status === 'error')
    return (
      <Container className="py-10">
        {back}
        <div role="alert" className="mt-6 rounded-lg border border-danger/40 bg-surface p-6">
          <p className="font-semibold">We couldn’t load this bowl.</p>
          <Button variant="secondary" className="mt-4" onClick={retry}>
            Retry
          </Button>
        </div>
      </Container>
    )
  const bowl = state.data
  if (!bowl)
    return (
      <Container className="py-10">
        {back}
        <h1 className="mt-4 font-display text-title font-semibold">Bowl not found</h1>
        <p className="mt-2 text-ink-muted">This bowl isn’t on the menu.</p>
      </Container>
    )

  const available = bowl.availability.state === 'available'
  const groups = COMPONENT_ROLES.map((role) => ({
    role,
    items: bowl.components.filter((c) => c.role === role),
  })).filter((g) => g.items.length)

  return (
    <Container className="py-6 sm:py-10">
      {back}
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <BowlImage bowl={bowl} priority className="rounded-xl" />
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            <AvailabilityBadge state={bowl.availability.state} />
            <FixtureBadge bowl={bowl} />
          </div>
          <h1 className="font-display text-title font-semibold sm:text-4xl">{bowl.name}</h1>
          <p className="text-ink-muted">{bowl.description}</p>
          {bowl.dataStatus === 'development-fixture' && <DevDataNotice />}
          <section aria-labelledby="components-title">
            <h2 id="components-title" className="text-lg font-semibold">
              What’s in it
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {groups.map((g) => (
                <div key={g.role}>
                  <dt>
                    <Label>{ROLE_LABEL[g.role]}</Label>
                  </dt>
                  {g.items.map((c) => (
                    <dd key={c.ingredientId}>{c.name}</dd>
                  ))}
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="facts-title">
            <h2 id="facts-title" className="mb-3 text-lg font-semibold">
              Price, nutrition &amp; allergens
            </h2>
            <Facts bowl={bowl} />
          </section>
          {available ? (
            <ButtonLink
              to={`/build?bowl=${encodeURIComponent(bowl.slug)}`}
              size="lg"
              className="self-start"
            >
              Customise this bowl <Icon name="arrow-right" className="size-5" />
            </ButtonLink>
          ) : (
            <StatusMessage
              title={`This bowl is ${bowl.availability.state === 'coming-soon' ? 'coming soon' : 'not available right now'}`}
            />
          )}
        </div>
      </div>
    </Container>
  )
}
