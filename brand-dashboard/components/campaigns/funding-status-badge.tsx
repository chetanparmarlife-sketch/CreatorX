'use client'

import { Campaign, EscrowStatus } from '@/lib/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

interface FundingStatusBadgeProps {
  campaign: Campaign
}

export function FundingStatusBadge({ campaign }: FundingStatusBadgeProps) {
  // Default to UNFUNDED if escrowStatus is not set
  const escrowStatus = campaign.escrowStatus || EscrowStatus.UNFUNDED
  const escrowAllocated = campaign.escrowAllocated || 0
  const escrowReleased = campaign.escrowReleased || 0

  const getStatusConfig = () => {
    switch (escrowStatus) {
      case EscrowStatus.FUNDED:
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: '💰',
          label: 'Funded',
          description: `${formatCurrency(escrowAllocated)} allocated`,
        }
      case EscrowStatus.PARTIAL:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '⚠️',
          label: 'Partially Funded',
          description: `${formatCurrency(escrowAllocated)} of ${formatCurrency(campaign.budget)}`,
        }
      case EscrowStatus.UNFUNDED:
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: '❗',
          label: 'Needs Funding',
          description: `${formatCurrency(campaign.budget)} required`,
        }
      case EscrowStatus.RELEASED:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: '✓',
          label: 'Completed',
          description: `${formatCurrency(escrowReleased)} paid out`,
        }
      case EscrowStatus.REFUNDED:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '↩️',
          label: 'Refunded',
          description: 'Funds returned to wallet',
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '?',
          label: 'Unknown',
          description: '',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${config.color}`}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
