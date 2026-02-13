# Brand Wallet System Implementation

## Overview
Centralized brand wallet escrow system where brands deposit money first, then allocate funds to campaigns. Payments are automatically released to creators when deliverables are approved.

**Status:** Fully implemented (backend + frontend + API integration)
**Last Updated:** February 13, 2026

---

## Architecture

### Database Schema (3 migrations)

| Migration | Tables |
|-----------|--------|
| V5 | `wallets`, `transactions`, `bank_accounts`, `withdrawal_requests` (creator side) |
| V34 | `payment_orders`, `payment_methods`, `webhook_events` (Razorpay integration) |
| V54 | `brand_wallets`, `escrow_transactions`, campaign escrow columns (brand side) |

### Backend Stack

```
Entity Layer
  BrandWallet, Wallet, PaymentOrder, PaymentMethod,
  EscrowTransaction, Transaction, WithdrawalRequest, BankAccount, WebhookEvent

Repository Layer (all with pessimistic locking)
  BrandWalletRepository, WalletRepository, PaymentOrderRepository,
  PaymentMethodRepository, EscrowTransactionRepository, TransactionRepository

Service Layer
  BrandWalletService     - Brand deposits, allocations, releases, refunds
  WalletService          - Creator wallet, platform fee deduction
  PaymentCollectionService - Razorpay order lifecycle
  PaymentMethodService   - Tokenized card management (PCI-compliant)
  EscrowService          - Campaign fund tracking
  RazorpayService        - Payout creation, bank verification
  RazorpayWebhookVerifier - HMAC-SHA256 signature verification

Controller Layer
  BrandWalletController  - GET/POST /api/v1/brand-wallet/*
  WalletController       - GET/POST /api/v1/wallet/* (creator + bank accounts + payment methods)
  PaymentOrderController - POST /api/v1/payments/orders
  WebhookController      - POST /api/v1/webhooks/razorpay
```

### Frontend Stack

```
API Layer
  lib/api/wallet.ts      - Brand wallet API calls (getBrandWallet, createDepositOrder, allocateToCampaign, etc.)
  lib/api/payments.ts    - Creator wallet API calls (getWallet, getTransactions)

Hooks
  lib/hooks/use-wallet.ts    - useBrandWallet, useWalletTransactions, useCreateDepositOrder, useAllocateToCampaign
  lib/hooks/use-payments.ts  - useTransactions (creator side, used by dashboard/profile)

Pages
  app/(dashboard)/payments/page.tsx              - Deposit funds, Razorpay checkout, transaction history, CSV export
  app/(dashboard)/dashboard/page.tsx             - Low balance notification banner (< ₹5,000 threshold)
  app/(dashboard)/campaigns/page.tsx             - Campaign list with FundingStatusBadge per row
  app/(dashboard)/campaigns/new/page.tsx         - Post-creation funding dialog (fund now / add funds / skip)
  app/(dashboard)/campaigns/[id]/page.tsx        - Campaign detail/overview (escrow banners, stat cards, sub-page nav)
  app/(dashboard)/campaigns/[id]/applications/   - Escrow status banners (UNFUNDED/FUNDED/PARTIAL) + fund button

Components
  components/wallet/wallet-balance-widget.tsx     - Header widget (balance, color-coded, click to payments)
  components/campaigns/funding-status-badge.tsx   - Reusable badge (FUNDED/UNFUNDED/PARTIAL/RELEASED/REFUNDED)

Types
  lib/types/index.ts     - EscrowStatus enum, Campaign type with escrowAllocated/escrowReleased/escrowStatus
```

---

## Payment Flow

### 1. Brand Deposits Money
```
Brand → /payments page → "Add Funds" → POST /api/v1/brand-wallet/deposit
  → Razorpay order created → Razorpay Checkout opens → Brand pays
  → Webhook: payment.captured → BrandWalletService.creditWalletFromPayment()
  → brand_wallets.balance += amount, escrow_transactions: DEPOSIT
```

### 2. Brand Funds Campaign
```
Brand → Campaign page → "Fund Campaign" → POST /api/v1/brand-wallet/campaigns/{id}/allocate
  → BrandWalletService.allocateToCampaign()
  → brand_wallets.balance -= amount, campaigns.escrow_allocated += amount
  → campaigns.escrow_status → FUNDED/PARTIAL, escrow_transactions: ALLOCATION
```

### 3. Creator Delivers & Gets Paid
```
Creator submits deliverable → Brand approves
  → DeliverableService.reviewDeliverable(APPROVED)
  → BrandWalletService.releaseToCreator() → 10% platform fee deducted
  → Creator wallet.balance += 90%, campaigns.escrow_released += 100%
  → escrow_transactions: RELEASE, transactions: EARNING
```

### 4. Creator Withdraws
```
Creator → POST /api/v1/wallet/withdraw → RazorpayService.createPayout()
  → Bank verification (penny drop) → Razorpay payout created
  → Webhook: payout.processed → withdrawal status COMPLETED, UTR recorded
  → If payout.failed → wallet refunded (idempotent via refundedAt timestamp)
```

---

## Security

- Pessimistic locking on all wallet mutations (prevents race conditions)
- HMAC-SHA256 webhook signature verification (constant-time comparison)
- WebhookEvent deduplication (unique constraint on webhook_id)
- Idempotency keys on payment orders (SHA256 of brand+amount+campaign+timestamp)
- Database constraints: `balance >= 0`, `balance = deposited - allocated`, `released <= allocated`
- PCI-compliant card storage (Razorpay tokens only, never raw card numbers)
- Role-based access: `@PreAuthorize("hasRole('BRAND')")` / `@PreAuthorize("hasRole('CREATOR')")`
- Withdrawal limits: min 100, max 50K per tx, max 2L per month

---

## Environment Variables

### Backend (Railway)
```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
RAZORPAY_PAYOUT_MODE=test
RAZORPAY_ACCOUNT_NUMBER=xxx
WITHDRAWAL_MIN_AMOUNT=100.00
WITHDRAWAL_MAX_PER_TX=50000.00
WITHDRAWAL_MAX_PER_MONTH=200000.00
```

### Frontend (Vercel)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

---

## Known Limitations

1. ~~Per-Deliverable Pricing~~ - **Fixed:** `price` column on `campaign_deliverables` with equal-split fallback
2. ~~No Auto-Refund Scheduler~~ - **Fixed:** `CampaignCompletionScheduler` runs daily at 1 AM
3. ~~Platform Fee Hardcoded~~ - **Fixed:** Configurable via `platform_settings` table (default 10%, seeded via V56)
4. **INR Only** - No multi-currency support
5. ~~No Campaign Detail Page~~ - **Fixed:** Campaign detail page now exists at `/campaigns/[id]`
