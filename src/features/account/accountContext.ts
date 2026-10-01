import { createContext, useContext } from 'react'
import type { AccountRepository, OrderHistoryRepository } from './types'

/** null = accounts unavailable in this environment (e.g. Supabase not configured). */
export const AccountContext = createContext<AccountRepository | null>(null)
export const useAccountRepository = () => useContext(AccountContext)

/** Stage 6 supplies real orders; until then the history is explicitly unavailable. */
export const NO_ORDERS_YET: OrderHistoryRepository = {
  available: false,
  listOrders: async () => [],
}
export const OrderHistoryContext = createContext<OrderHistoryRepository>(NO_ORDERS_YET)
export const useOrderHistory = () => useContext(OrderHistoryContext)
