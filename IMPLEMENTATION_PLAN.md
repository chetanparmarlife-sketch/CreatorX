# 🎯 CreatorX Wallet System - Implementation Plan

**Version:** 1.0
**Created:** February 11, 2026
**Status:** Ready for Execution
**Current Phase:** Post-Deployment → v1.1 (Campaign Integration)

---

## 📊 Executive Summary

This document provides a **step-by-step implementation plan** for enhancing the CreatorX Brand Wallet system from v1.0 (deployed) to v2.0 (advanced features). Each task includes:

- **Clear objectives** and acceptance criteria
- **File paths** and code snippets
- **Estimated time** and dependencies
- **Testing requirements**
- **Success metrics**

**Total estimated effort:** 182 hours (~23 working days at 8h/day)

---

## 🎯 Current Status (v1.0 - Deployed)

### ✅ Completed
- Brand wallet database schema (migration V54)
- BrandWalletService with full payment logic (400+ lines)
- REST API endpoints (5 endpoints)
- React payments page with Razorpay integration
- Automatic payment release on deliverable approval
- Transaction audit trail with metadata
- Pessimistic locking for concurrency safety
- Idempotent webhook processing

### ⏳ Deployment Status
- **GitHub:** 3 commits pushed (fb4ce56, b20063d, f412656)
- **Railway:** Auto-deploying backend
- **Vercel:** Auto-deploying frontend
- **Database:** Migration V54 will run on deployment

### ⚠️ Post-Deployment Required
1. Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to Vercel
2. Configure Razorpay webhook URL
3. Verify production deployment
4. Test complete payment flow

---

## 🚀 Implementation Phases

### Phase 1: Campaign Integration (v1.1) - Week 1-2
**Priority:** 🔴 Critical
**Estimated:** 14 hours
**Goal:** Connect wallet system to campaign lifecycle

### Phase 2: UI/UX Enhancements (v1.2) - Week 2-3
**Priority:** 🟡 High
**Estimated:** 24 hours
**Goal:** Improve user experience and notifications

### Phase 3: Business Logic (v1.3) - Week 3-4
**Priority:** 🟡 High
**Estimated:** 40 hours
**Goal:** Add custom pricing and automated workflows

### Phase 4: Security & Compliance (v1.4) - Week 5
**Priority:** 🔴 Critical
**Estimated:** 24 hours
**Goal:** Harden security and add compliance features

### Phase 5: Analytics (v1.5) - Week 6-7
**Priority:** 🟢 Medium
**Estimated:** 32 hours
**Goal:** Payment analytics and reporting

### Phase 6: Testing & QA (v1.6) - Week 7-9
**Priority:** 🔴 Critical
**Estimated:** 48 hours
**Goal:** Comprehensive testing and quality assurance

---

## 📋 Detailed Task Breakdown

---

## 🔥 PHASE 1: Campaign Integration (Week 1-2)

### Task 1.1: Add Escrow Status Display to Campaign Details Page
**Priority:** 🔴 Critical
**Estimated Time:** 3 hours
**Dependencies:** None

#### Objectives
- Show campaign funding status on details page
- Display allocated and released amounts
- Add "Fund Campaign" button for unfunded campaigns
- Show funding success indicator for funded campaigns

#### Files to Modify
- `brand-dashboard/app/(dashboard)/campaigns/[id]/page.tsx`

#### Implementation Steps

**Step 1: Add imports (5 min)**
```tsx
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useBrandWallet, useAllocateToCampaign } from '@/lib/hooks/use-wallet'
import { formatCurrency } from '@/lib/utils'
```

**Step 2: Add wallet hooks (5 min)**
```tsx
const { data: wallet, isLoading: walletLoading } = useBrandWallet()
const allocateMutation = useAllocateToCampaign()
```

**Step 3: Add funding handler (15 min)**
```tsx
const handleFundCampaign = async () => {
  if (!campaign || !wallet) return

  const amountNeeded = campaign.budget

  if (wallet.balance < amountNeeded) {
    toast.error(`Insufficient balance. You need ₹${amountNeeded - wallet.balance} more.`)
    router.push(`/payments?action=deposit&amount=${amountNeeded - wallet.balance}`)
    return
  }

  try {
    await allocateMutation.mutateAsync({
      campaignId: campaign.id,
      amount: amountNeeded,
    })
    toast.success('Campaign funded successfully!')
    refetch() // Refetch campaign data
  } catch (error) {
    toast.error('Failed to fund campaign: ' + error.message)
  }
}
```

