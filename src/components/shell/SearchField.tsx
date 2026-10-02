import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../ui'

/** Meal/ingredient search; submits to the "All meals" category page. */
export function SearchField({
  initial = '',
  autoFocus,
}: {
  initial?: string
  autoFocus?: boolean
}) {
  const navigate = useNavigate()
  const [q, setQ] = useState(initial)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/categories/all${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }
  return (
    <form role="search" onSubmit={submit} className="relative">
      <label htmlFor="meal-search" className="sr-only">
        Search meals, ingredients
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
      />
      <input
        id="meal-search"
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search meals, ingredients…"
        className="block min-h-touch w-full rounded-pill border border-line bg-surface pl-10 pr-4 text-base shadow-card focus:border-action-600"
      />
    </form>
  )
}
