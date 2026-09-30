import {
  Card,
  ButtonLink,
  Container,
  Icon,
  Label,
  ResponsiveImage,
  Section,
} from '../components/ui'
import { assets } from '../lib/assets'

const steps = [
  { label: 'Base', text: 'Start with a slow-cooked kanji or grain base.' },
  { label: 'Protein', text: 'Add the protein you prefer.' },
  { label: 'Flavour', text: 'Finish it with Kerala-inspired sauces.' },
  { label: 'Topping', text: 'Top it off for crunch and freshness.' },
]

const values = [
  {
    title: 'Kerala comfort, rethought',
    text: 'Familiar kanji and grain bowls, prepared fresh with regional flavours.',
  },
  {
    title: 'Protein-forward choices',
    text: 'Build around the protein you want, one step at a time.',
  },
  {
    title: 'See what goes in',
    text: 'Every bowl lists its ingredients so you know exactly what you are ordering.',
  },
]

export default function Home() {
  return (
    <>
      <section className="overflow-hidden">
        <Container className="grid items-center gap-8 py-10 sm:py-14 md:grid-cols-2 md:gap-12">
          <div>
            <Label className="text-select-700">Kanji &amp; grain bowls · Calicut</Label>
            <h1 className="mt-3 font-display text-display font-semibold tracking-tight sm:text-6xl">
              Build Your Bowl.{' '}
              <span className="block italic text-action-600">Build Your Body.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              Customisable Kerala-style congee and grain bowls. Choose your base, protein, flavour
              and toppings.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/build" size="lg">
                Build your bowl <Icon name="arrow-right" className="size-5" />
              </ButtonLink>
              <ButtonLink to="/menu" size="lg" variant="secondary">
                View menu
              </ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <ResponsiveImage
              asset={assets.homeHeroBowl}
              priority
              className="aspect-[960/886] w-full rounded-xl object-cover shadow-raised"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </Container>
      </section>

      <Section
        id="how"
        eyebrow="How it works"
        title="Four steps to your bowl"
        className="bg-surface"
      >
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.label}>
              <Card tone="canvas" className="flex h-full gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-pill bg-select-100 font-bold text-select-700"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.label}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="why" eyebrow="Why PROJI" title="Comfort food, your way">
        <ul className="grid gap-3 md:grid-cols-3">
          {values.map((v) => (
            <li key={v.title}>
              <Card className="h-full p-6">
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{v.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <section aria-labelledby="cta-title" className="pb-16">
        <Container>
          <Card
            tone="inverse"
            className="flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 id="cta-title" className="font-display text-title font-semibold">
                Starting with a pilot in Calicut
              </h2>
              <p className="mt-1 text-ink-inverse/80">Ordering opens in a later release.</p>
            </div>
            <ButtonLink to="/build" variant="inverse" size="lg">
              Preview the builder
            </ButtonLink>
          </Card>
        </Container>
      </section>
    </>
  )
}
