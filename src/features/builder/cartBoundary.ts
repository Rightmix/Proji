import type { BowlConfiguration } from './types'

export interface PrototypeCartResult {
  status: 'prototype-not-submitted'
  configuration: BowlConfiguration
}

/**
 * Stage 6 boundary. In Stage 4 this is deliberately a local no-op: it makes no network
 * request, creates no order and takes no payment. Stage 6 replaces it with a server
 * call that revalidates availability and reprices from validated data.
 */
export function prototypeAddToCart(configuration: BowlConfiguration): PrototypeCartResult {
  return { status: 'prototype-not-submitted', configuration: structuredClone(configuration) }
}
