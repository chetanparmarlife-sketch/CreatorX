'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePaymentMethods, useTransactions, useWallet } from '@/lib/hooks/use-payments'
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
  const router = useRouter()
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods()
  const { data: wallet } = useWallet()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
  })

  const hasMethods = (paymentMethods as any[])?.length > 0
  const transactionRows = useMemo(() => transactions ?? [], [transactions])
  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'ALL') return transactionRows
    return transactionRows.filter((transaction) => transaction.type === typeFilter)
  }, [transactionRows, typeFilter])
  const totalSpent = filteredTransactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0)

  return (
    <div>
      <PageHeader 
        title="Payments" 
        ctaLabel="Add Payment Method"
        onCtaClick={() => router.push('/settings')}
      />

      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Available balance</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {wallet ? formatCurrency(wallet.balance ?? 0) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pending: {wallet ? formatCurrency(wallet.pendingBalance ?? 0) : '—'}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Payments activity</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">Filtered total</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Payout readiness</p>
            <p className="mt-2 text-sm text-gray-700">
              {hasMethods ? 'Payment method connected.' : 'Add a payment method to schedule payouts.'}
            </p>
            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              onClick={() => router.push('/settings')}
            >
              Manage payout settings
            </Button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Payable schedule</p>
            <p className="mt-2 text-sm text-gray-700">Next payout: —</p>
            <p className="text-xs text-gray-500 mt-1">Schedule: — (coming soon)</p>
          </div>
        </div>

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
                    type="date"
                    placeholder="From"
                    className="pl-10 bg-white border-gray-300"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="To"
                    className="pl-10 bg-white border-gray-300"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                >
                  <option value="ALL">All types</option>
                  <option value="EARNING">Earnings</option>
                  <option value="WITHDRAWAL">Withdrawals</option>
                  <option value="REFUND">Refunds</option>
                  <option value="BONUS">Bonuses</option>
                  <option value="PENALTY">Penalties</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('ALL')
                  setTypeFilter('ALL')
                  setFromDate('')
                  setToDate('')
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Your transaction history will appear here"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction: Transaction) => (
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
