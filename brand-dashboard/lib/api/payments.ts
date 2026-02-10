import { apiClient } from './client'
import type { Transaction, Wallet } from '@/lib/types'

/**
 * Payload for adding a payment method
 * Note: For PCI compliance, raw card details should be tokenized via Razorpay checkout first.
 * This type represents what the backend expects after tokenization.
 */
export type PaymentMethodPayload = {
  razorpayCustomerId?: string
  razorpayTokenId?: string
  cardLast4: string
  cardNetwork?: string
  cardType?: string
  expiryMonth?: string
  expiryYear?: string
  cardholderName?: string
}

export type PaymentMethod = {
  id: string
  cardLast4: string
  cardNetwork?: string
  cardType?: string
  expiryMonth?: string
  expiryYear?: string
  cardholderName?: string
  isDefault?: boolean
  createdAt?: string
}

type TransactionsResponse =
  | { items?: Transaction[]; total?: number }
  | Transaction[]

/**
 * Payment service for brand wallet operations
 */
export const paymentService = {
  async getWallet(): Promise<Wallet> {
    return apiClient.get<Wallet>('/wallet')
  },

  /**
   * Get saved payment methods (cards)
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/wallet/payment-methods')
  },

  /**
   * Add a payment method
   * Note: In production, cardLast4 and token should come from Razorpay checkout tokenization
   */
  async addPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>('/wallet/payment-methods', payload)
  },

  /**
   * Remove a payment method
   */
  async removePaymentMethod(id: string | number): Promise<void> {
    await apiClient.delete(`/wallet/payment-methods/${id}`)
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string | number): Promise<void> {
    await apiClient.put(`/wallet/payment-methods/${id}/default`)
  },

  async getTransactions(params: {
    page: number
    size: number
    status?: string
    from?: string
    to?: string
  }) {
    return apiClient.get<TransactionsResponse>('/wallet/transactions', {
      params: {
        page: params.page,
        size: params.size,
      },
    })
  },
}

