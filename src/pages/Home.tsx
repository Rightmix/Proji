import { Link } from 'react-router-dom'
import { ButtonLink, Container, Icon, ResponsiveImage } from '../components/ui'
import { Logo } from '../components/Logo'
import { DeliverySelector } from '../components/shell/DeliverySelector'
import { SearchField } from '../components/shell/SearchField'
import { CategoryCircles } from '../components/meals/CategoryCircles'
import { MealGrid, MealsDisclosure } from '../components/meals/MealGrid'
import { useCatalogQuery } from '../features/catalog/useCatalogQuery'
import { estimateBowl } from '../features/meals/mealEstimate'
import { findCategory } from '../features/meals/categories'
import { defaultIngredientIndex as IDX } from '../features/builder/ingredientRepository'
import type { SignatureBowl } from '../features/catalog/types'
import { assets } from '../lib/assets'

function SectionHead({ title, to, id }: { title: string; to: string; id: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      <Link
        to={to}
        className="inline-flex min-h-touch items-center text-sm font-semibold text-action-600"
        aria-label={`View all ${title}`}
      >
        View all
      </Link>
    </div>
  )
}

const RAILS = ['high-protein', 'vegetarian', 'millet'] as const

export default function Home() {
  const { state } = useCatalogQuery((r) => r.listBowls(), 'list')
  const bowls: SignatureBowl[] = state.status === 'ready' ? state.data : []
  const withEstimate = bowls.map((b) => ({ b, e: estimateBowl(b, IDX) }))
  const popular = withEstimate
    .filter(({ b, e }) => b.availability.state === 'available' && e.status === 'illustrative')
    .slice(0, 4)
    .map(({ b }) => b)

  return (
    <Container className="flex flex-col gap-6 pb-6 pt-3 md:pt-8">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <Link to="/" aria-label="PROJI home" className="rounded-sm">
          <Logo />
          <span className="block text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-ink-muted">
            Protein Kanji
          </span>
        </Link>
        <DeliverySelector />
      </div>
      <SearchField />

      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden rounded-xl bg-bowl-900 text-ink-inverse shadow-raised"
      >
        <ResponsiveImage
          asset={assets.homeHeroBowl}
          priority
          className="absolute inset-y-0 right-0 h-full w-[62%] object-cover sm:w-1/2"
          sizes="(min-width: 768px) 50vw, 62vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-bowl-900 via-bowl-900/85 to-transparent"
          aria-hidden="true"
        />
        <div className="relative flex min-h-56 max-w-[62%] flex-col justify-center gap-2 p-5 sm:max-w-md sm:p-8">
          <h1
            id="hero-title"
            className="font-display text-3xl font-semibold leading-tight sm:text-5xl"
          >
            Your Bowl. Your Rules.
          </h1>
          <p className="text-sm text-ink-inverse/85">
            Real ingredients. Nutrition you can see. Delivered to you.
          </p>
          <ButtonLink to="/build" className="mt-2 self-start whitespace-nowrap">
            Build Your Own <Icon name="arrow-right" className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="cat-title">
        <SectionHead title="Categories" id="cat-title" to="/categories/all" />
        <CategoryCircles />
      </section>

      {state.status === 'loading' && (
        <p role="status" className="text-ink-muted">
          Loading meals…
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-ink-muted">
          We couldn’t load meals right now.
        </p>
      )}
      {state.status === 'ready' && bowls.length === 0 && (
        <section className="rounded-lg border border-line bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold">Our menu is coming soon</h2>
          <p className="mt-1 text-ink-muted">Meanwhile, build your own bowl.</p>
        </section>
      )}

      {popular.length > 0 && (
        <section aria-labelledby="popular-title" className="flex flex-col gap-3">
          <SectionHead title="Popular right now" id="popular-title" to="/categories/all" />
          <MealGrid bowls={popular} label="Popular right now" />
          <MealsDisclosure />
        </section>
      )}

      {RAILS.map((id) => {
        const cat = findCategory(id)!
        const list = withEstimate
          .filter(({ b, e }) => cat.matches(b, e))
          .map(({ b }) => b)
          .slice(0, 4)
        if (!list.length) return null
        return (
          <section key={id} aria-labelledby={`rail-${id}`}>
            <SectionHead title={cat.label} id={`rail-${id}`} to={`/categories/${id}`} />
            <MealGrid bowls={list} label={cat.label} />
          </section>
        )
      })}
    </Container>
  )
}
