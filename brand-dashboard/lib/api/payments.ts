import { apiClient } from './client'

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

/**
 * Payment service for brand wallet operations
 */
export const paymentService = {
  async getWallet() {
    return apiClient.get('/wallet')
  },

  /**
   * Get saved payment methods (cards)
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/wallet/payment-methods')
    return response.data
  },

  /**
   * Add a payment method
   * Note: In production, cardLast4 and token should come from Razorpay checkout tokenization
   */
  async addPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentMethod> {
    const response = await apiClient.post('/wallet/payment-methods', payload)
    return response.data
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
    return apiClient.get('/wallet/transactions', {
      params: {
        page: params.page,
        size: params.size,
      },
    })
  },
}

