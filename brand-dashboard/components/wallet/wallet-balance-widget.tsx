'use client'

import { Wallet, Loader2, AlertCircle } from 'lucide-react'
import { useBrandWallet } from '@/lib/hooks/use-wallet'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Format currency with Indian number system
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function WalletBalanceWidget() {
  const router = useRouter()
  const { data: wallet, isLoading, isError, error } = useBrandWallet()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Wallet className="h-4 w-4 text-muted-foreground animate-pulse" />
        <Skeleton className="h-5 w-20" />
      </div>
    )
  }

  if (isError) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200 cursor-help">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Error
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{(error as any)?.message || 'Failed to load wallet'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!wallet) {
    return null
  }

  const balanceColor = wallet.balance > 10000
    ? 'text-green-700'
    : wallet.balance > 5000
    ? 'text-yellow-700'
    : 'text-orange-700'

  const bgColor = wallet.balance > 10000
    ? 'bg-green-50 border-green-200'
    : wallet.balance > 5000
    ? 'bg-yellow-50 border-yellow-200'
    : 'bg-orange-50 border-orange-200'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-3 py-2 h-auto ${bgColor} rounded-lg border hover:opacity-80 transition-opacity cursor-pointer`}
            onClick={() => router.push('/payments')}
          >
            <Wallet className={`h-4 w-4 ${balanceColor}`} />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground leading-none">Balance</span>
              <span className={`text-sm font-semibold ${balanceColor} leading-tight mt-0.5`}>
                {formatCurrency(wallet.balance)}
              </span>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-semibold">Wallet Summary</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-muted-foreground">Total Deposited</p>
                <p className="font-medium">{formatCurrency(wallet.totalDeposited)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Allocated</p>
                <p className="font-medium">{formatCurrency(wallet.totalAllocated)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Released</p>
                <p className="font-medium">{formatCurrency(wallet.totalReleased)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-medium">{formatCurrency(wallet.balance)}</p>
              </div>
            </div>
            <p className="text-muted-foreground italic mt-2">
              Click to manage your wallet
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
