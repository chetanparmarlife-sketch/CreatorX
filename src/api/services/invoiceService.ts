/**
 * Invoice service for creator invoices
 */

import { apiClient } from '../client';
import { PaginatedResponse } from '../types';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type InvoiceDTO = {
  id: string;
  invoiceNumber: string;
  campaignName: string;
  brandName: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  description: string | null;
};

export type InvoiceCountsDTO = {
  paid: number;
  pending: number;
  overdue: number;
};

export type FormattedInvoice = {
  id: string;
  campaign: string;
  brand: string;
  amount: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
};

/**
 * Format currency amount for display
 */
const formatAmount = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

/**
 * Format date for display (e.g., "Dec 2, 2024")
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Normalize status to lowercase
 */
const normalizeStatus = (status: string): InvoiceStatus => {
  const lower = status.toLowerCase();
  if (lower === 'paid' || lower === 'pending' || lower === 'overdue') {
    return lower;
  }
  return 'pending';
};

/**
 * Transform backend InvoiceDTO to frontend FormattedInvoice
 */
const transformInvoice = (invoice: InvoiceDTO): FormattedInvoice => ({
  id: invoice.invoiceNumber || invoice.id,
  campaign: invoice.campaignName,
  brand: invoice.brandName,
  amount: formatAmount(invoice.amount, invoice.currency),
  date: formatDate(invoice.issueDate),
  dueDate: formatDate(invoice.dueDate),
  status: normalizeStatus(invoice.status),
});

export const invoiceService = {
  /**
   * Get invoices for the current creator (paginated)
   */
  async getInvoices(
    page = 0,
    size = 20,
    status?: string
  ): Promise<PaginatedResponse<InvoiceDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (status && status !== 'all') {
      params.append('status', status.toUpperCase());
    }
    return await apiClient.get<PaginatedResponse<InvoiceDTO>>(
      `/invoices?${params.toString()}`
    );
  },

  /**
   * Get invoices formatted for display
   */
  async getFormattedInvoices(
    page = 0,
    size = 20,
    status?: string
  ): Promise<{ invoices: FormattedInvoice[]; total: number; page: number; size: number }> {
    const response = await this.getInvoices(page, size, status);
    return {
      invoices: response.items.map(transformInvoice),
      total: response.total,
      page: response.page,
      size: response.size,
    };
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<InvoiceDTO> {
    return await apiClient.get<InvoiceDTO>(`/invoices/${id}`);
  },

  /**
   * Get invoice counts by status
   */
  async getInvoiceCounts(): Promise<InvoiceCountsDTO> {
    return await apiClient.get<InvoiceCountsDTO>('/invoices/counts');
  },

  /**
   * Download invoice as PDF
   */
  async downloadInvoicePdf(id: string): Promise<Blob> {
    return await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
  },
};
