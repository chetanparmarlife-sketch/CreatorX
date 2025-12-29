/**
 * Wallet service
 */

import { apiClient } from '../client';
import {
  Wallet,
  Transaction,
  WithdrawalRequest,
  BankAccount,
  CreateWithdrawalRequest,
  AddBankAccountRequest,
  PaginatedResponse,
} from '../types';

export const walletService = {
  /**
   * Get wallet balance
   */
  async getWallet(): Promise<Wallet> {
    return await apiClient.get<Wallet>('/wallet');
  },

  /**
   * Get transaction history
   */
  async getTransactions(page = 0, size = 20): Promise<PaginatedResponse<Transaction>> {
    return await apiClient.get<PaginatedResponse<Transaction>>(
      `/wallet/transactions?page=${page}&size=${size}`
    );
  },

  /**
   * Request withdrawal
   */
  async withdrawFunds(data: CreateWithdrawalRequest): Promise<WithdrawalRequest> {
    return await apiClient.post<WithdrawalRequest>('/wallet/withdraw', data);
  },

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    return await apiClient.get<BankAccount[]>('/wallet/bank-accounts');
  },

  /**
   * Add bank account
   */
  async addBankAccount(data: AddBankAccountRequest): Promise<BankAccount> {
    return await apiClient.post<BankAccount>('/wallet/bank-accounts', data);
  },
};

