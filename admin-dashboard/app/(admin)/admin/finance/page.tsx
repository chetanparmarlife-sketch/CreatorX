'use client'

import { useQuery } from '@tanstack/react-query'
import { adminFinanceService } from '@/lib/api/admin/finance'

export default function AdminFinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-finance-summary'],
    queryFn: () => adminFinanceService.getSummary(),
  })

  const items = [
    { label: 'Total Earnings', value: data?.totalEarnings ?? 0 },
    { label: 'Total Withdrawals', value: data?.totalWithdrawals ?? 0 },
    { label: 'Total Refunds', value: data?.totalRefunds ?? 0 },
    { label: 'Total Penalties', value: data?.totalPenalties ?? 0 },
    { label: 'Pending Payouts', value: data?.pendingPayouts ?? 0 },
    { label: 'Transactions', value: data?.totalTransactions ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Finance</h1>
        <p className="text-slate-500">Reconciliation overview for platform payouts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {isLoading ? '—' : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
