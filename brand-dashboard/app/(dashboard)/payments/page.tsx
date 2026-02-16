'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, CreditCard, Wallet, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useBrandWallet,
  useWalletTransactions,
  useCreateDepositOrder,
} from '@/lib/hooks/use-wallet'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'DEPOSIT':
    case 'REFUND':
      return 'text-green-600'
    case 'ALLOCATION':
    case 'RELEASE':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getTransactionSign = (type: string) => {
  switch (type) {
    case 'DEPOSIT':
    case 'REFUND':
      return '+'
    case 'ALLOCATION':
    case 'RELEASE':
      return '-'
    default:
      return ''
  }
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-900 font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

export default function PaymentsPage() {
  const searchParams = useSearchParams()
  const { data: wallet, refetch: refetchWallet } = useBrandWallet()
  const { data: transactionsPage } = useWalletTransactions({ page: 0, size: 20 })
  const createDeposit = useCreateDepositOrder()

  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState<number>(10000)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill deposit form from URL params (e.g., /payments?action=fund&amount=50000)
  useEffect(() => {
    const action = searchParams.get('action')
    const urlAmount = searchParams.get('amount')
    if (action === 'fund') {
      setShowAddFunds(true)
      if (urlAmount) {
        const parsed = Number(urlAmount)
        if (!isNaN(parsed) && parsed >= 1000) {
          setAmount(parsed)
        }
      }
    }
  }, [searchParams])

  const transactions = transactionsPage?.content ?? []

  const exportTransactionsCsv = useCallback(() => {
    if (!transactions.length) return
    const rows = [
      ['Date', 'Description', 'Type', 'Campaign', 'Amount (INR)', 'Balance After'],
      ...transactions.map((tx) => [
        new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        tx.description || '',
        tx.type,
        tx.campaignTitle || '',
        `${getTransactionSign(tx.type)}${tx.amount}`,
        tx.balanceAfter != null ? String(tx.balanceAfter) : '',
      ]),
    ]
    const csvContent = rows.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [transactions])

  const handleAddFunds = async () => {
    if (amount < 1000) {
      setError('Minimum deposit: ₹1,000')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // 1. Create payment order
      const order = await createDeposit.mutateAsync({ amount })

      // 2. Open Razorpay checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount * 100, // Convert to paise
        currency: order.currency,
        name: 'CreatorX',
        description: 'Add funds to wallet',
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          console.log('Payment successful:', response)

          // Wait for webhook to process (2-3 seconds)
          setTimeout(() => {
            refetchWallet()
            setShowAddFunds(false)
            setIsProcessing(false)
            setAmount(10000)
          }, 2500)
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
        theme: {
          color: '#7c3aed',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Error adding funds:', err)
      setError(err.message || 'Failed to create payment order')
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wallet & Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your campaign funds and transactions
          </p>
          <div className="h-1 w-12 rounded-full bg-primary/70" />
        </div>

        {/* Add Funds Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddFunds(!showAddFunds)}
            disabled={isProcessing}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
        </div>

        {/* Add Funds Form */}
        {showAddFunds && (
          <Card className="p-6 border-purple-200 bg-purple-50">
            <h3 className="text-lg font-semibold mb-4">Add Funds to Wallet</h3>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-2 block">
                  Amount (INR)
                </label>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value))
                    setError(null)
                  }}
                  placeholder="10000"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: ₹1,000</p>
              </div>
              <Button
                onClick={handleAddFunds}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay ${formatCurrency(amount)}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddFunds(false)
                  setError(null)
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Wallet Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {wallet ? formatCurrency(wallet.balance) : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to allocate</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Deposited
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalDeposited) : '—'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-600">Lifetime</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Allocated to Campaigns
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalAllocated) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">In active campaigns</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Released to Creators
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalReleased) : '—'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-orange-500" />
              <p className="text-xs text-orange-600">Payouts</p>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <p className="text-sm text-gray-500 mt-1">
                All wallet deposits, allocations, and releases
              </p>
            </div>
            {transactions.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportTransactionsCsv}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Your transaction history will appear here after you add funds"
              />
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {tx.description}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    {tx.campaignTitle && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Campaign: {tx.campaignTitle}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${getTransactionColor(tx.type)}`}
                    >
                      {getTransactionSign(tx.type)}
                      {formatCurrency(tx.amount)}
                    </p>
                    {tx.balanceAfter !== null && tx.balanceAfter !== undefined && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Balance: {formatCurrency(tx.balanceAfter)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">
                How the wallet works
              </h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Add funds to your wallet via Razorpay (UPI, Card, Net Banking)</li>
                <li>• Allocate funds to campaigns when creating or funding them</li>
                <li>
                  • Funds are automatically released to creators when deliverables
                  are approved
                </li>
                <li>• Unused campaign funds are refunded to your wallet when campaigns end</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
