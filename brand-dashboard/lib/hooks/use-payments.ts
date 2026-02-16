import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/lib/api/payments'
import type { Transaction, Wallet } from '@/lib/types'

type TransactionsResponse =
  | { items?: Transaction[]; total?: number }
  | Transaction[]

const normalizeTransactions = (data: TransactionsResponse | undefined): Transaction[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.items ?? []
}

export function useWallet() {
  return useQuery<Wallet | null>({
    queryKey: ['wallet'],
    queryFn: () => paymentService.getWallet().catch(() => null),
  })
}

export function useTransactions(params: {
  page: number
  size: number
  status?: string
  from?: string
  to?: string
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => paymentService.getTransactions(params),
    select: normalizeTransactions,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentService.getPaymentMethods(),
  })
}

export type WalletSummary = Wallet | null
