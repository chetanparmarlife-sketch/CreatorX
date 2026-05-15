'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, CreditCard, Wallet, Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ActionBar } from '@/components/shared/action-bar'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import {
  useBrandWallet,
  useWalletTransactions,
  useCreateDepositOrder,
} from '@/lib/hooks/use-wallet'
import { campaignService } from '@/lib/api/campaigns'
import { workspaceService } from '@/lib/api/workspace'
import { CampaignStatus, EscrowStatus } from '@/lib/types'
import Script from 'next/script'
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'

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

const roundTopUp = (value: number) => Math.max(1000, Math.ceil(value / 1000) * 1000)

const getCampaignFundingNeed = (campaign: {
  budget: number
  escrowAllocated?: number
  escrowStatus?: EscrowStatus
}) => {
  const escrowStatus = campaign.escrowStatus || EscrowStatus.UNFUNDED
  if (escrowStatus === EscrowStatus.FUNDED || escrowStatus === EscrowStatus.RELEASED) {
    return 0
  }

  return Math.max(0, campaign.budget - (campaign.escrowAllocated ?? 0))
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
  const { data: workspaceSummary } = useQuery({
    queryKey: ['brand-workspace-summary'],
    queryFn: () => workspaceService.getSummary(),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })
  const { data: campaignsPage } = useQuery({
    queryKey: ['campaigns', 'payments-funding-guidance'],
    queryFn: () => campaignService.getCampaigns({}, 0),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })
  const createDeposit = useCreateDepositOrder()
  const { track } = useBrandEventTracker({
    walletBalance: wallet?.balance ?? null,
  })

  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState<number>(10000)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const action = searchParams.get('action')
    const urlAmount = searchParams.get('amount')
    if (action === 'fund' || action === 'deposit') {
      setShowAddFunds(true)
      if (urlAmount) {
        const parsed = Number(urlAmount)
        if (!isNaN(parsed) && parsed >= 1000) {
          setAmount(parsed)
        }
      }
    }
  }, [searchParams])

  const transactions = transactionsPage?.items ?? []
  const campaigns = campaignsPage?.items ?? []
  const fundingCampaigns = useMemo(
    () =>
      campaigns
        .filter(
          (campaign) =>
            ![CampaignStatus.COMPLETED, CampaignStatus.CANCELLED].includes(campaign.status) &&
            getCampaignFundingNeed(campaign) > 0
        )
        .sort((a, b) => getCampaignFundingNeed(b) - getCampaignFundingNeed(a)),
    [campaigns]
  )
  const upcomingCommitments = useMemo(
    () =>
      fundingCampaigns.reduce(
        (total, campaign) => total + getCampaignFundingNeed(campaign),
        0
      ),
    [fundingCampaigns]
  )
  const recommendedTopUp = Math.max(0, upcomingCommitments - (wallet?.balance ?? 0))
  const walletBlockers = workspaceSummary?.walletBlockers ?? fundingCampaigns.length
  const priorityFundingCampaigns = fundingCampaigns.slice(0, 3)

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
      setError('Minimum deposit: INR 1,000')
      return
    }

    track('wallet_fund_initiated', {
      amount,
      source: searchParams.get('campaignId') ? 'campaign_flow' : 'payments_page',
      campaign_id: searchParams.get('campaignId'),
    })

    setIsProcessing(true)
    setError(null)

    try {
      const order = await createDeposit.mutateAsync({ amount })

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'CreatorX',
        description: 'Add funds to wallet',
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          track('wallet_fund_success', {
            amount,
            order_id: order.razorpayOrderId,
            payment_id: response?.razorpay_payment_id || null,
            campaign_id: searchParams.get('campaignId'),
          })

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
          color: '#2563eb',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.message || 'Failed to create payment order')
      setIsProcessing(false)
    }
  }

  const openRecommendedFunding = () => {
    const nextAmount = roundTopUp(recommendedTopUp || 10000)
    setAmount(nextAmount)
    setShowAddFunds(true)
    setError(null)
    track('quick_action_clicked', {
      action_id: 'open_recommended_wallet_funding',
      action_title: 'Open Recommended Wallet Funding',
      destination: '/payments',
      recommended_amount: nextAmount,
      wallet_blockers: walletBlockers,
    })
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <DashboardPageShell
        title="Wallet & Payments"
        subtitle="Manage wallet balance, campaign allocations, and payout transactions."
        contentClassName="space-y-5 lg:space-y-6"
        actionBar={
          <ActionBar
            title="Funding controls"
            description="Add funds, export transactions, and keep payout flow healthy."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={exportTransactionsCsv}
              disabled={transactions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </ActionBar>
        }
        ctaLabel={showAddFunds ? 'Hide Form' : 'Add Funds'}
        onCtaClick={() => {
          track('quick_action_clicked', {
            action_id: showAddFunds ? 'hide_fund_form' : 'open_fund_form',
            action_title: showAddFunds ? 'Hide Add Funds Form' : 'Open Add Funds Form',
            destination: '/payments',
          })
          setShowAddFunds(!showAddFunds)
        }}
      >
        {showAddFunds && (
          <Card className="border-slate-200 bg-blue-50/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Funds to Wallet</h3>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-2 block">Amount (INR)</label>
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
                <p className="text-xs text-gray-500 mt-1">Minimum: INR 1,000</p>
              </div>
              <Button onClick={handleAddFunds} disabled={isProcessing} className="sm:shrink-0">
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddFunds(false)
                  setError(null)
                }}
                disabled={isProcessing}
                className="sm:shrink-0"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {wallet ? formatCurrency(wallet.balance) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to allocate</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Deposited</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalDeposited) : '--'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-600">Lifetime</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Allocated to Campaigns</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalAllocated) : '--'}
            </p>
            <p className="text-xs text-gray-500 mt-1">In active campaigns</p>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Released to Creators</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {wallet ? formatCurrency(wallet.totalReleased) : '--'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-orange-500" />
              <p className="text-xs text-orange-600">Payouts</p>
            </div>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50/60 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-950">Campaign funding guidance</p>
                <p className="mt-1 text-sm text-amber-800">
                  {walletBlockers > 0
                    ? `${walletBlockers} campaign${walletBlockers === 1 ? '' : 's'} need funding attention before creators can move smoothly.`
                    : 'No campaign funding blockers found in the current workspace queue.'}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-700">Upcoming commitments</p>
                    <p className="mt-1 text-lg font-semibold text-amber-950">
                      {formatCurrency(upcomingCommitments)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-700">Available wallet</p>
                    <p className="mt-1 text-lg font-semibold text-amber-950">
                      {formatCurrency(wallet?.balance ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-700">Recommended top-up</p>
                    <p className="mt-1 text-lg font-semibold text-amber-950">
                      {formatCurrency(recommendedTopUp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button
                size="sm"
                onClick={openRecommendedFunding}
                disabled={recommendedTopUp <= 0 && walletBlockers === 0}
              >
                Add recommended funds
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/campaigns">Review campaigns</Link>
              </Button>
            </div>
          </div>

          {priorityFundingCampaigns.length > 0 && (
            <div className="mt-5 divide-y rounded-lg border border-amber-200 bg-white">
              {priorityFundingCampaigns.map((campaign) => {
                const need = getCampaignFundingNeed(campaign)
                return (
                  <div key={campaign.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{campaign.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {campaign.status} / {campaign.escrowStatus || EscrowStatus.UNFUNDED} / needs {formatCurrency(need)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>Open funding</Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <p className="text-sm text-gray-500 mt-1">All wallet deposits, allocations, and releases</p>
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
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{tx.description}</p>
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
                      <p className="text-xs text-gray-400 mt-0.5">Campaign: {tx.campaignTitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getTransactionColor(tx.type)}`}>
                      {getTransactionSign(tx.type)}
                      {formatCurrency(tx.amount)}
                    </p>
                    {tx.balanceAfter !== null && tx.balanceAfter !== undefined && (
                      <p className="text-xs text-gray-500 mt-0.5">Balance: {formatCurrency(tx.balanceAfter)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-sky-200 bg-sky-50 p-6">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">How the wallet works</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>Add funds to your wallet via Razorpay (UPI, Card, Net Banking)</li>
                <li>Allocate funds to campaigns when creating or funding them</li>
                <li>Funds are automatically released to creators when deliverables are approved</li>
                <li>Unused campaign funds are refunded to your wallet when campaigns end</li>
              </ul>
            </div>
          </div>
        </Card>
      </DashboardPageShell>
    </>
  )
}
