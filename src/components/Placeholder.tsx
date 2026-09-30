import type { ReactNode } from 'react'

export function Placeholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-3 text-proji-gray">{children ?? 'Coming in a later stage.'}</div>
    </section>
  )
}
