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
  type: 'EARNING' | 'WITHDRAWAL' | 'REFUND' | 'BONUS' | 'PENALTY';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  amount: number;
  currency?: string;
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

const generateIdempotencyKey = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
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
    const idempotencyKey = generateIdempotencyKey();
    return await apiClient.post<WithdrawalRequest>('/wallet/withdraw', data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
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
