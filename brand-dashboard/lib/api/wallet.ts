import { apiClient } from './client'

export interface BrandWallet {
  brandId: string
  balance: number
  totalDeposited: number
  totalAllocated: number
  totalReleased: number
  currency: string
}

export interface EscrowTransaction {
  id: string
  brandId: string
  campaignId?: string
  paymentOrderId?: string
  type: 'DEPOSIT' | 'ALLOCATION' | 'RELEASE' | 'REFUND'
  amount: number
  balanceBefore?: number
  balanceAfter?: number
  description: string
  metadata?: Record<string, any>
  createdAt: string
  campaignTitle?: string
  paymentMethod?: string
}

export interface PaymentOrder {
  id: string
  razorpayOrderId: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export interface DepositRequest {
  amount: number
}

export interface AllocationRequest {
  amount: number
}

export interface PageResponse<T> {
  items: T[]
  total: number
  totalPages: number
  page: number
  size: number
  hasMore: boolean
}

/**
 * Get brand wallet balance and stats
 */
export async function getBrandWallet(): Promise<BrandWallet> {
  return await apiClient.get<BrandWallet>('/brand-wallet')
}

/**
 * Create deposit order to add funds to wallet
 */
export async function createDepositOrder(
  request: DepositRequest
): Promise<PaymentOrder> {
  return await apiClient.post<PaymentOrder>('/brand-wallet/deposit', request)
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(params: {
  page?: number
  size?: number
}): Promise<PageResponse<EscrowTransaction>> {
  return await apiClient.get<PageResponse<EscrowTransaction>>('/brand-wallet/transactions', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  })
}

/**
 * Allocate funds from wallet to campaign
 */
export async function allocateToCampaign(
  campaignId: string,
  request: AllocationRequest
): Promise<void> {
  await apiClient.post(`/brand-wallet/campaigns/${campaignId}/allocate`, request)
}

/**
 * Get campaign escrow transactions
 */
export async function getCampaignTransactions(
  campaignId: string,
  params: { page?: number; size?: number }
): Promise<PageResponse<EscrowTransaction>> {
  return await apiClient.get<PageResponse<EscrowTransaction>>(
    `/brand-wallet/campaigns/${campaignId}/transactions`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
}
