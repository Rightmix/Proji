import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Container } from '../ui'
import { BackHeader } from '../shell/BackHeader'

/** Account area container. Subpages use PageTitle (back arrow → account hub). */
export function AccountLayout() {
  return (
    <Container className="max-w-2xl pb-8 pt-1 md:pt-6">
      <Outlet />
    </Container>
  )
}

export function PageTitle({ children, right }: { children: string; right?: ReactNode }) {
  return <BackHeader title={children} fallback="/account" right={right} className="mb-2" />
}
