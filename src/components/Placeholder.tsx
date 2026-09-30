import type { ReactNode } from 'react'
import { Container } from './ui/layout'

export function Placeholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Container className="py-12">
      <h1 className="font-display text-title font-semibold sm:text-3xl">{title}</h1>
      <div className="mt-3 max-w-prose text-ink-muted">
        {children ?? 'Coming in a later stage.'}
      </div>
    </Container>
  )
}
