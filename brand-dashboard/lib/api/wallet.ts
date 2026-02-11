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
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Get brand wallet balance and stats
 */
export async function getBrandWallet(): Promise<BrandWallet> {
  const response = await apiClient.get('/wallet')
  return response.data
}

/**
 * Create deposit order to add funds to wallet
 */
export async function createDepositOrder(
  request: DepositRequest
): Promise<PaymentOrder> {
  const response = await apiClient.post('/wallet/deposit', request)
  return response.data
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(params: {
  page?: number
  size?: number
}): Promise<PageResponse<EscrowTransaction>> {
  const response = await apiClient.get('/wallet/transactions', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  })
  return response.data
}

/**
 * Allocate funds from wallet to campaign
 */
export async function allocateToCampaign(
  campaignId: string,
  request: AllocationRequest
): Promise<void> {
  await apiClient.post(`/wallet/campaigns/${campaignId}/allocate`, request)
}

/**
 * Get campaign escrow transactions
 */
export async function getCampaignTransactions(
  campaignId: string,
  params: { page?: number; size?: number }
): Promise<PageResponse<EscrowTransaction>> {
  const response = await apiClient.get(
    `/wallet/campaigns/${campaignId}/transactions`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return response.data
}
