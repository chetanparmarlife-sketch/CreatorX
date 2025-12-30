import { apiClient } from './client'

export type PaymentMethodPayload = {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

/**
 * Payment service
 * Note: Payments module not yet implemented in backend.
 * These endpoints map to wallet endpoints for now.
 * In Phase 4, dedicated payment endpoints will be added.
 */
export const paymentService = {
  async getWallet() {
    return apiClient.get('/wallet')
  },
  // Note: Payment methods not yet implemented - use wallet/bank-accounts for now
  async getPaymentMethods() {
    // Map to wallet bank accounts (for creators)
    return apiClient.get('/wallet/bank-accounts')
  },
  async addPaymentMethod(payload: PaymentMethodPayload) {
    // Payment methods not yet implemented
    throw new Error('Payment methods not yet implemented. Use wallet/bank-accounts for withdrawals.')
  },
  async removePaymentMethod(id: string | number) {
    // Payment methods not yet implemented
    throw new Error('Payment methods not yet implemented.')
  },
  async getTransactions(params: {
    page: number
    size: number
    status?: string
    from?: string
    to?: string
  }) {
    // Map to wallet transactions
    return apiClient.get('/wallet/transactions', {
      params: {
        page: params.page,
        size: params.size,
        // status, from, to filters not yet supported in wallet endpoint
      },
    })
  },
}
