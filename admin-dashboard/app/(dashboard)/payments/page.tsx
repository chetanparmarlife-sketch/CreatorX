'use client'

import { useMemo } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { usePaymentMethods, useTransactions } from '@/lib/hooks/use-payments'
import type { Transaction } from '@/lib/types'

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-900 font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function PaymentsPage() {
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 20,
  })

  const hasMethods = (paymentMethods as any[])?.length > 0
  const transactionRows = useMemo(() => transactions ?? [], [transactions])

  return (
    <div>
      <PageHeader 
        title="Payments" 
        ctaLabel="Add Payment Method"
        onCtaClick={() => console.log('Add payment method')}
      />

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          {methodsLoading ? (
            <div className="text-sm text-gray-500">Loading payment methods...</div>
          ) : hasMethods ? (
            <div className="space-y-3">
              {(paymentMethods as any[]).map((method) => (
                <div
                  key={method.id || method.accountNumber}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                >
                  <div>
                    <p className="font-medium">{method.bankName || 'Bank account'}</p>
                    <p className="text-xs text-gray-500">
                      {method.accountNumber ? `**** ${String(method.accountNumber).slice(-4)}` : 'Default'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{method.status || 'Active'}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No payment methods added"
              description="Add a payment method to start processing transactions"
            />
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h3>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="From"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="To"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Status</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Type</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading transactions...</div>
          ) : transactionRows.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Your transaction history will appear here"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {transactionRows.map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description || transaction.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleDateString()
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.status || 'Processed'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