**Step 4: Add UI components (2 hours)**
```tsx
{/* Add after campaign header, before tabs */}
<div className="mb-6">
  {campaign.escrowStatus === 'UNFUNDED' && (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Campaign Not Funded</AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="flex items-center justify-between mt-2">
          <span>
            This campaign needs {formatCurrency(campaign.budget)} to be activated.
            {wallet && wallet.balance < campaign.budget && (
              <span className="block text-sm mt-1">
                Your balance: {formatCurrency(wallet.balance)}
                (Need {formatCurrency(campaign.budget - wallet.balance)} more)
              </span>
            )}
          </span>
          <Button
            onClick={handleFundCampaign}
            disabled={allocateMutation.isPending}
            className="ml-4"
          >
            {allocateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Funding...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Fund Campaign
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )}

  {campaign.escrowStatus === 'FUNDED' && (
    <Card className="bg-green-50 border-green-200 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-green-800">Campaign Funded</p>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-green-700">
            <div>
              <span className="text-green-600">Total Allocated:</span>
              <p className="font-medium">{formatCurrency(campaign.escrowAllocated)}</p>
            </div>
            <div>
              <span className="text-green-600">Released to Creators:</span>
              <p className="font-medium">{formatCurrency(campaign.escrowReleased)}</p>
            </div>
            <div>
              <span className="text-green-600">Remaining:</span>
              <p className="font-medium">
                {formatCurrency(campaign.escrowAllocated - campaign.escrowReleased)}
              </p>
            </div>
            <div>
              <span className="text-green-600">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                ✓ Funded
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )}

  {campaign.escrowStatus === 'PARTIAL' && (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Partially Funded</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span>Funding Progress</span>
            <span className="font-medium">
              {formatCurrency(campaign.escrowAllocated)} / {formatCurrency(campaign.budget)}
            </span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${(campaign.escrowAllocated / campaign.budget) * 100}%` }}
            />
          </div>
          <Button
            onClick={handleFundCampaign}
            className="mt-3"
            size="sm"
          >
            Add Remaining {formatCurrency(campaign.budget - campaign.escrowAllocated)}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )}
