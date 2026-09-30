import type { ReactNode } from 'react'

export function DevDataNotice() {
  return (
    <p
      role="note"
      className="rounded-md border border-dashed border-ink-muted bg-surface p-3 text-sm text-ink-muted"
    >
      <strong className="text-ink">Development sample data.</strong> These bowls are concepts for
      testing the menu. Recipes, prices, nutrition and allergen information are not yet validated
      and are not shown.
    </p>
  )
}

export function StatusMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <div className="mt-2 text-ink-muted">{children}</div>}
    </div>
  )
}
