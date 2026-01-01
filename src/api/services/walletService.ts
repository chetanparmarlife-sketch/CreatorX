/**
 * Wallet service
 */

import { apiClient } from '../client';
import {
  WithdrawalRequest,
  BankAccount,
  CreateWithdrawalRequest,
  AddBankAccountRequest,
  PaginatedResponse,
} from '../types';

export type WalletDTO = {
  id: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
};

export type TransactionDTO = {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
  campaignId?: string;
  referenceId?: string;
};

export type WithdrawalDTO = {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID' | 'FAILED';
  createdAt: string;
};

export const walletService = {
  /**
   * Get wallet balance
   */
  async getWallet(): Promise<WalletDTO> {
    return await apiClient.get<WalletDTO>('/wallet');
  },

  /**
   * Get transaction history
   */
  async getTransactions(page = 0, size = 20): Promise<PaginatedResponse<TransactionDTO>> {
    return await apiClient.get<PaginatedResponse<TransactionDTO>>(
      `/wallet/transactions?page=${page}&size=${size}`
    );
  },

  /**
   * Get withdrawals list
   */
  async getWithdrawals(page = 0, size = 20): Promise<PaginatedResponse<WithdrawalDTO>> {
    return await apiClient.get<PaginatedResponse<WithdrawalDTO>>(
      `/wallet/withdrawals?page=${page}&size=${size}`
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