</div>
```

**Step 5: Add TypeScript interfaces (15 min)**
```tsx
// Ensure Campaign interface has escrow fields
interface Campaign {
  // ... existing fields
  escrowAllocated: number
  escrowReleased: number
  escrowStatus: 'UNFUNDED' | 'PARTIAL' | 'FUNDED' | 'RELEASED' | 'REFUNDED'
}
```

#### Testing Checklist
- [ ] UNFUNDED status shows orange alert with fund button
- [ ] FUNDED status shows green card with allocation details
- [ ] PARTIAL status shows yellow progress bar
- [ ] Fund button redirects to payments if insufficient balance
- [ ] Fund button allocates successfully if balance available
- [ ] Campaign data refreshes after successful funding
- [ ] Error messages show for failed allocations
- [ ] Loading states work correctly

#### Success Metrics
- Brand can see funding status at a glance
- One-click funding from campaign page
- Clear balance requirements shown
- Smooth redirect to add funds when needed

---

### Task 1.2: Add Funding Flow to Campaign Creation
**Priority:** 🔴 Critical
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1

#### Objectives
- Check wallet balance during campaign creation
- Show funding prompt after successful campaign creation
- Redirect to add funds if insufficient balance
- Allow brands to fund immediately or defer

#### Files to Modify
- `brand-dashboard/app/(dashboard)/campaigns/new/page.tsx`

#### Implementation Steps

**Step 1: Add state management (10 min)**
```tsx
const [showFundingDialog, setShowFundingDialog] = useState(false)
const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null)
const [fundingStep, setFundingStep] = useState<'check' | 'fund' | 'complete'>('check')
```

**Step 2: Add wallet hook (5 min)**
```tsx
const { data: wallet, refetch: refetchWallet } = useBrandWallet()
const allocateMutation = useAllocateToCampaign()
```

**Step 3: Modify onSubmit handler (30 min)**
```tsx
const onSubmit = async (data: CampaignFormData) => {
  try {
    setIsCreating(true)

    // Create campaign
    const campaign = await createCampaign.mutateAsync(data)
    setCreatedCampaign(campaign)

    toast.success('Campaign created successfully!')

    // Fetch latest wallet balance
    const { data: currentWallet } = await refetchWallet()

    // Check if brand has sufficient balance
    if (!currentWallet || currentWallet.balance === 0) {
      // No wallet or empty balance - redirect to add funds
      router.push(
        `/payments?action=deposit&amount=${campaign.budget}&campaignId=${campaign.id}`
      )
      return
    }

    if (currentWallet.balance < campaign.budget) {
      // Insufficient balance - show partial funding or add funds option
      setFundingStep('check')
      setShowFundingDialog(true)
    } else {
      // Sufficient balance - show immediate funding option
      setFundingStep('fund')
      setShowFundingDialog(true)
    }

  } catch (error) {
    toast.error('Failed to create campaign: ' + error.message)
  } finally {
    setIsCreating(false)
  }
}
```

**Step 4: Create Funding Dialog component (2.5 hours)**
```tsx
{showFundingDialog && createdCampaign && (
  <Dialog open={showFundingDialog} onOpenChange={setShowFundingDialog}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Fund Your Campaign</DialogTitle>
        <DialogDescription>
          Your campaign "{createdCampaign.title}" has been created successfully.
        </DialogDescription>
      </DialogHeader>

      {fundingStep === 'check' && wallet && (
        <div className="space-y-4">
          <Alert className={
            wallet.balance >= createdCampaign.budget
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }>
            <Wallet className="h-4 w-4" />
            <AlertTitle>Current Balance</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Required</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(createdCampaign.budget)}
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {wallet.balance >= createdCampaign.budget ? (
            // Sufficient balance
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    await allocateMutation.mutateAsync({
                      campaignId: createdCampaign.id,
                      amount: createdCampaign.budget,
                    })
                    setFundingStep('complete')
                    toast.success('Campaign funded successfully!')
                  } catch (error) {
                    toast.error('Failed to fund campaign')
                  }
                }}
                disabled={allocateMutation.isPending}
                className="flex-1"
              >
                {allocateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Funding...
                  </>
                ) : (
                  'Fund Now'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/campaigns/${createdCampaign.id}`)
                }}
              >
                Fund Later
              </Button>
            </div>
          ) : (
            // Insufficient balance
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You need {formatCurrency(createdCampaign.budget - wallet.balance)} more
                to fund this campaign.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    router.push(
                      `/payments?action=deposit&amount=${
                        createdCampaign.budget - wallet.balance
                      }&campaignId=${createdCampaign.id}`
                    )
                  }}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(`/campaigns/${createdCampaign.id}`)
                  }}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {fundingStep === 'complete' && (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Campaign Funded!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your campaign is now active and ready for applications.
            </p>
          </div>
          <Button
            onClick={() => {
              router.push(`/campaigns/${createdCampaign.id}`)
            }}
            className="w-full"
          >
            View Campaign
          </Button>
        </div>
      )}
    </DialogContent>
  </Dialog>
)}
```

#### Testing Checklist
- [ ] Dialog shows after successful campaign creation
- [ ] Correct balance check and display
- [ ] "Fund Now" works when balance sufficient
- [ ] "Add Funds" redirects to payments with correct amount
- [ ] "Fund Later" navigates to campaign details
- [ ] Success state shows after funding
- [ ] Error handling works for failed allocations
- [ ] Campaign ID properly passed to payments page

#### Success Metrics
- Seamless funding flow after creation
- Clear balance visibility
- Multiple funding options (now, later, add more)
- Reduced unfunded campaigns

---

### Task 1.3: Add Funding Status Badges to Campaigns List
**Priority:** 🟡 High
**Estimated Time:** 2 hours
**Dependencies:** None

#### Objectives
- Show funding status badge on each campaign card
- Color-code badges (green = funded, orange = unfunded)
- Add filter by funding status
- Show quick stats on hover

#### Files to Modify
- `brand-dashboard/app/(dashboard)/campaigns/page.tsx`

#### Implementation Steps

**Step 1: Update Campaign interface (5 min)**
```tsx
// Ensure interface includes escrow fields
interface Campaign {
  // ... existing
  escrowStatus: 'UNFUNDED' | 'PARTIAL' | 'FUNDED' | 'RELEASED' | 'REFUNDED'
  escrowAllocated: number
  escrowReleased: number
  budget: number
}
```

**Step 2: Add filter state (10 min)**
```tsx
const [fundingFilter, setFundingFilter] = useState<string>('all')

const filteredCampaigns = campaigns?.filter((campaign) => {
  if (fundingFilter === 'all') return true
  if (fundingFilter === 'funded') return campaign.escrowStatus === 'FUNDED'
  if (fundingFilter === 'unfunded') return campaign.escrowStatus === 'UNFUNDED'
  if (fundingFilter === 'partial') return campaign.escrowStatus === 'PARTIAL'
  return true
})
```

**Step 3: Add filter UI (30 min)**
```tsx
{/* Add after search/sort controls */}
<div className="flex gap-2">
  <Button
    variant={fundingFilter === 'all' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setFundingFilter('all')}
  >
    All
  </Button>
  <Button
    variant={fundingFilter === 'funded' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setFundingFilter('funded')}
    className="text-green-700 border-green-300"
  >
    Funded
  </Button>
  <Button
    variant={fundingFilter === 'unfunded' ? 'default' : 'outline'}
    size="sm"
    onClick={() => setFundingFilter('unfunded')}
    className="text-orange-700 border-orange-300"
  >
    Needs Funding
  </Button>
</div>
```

**Step 4: Create badge component (1 hour)**
```tsx
const FundingStatusBadge = ({ campaign }: { campaign: Campaign }) => {
  const getStatusConfig = () => {
    switch (campaign.escrowStatus) {
      case 'FUNDED':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: '💰',
          label: 'Funded',
          description: `${formatCurrency(campaign.escrowAllocated)} allocated`,
        }
      case 'PARTIAL':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '⚠️',
          label: 'Partially Funded',
          description: `${formatCurrency(campaign.escrowAllocated)} of ${formatCurrency(campaign.budget)}`,
        }
      case 'UNFUNDED':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: '❗',
          label: 'Needs Funding',
          description: `${formatCurrency(campaign.budget)} required`,
        }
      case 'RELEASED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: '✓',
          label: 'Completed',
          description: `${formatCurrency(campaign.escrowReleased)} paid out`,
        }
      case 'REFUNDED':
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
          <Badge className={`${config.color} border cursor-help`}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

**Step 5: Add badge to campaign cards (20 min)**
```tsx
{/* Add to campaign card, near status badge */}
<div className="flex items-center gap-2 flex-wrap">
  {/* Existing lifecycle status badge */}
  <Badge variant={getStatusVariant(campaign.lifecycleStatus)}>
    {campaign.lifecycleStatus}
  </Badge>

  {/* New funding status badge */}
  <FundingStatusBadge campaign={campaign} />
</div>
```

#### Testing Checklist
- [ ] Badges show correct colors for each status
- [ ] Tooltips display funding amounts
- [ ] Filter buttons work correctly
- [ ] Badges visible on all campaign views (grid/list)
- [ ] Badge icons render properly
- [ ] Hover states work

#### Success Metrics
- Quick visual identification of funding status
- Easy filtering by funding state
- Helpful tooltips with funding details

---

### Task 1.4: Fix Missing PaymentCollectionService Method
**Priority:** 🔴 Critical
**Estimated Time:** 30 minutes
**Dependencies:** None

#### Objectives
- Add `getByRazorpayOrderId()` method to PaymentCollectionService
- Add corresponding repository method
- Fix WebhookController compilation error

#### Files to Modify
- `backend/creatorx-repository/src/main/java/com/creatorx/repository/PaymentOrderRepository.java`
- `backend/creatorx-service/src/main/java/com/creatorx/service/PaymentCollectionService.java`

#### Implementation Steps

**Step 1: Add repository method (10 min)**
```java
// File: PaymentOrderRepository.java
package com.creatorx.repository;

import com.creatorx.repository.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, String> {

    // Existing methods...

    /**
     * Find payment order by Razorpay order ID
     * @param razorpayOrderId The Razorpay order ID
     * @return Optional containing the payment order if found
     */
    Optional<PaymentOrder> findByRazorpayOrderId(String razorpayOrderId);
}
```

**Step 2: Add service method (15 min)**
```java
// File: PaymentCollectionService.java

/**
 * Get payment order by Razorpay order ID
 * Used by webhook controller to identify the payment order
 *
 * @param razorpayOrderId The Razorpay order ID from webhook
 * @return Optional containing the payment order if found
 */
public Optional<PaymentOrder> getByRazorpayOrderId(String razorpayOrderId) {
    log.debug("Fetching payment order for Razorpay order ID: {}", razorpayOrderId);
    return paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId);
}
```

**Step 3: Test and verify (5 min)**
```bash
cd backend
./gradlew :creatorx-api:build
```

#### Testing Checklist
- [ ] Method compiles without errors
- [ ] WebhookController can call the method
- [ ] Repository query works correctly
- [ ] Logs show debug message
- [ ] Returns empty Optional when not found

#### Success Metrics
- WebhookController compilation succeeds
- Webhook can identify payment orders
- No runtime errors

---

### Task 1.5: Add Wallet Balance Widget to Header
**Priority:** 🟡 High
**Estimated Time:** 2 hours
**Dependencies:** None

#### Objectives
- Show wallet balance in dashboard header
- Real-time balance updates
- Click to navigate to payments page
- Loading and error states

#### Files to Modify
- `brand-dashboard/components/layout/header.tsx` (or sidebar)

#### Implementation Steps

**Step 1: Create WalletBalanceWidget component (1.5 hours)**
```tsx
// File: brand-dashboard/components/wallet/wallet-balance-widget.tsx
'use client'

import { Wallet, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { useBrandWallet } from '@/lib/hooks/use-wallet'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
                Error loading wallet
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{error?.message || 'Failed to load wallet balance'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
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
            className={`flex items-center gap-2 px-3 py-2 ${bgColor} rounded-lg border hover:opacity-80 transition-opacity cursor-pointer`}
            onClick={() => router.push('/payments')}
          >
            <Wallet className={`h-4 w-4 ${balanceColor}`} />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span className={`text-sm font-semibold ${balanceColor}`}>
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
```

**Step 2: Add to header layout (30 min)**
```tsx
// File: brand-dashboard/components/layout/header.tsx (or wherever your header is)

import { WalletBalanceWidget } from '@/components/wallet/wallet-balance-widget'

// Add to header, typically in the right section
<div className="flex items-center gap-4">
  {/* Other header items (notifications, profile, etc.) */}

  <WalletBalanceWidget />

  {/* User menu */}
</div>
```

#### Testing Checklist
- [ ] Widget shows in header/sidebar
- [ ] Balance displays correctly
- [ ] Loading skeleton shows during fetch
- [ ] Error state shows on API failure
- [ ] Tooltip shows wallet summary
- [ ] Click navigates to payments page
- [ ] Color changes based on balance threshold
- [ ] Real-time updates after transactions

#### Success Metrics
- Always-visible balance indicator
- Quick access to wallet details
- Visual warning for low balance
- One-click navigation to payments

---

## 📊 Phase 1 Summary

### Total Estimated Time: 14 hours

| Task | Priority | Hours | Status |
|------|----------|-------|--------|
| 1.1 Campaign Details Escrow Status | 🔴 Critical | 3 | ⏳ Pending |
| 1.2 Campaign Creation Funding Flow | 🔴 Critical | 4 | ⏳ Pending |
| 1.3 Campaigns List Status Badges | 🟡 High | 2 | ⏳ Pending |
| 1.4 Fix PaymentCollectionService | 🔴 Critical | 0.5 | ⏳ Pending |
| 1.5 Wallet Balance Widget | 🟡 High | 2 | ⏳ Pending |
| **Testing & Integration** | 🔴 Critical | 2.5 | ⏳ Pending |

### Dependencies Graph
```
1.4 (Fix Service) → 1.1, 1.2, 1.3, 1.5 (All UI tasks can run parallel)
All tasks → Testing
```

### Success Criteria
- ✅ All campaigns show funding status
- ✅ One-click funding from multiple touchpoints
- ✅ Wallet balance always visible
- ✅ Clear guidance for insufficient balance
- ✅ Smooth user journey from creation to funding

---

## 🎨 PHASE 2: UI/UX Enhancements (Week 2-3)

### Task 2.1: Low Balance Notifications
**Priority:** 🟡 High
**Estimated Time:** 6 hours

**Objective:** Alert brands when balance is low

**Implementation:**
1. Add threshold check (< ₹5,000)
2. Show banner on dashboard
3. Add to wallet widget
4. Optional: Email notification

**Files:**
- `brand-dashboard/app/(dashboard)/dashboard/page.tsx`
- `brand-dashboard/components/wallet/low-balance-banner.tsx`

---

### Task 2.2: Transaction Export (CSV/PDF)
**Priority:** 🟢 Medium
**Estimated Time:** 4 hours

**Objective:** Allow brands to export transaction history

**Implementation:**
1. Add export button to payments page
2. Generate CSV with transaction data
3. Optional: PDF generation
4. Download trigger

**Files:**
- `brand-dashboard/app/(dashboard)/payments/page.tsx`
- `brand-dashboard/lib/utils/export.ts`

---

## 💼 PHASE 3: Business Logic Enhancements (Week 3-4)

### Task 3.1: Per-Deliverable Pricing
**Priority:** 🟡 High
**Estimated Time:** 8 hours

**Objective:** Allow custom pricing per deliverable instead of equal split

**Database Changes:**
```sql
-- Migration V55
ALTER TABLE campaign_deliverables
ADD COLUMN payment_amount DECIMAL(15, 2);

UPDATE campaign_deliverables cd
SET payment_amount = c.budget / (
  SELECT COUNT(*) FROM campaign_deliverables
  WHERE campaign_id = cd.campaign_id
)
FROM campaigns c
WHERE cd.campaign_id = c.id;
```

**Backend Changes:**
- Update `CampaignDeliverable` entity
- Modify `calculateDeliverablePayment()` in `DeliverableService`
- Add validation to ensure sum of deliverable payments ≤ campaign budget

**Frontend Changes:**
- Add payment amount input when creating deliverables
- Show per-deliverable pricing in UI
- Add total validation

---

### Task 3.2: Campaign Auto-Refund Scheduler
**Priority:** 🟡 High
**Estimated Time:** 6 hours

**Objective:** Automatically refund unused funds when campaign ends

**Implementation:**
```java
// File: backend/creatorx-service/src/main/java/com/creatorx/service/CampaignRefundScheduler.java

@Service
@RequiredArgsConstructor
public class CampaignRefundScheduler {

    private final CampaignRepository campaignRepository;
    private final BrandWalletService brandWalletService;

    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void refundEndedCampaigns() {
        log.info("Starting auto-refund for ended campaigns");

        LocalDate today = LocalDate.now();
        List<Campaign> endedCampaigns = campaignRepository
            .findByEndDateBeforeAndEscrowStatusIn(
                today,
                List.of(EscrowStatus.FUNDED, EscrowStatus.PARTIAL)
            );

        log.info("Found {} campaigns eligible for refund", endedCampaigns.size());

        for (Campaign campaign : endedCampaigns) {
            try {
                brandWalletService.refundUnusedCampaignFunds(campaign.getId());
                log.info("Refunded campaign: {}", campaign.getId());
            } catch (Exception e) {
                log.error("Failed to refund campaign {}: {}",
                    campaign.getId(), e.getMessage());
            }
        }

        log.info("Auto-refund completed");
    }
}
```

---

## 🔒 PHASE 4: Security & Compliance (Week 5)

### Task 4.1: Rate Limiting
**Priority:** 🔴 Critical
**Estimated Time:** 3 hours

**Objective:** Prevent abuse of payment APIs

**Implementation:** Add rate limiting to wallet endpoints

---

### Task 4.2: Enhanced Audit Logging
**Priority:** 🟡 High
**Estimated Time:** 5 hours

**Objective:** Comprehensive logging for compliance

---

### Task 4.3: Webhook Retry Mechanism
**Priority:** 🟡 High
**Estimated Time:** 8 hours

**Objective:** Handle failed webhooks with automatic retry

---

## 📊 PHASE 5: Analytics (Week 6-7)

### Task 5.1: Payment Analytics Dashboard
**Priority:** 🟢 Medium
**Estimated Time:** 16 hours

**Objective:** New analytics page showing payment metrics

---

### Task 5.2: Campaign ROI Calculator
**Priority:** 🟢 Medium
**Estimated Time:** 10 hours

**Objective:** Show brands their spending efficiency

---

## 🧪 PHASE 6: Testing & QA (Week 7-9)

### Task 6.1: Unit Tests
**Priority:** 🔴 Critical
**Estimated Time:** 20 hours

**Coverage targets:**
- BrandWalletService: 100%
- PaymentCollectionService: 90%
- DeliverableService: 90%
- WebhookController: 100%

---

### Task 6.2: Integration Tests
**Priority:** 🔴 Critical
**Estimated Time:** 16 hours

**Test scenarios:**
- Complete payment flow (deposit → allocate → release → refund)
- Concurrent transactions
- Webhook idempotency
- Error scenarios

---

### Task 6.3: Load Testing
**Priority:** 🟡 High
**Estimated Time:** 12 hours

**Test targets:**
- 100 concurrent wallet operations
- 1000 webhooks/minute
- Database connection pooling
- Response time < 200ms

---

## 📅 Sprint Schedule

### Sprint 1: Foundation (Week 1-2)
**Goal:** Complete Phase 1 - Campaign Integration
**Hours:** 14
**Deliverables:**
- Campaign funding UI
- Wallet balance widget
- Funding status badges
- Service method fixes

### Sprint 2: Enhancements (Week 2-3)
**Goal:** Complete Phase 2 & 3 - UX and Business Logic
**Hours:** 24
**Deliverables:**
- Per-deliverable pricing
- Low balance notifications
- Auto-refund scheduler
- Transaction export

### Sprint 3: Quality (Week 3-5)
**Goal:** Complete Phase 4 & 6 - Security and Testing
**Hours:** 48
**Deliverables:**
- Rate limiting
- Comprehensive tests
- Load testing
- Security audit

### Sprint 4: Analytics (Week 5-7)
**Goal:** Complete Phase 5 - Analytics
**Hours:** 32
**Deliverables:**
- Analytics dashboard
- ROI calculator
- Reporting features

---

## 📈 Success Metrics

### Phase 1 Metrics
- **Adoption Rate:** 80% of new campaigns funded within 24 hours
- **User Satisfaction:** < 3 clicks from creation to funding
- **Balance Visibility:** Widget load time < 100ms
- **Error Rate:** < 1% funding failures

### Overall Metrics (v2.0)
- **Test Coverage:** > 90% on critical paths
- **Performance:** API response < 200ms (p95)
- **Uptime:** 99.9% for payment APIs
- **Concurrency:** Support 100+ simultaneous transactions

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Review this plan** with team
2. **Prioritize tasks** based on business needs
3. **Set up project board** (GitHub Projects, Jira, etc.)
4. **Assign tasks** to developers
5. **Start with Phase 1, Task 1.1**

### Daily Workflow

1. Check task list for current sprint
2. Read task objectives and implementation steps
3. Create feature branch: `feature/task-1-1-escrow-status`
4. Implement following code snippets
5. Test using provided checklist
6. Create PR and request review
7. Mark task complete, move to next

---

## 📞 Support & Resources

### Documentation
- [BRAND_WALLET_IMPLEMENTATION.md](./BRAND_WALLET_IMPLEMENTATION.md) - Architecture
- [WALLET_SYSTEM_COMPLETE.md](./WALLET_SYSTEM_COMPLETE.md) - API reference
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - High-level roadmap

### Code Review Checklist
- [ ] Follows existing code patterns
- [ ] All tests passing
- [ ] No hardcoded values
- [ ] Error handling complete
- [ ] TypeScript types defined
- [ ] Comments for complex logic
- [ ] Performance considered
- [ ] Security reviewed

---

**Last Updated:** February 11, 2026
**Version:** 1.0
**Status:** Ready for Execution
**Next Review:** After Phase 1 completion
