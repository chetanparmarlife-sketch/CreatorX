# CreatorX Wallet System - Implementation Plan

**Last Updated:** February 12, 2026
**Current Phase:** Phase 1 complete, ready for Phase 2

---

## Current Status

### Phase 1: Campaign Integration - COMPLETE

All wallet-to-campaign integration is live and deployed.

| Task | What was built | Status |
| --- | --- | --- |
| Escrow status in API | Added `escrowAllocated`, `escrowReleased`, `escrowStatus` to CampaignDTO + mapper | Done |
| Campaign list badges | `FundingStatusBadge` component rendered on every campaign row | Done |
| Campaign creation funding | Post-creation dialog: fund now / add funds / skip | Done |
| Campaign applications escrow | UNFUNDED/FUNDED/PARTIAL banners + "Fund Campaign" button | Done |
| Wallet balance widget | Color-coded balance in dashboard header, click to payments | Done |
| Payments page | Razorpay checkout, deposit flow, transaction history | Done |
| Wallet hooks & API | `useBrandWallet`, `useAllocateToCampaign`, `useCreateDepositOrder`, etc. | Done |
| PaymentCollectionService | `getByRazorpayOrderId()` exists in repo + service | Done |
| Backend services | BrandWalletService, WalletService, PaymentCollectionService, RazorpayService | Done |
| Webhook handling | payment.captured, payout.processed/failed/reversed, fund_account.validation | Done |
| TypeScript types | `EscrowStatus` enum, Campaign type with escrow fields | Done |
| .env.example | `NEXT_PUBLIC_RAZORPAY_KEY_ID` added | Done |

### Production Checklist

- [x] Backend deployed to Railway
- [x] Frontend deployed to Vercel
- [x] Database migrations V5, V34, V54 applied
- [x] CampaignDTO exposes escrow fields (commit 7ca4d2d)
- [ ] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to Vercel environment variables
- [ ] Configure Razorpay webhook URL to point to production
- [ ] Test full deposit flow in production
- [ ] Test full allocation flow in production

---

## Broken User Flow: Missing Campaign Detail Page

**Priority: HIGH** - This is the most impactful issue right now.

Multiple existing flows route to `/campaigns/[id]` which **does not exist**:

- Campaign list "Open" button → `/campaigns/${campaign.id}` → 404
- Post-creation funding dialog "View Campaign" → 404
- Post-creation funding dialog "Fund Later" → 404
- Save draft → `/campaigns/${created.id}` → 404

Sub-pages exist (`/campaigns/[id]/applications`, `/campaigns/[id]/deliverables`, `/campaigns/[id]/analytics`) but the main detail page is missing.

**Options:**
1. Create a proper campaign detail/overview page at `campaigns/[id]/page.tsx`
2. Redirect `/campaigns/[id]` to `/campaigns/[id]/applications` (quick fix)

---

## Next Phases

### Phase 2: UX Polish

| Task | Description | Effort |
| --- | --- | --- |
| Campaign detail page | Fix the broken `/campaigns/[id]` route (see above) | Medium |
| Low balance notifications | Banner on dashboard when balance < threshold | Small |
| Transaction export | CSV download from payments page | Small |

### Phase 3: Business Logic

| Task | Description | Effort |
| --- | --- | --- |
| Per-deliverable pricing | Custom payment amounts per deliverable instead of equal split (needs migration V55) | Large |
| Auto-refund scheduler | `@Scheduled` job to refund unused funds when campaigns end | Medium |
| Configurable platform fee | Move 10% commission from hardcoded to settings table | Small |

### Phase 4: Security & Reliability

| Task | Description | Effort |
| --- | --- | --- |
| Rate limiting | Throttle payment API endpoints | Small |
| Webhook retry mechanism | Handle transient failures with backoff | Medium |
| Enhanced audit logging | Structured logs for compliance | Medium |

### Phase 5: Analytics

| Task | Description | Effort |
| --- | --- | --- |
| Payment analytics page | Charts for spend, deposits, releases over time | Large |
| Campaign ROI calculator | Cost-per-deliverable, cost-per-creator metrics | Medium |

### Phase 6: Testing

| Task | Description | Effort |
| --- | --- | --- |
| Unit tests | BrandWalletService, WalletService, WebhookController | Large |
| Integration tests | Full deposit → allocate → release → refund cycle | Large |
| Load testing | 100 concurrent wallet ops, 1000 webhooks/min | Medium |

---

## Recommended Next Move

**Fix the broken campaign detail route**, then move to Phase 2 UX polish.

The campaign detail page is the central hub of the brand experience. Every campaign-related flow (list, creation, funding) tries to navigate there and currently hits a 404. This should be resolved before building new features.

After that, the highest-value work is Phase 3 (per-deliverable pricing + auto-refund scheduler) since those are real business logic gaps. Security (Phase 4) and testing (Phase 6) can be interleaved.

---

## File Reference

### Backend (key files)

```
backend/creatorx-api/src/main/resources/db/migration/
  V5__create_wallet_and_transactions.sql
  V34__create_payment_orders.sql
  V54__create_brand_wallets.sql

backend/creatorx-repository/src/main/java/com/creatorx/repository/
  BrandWalletRepository.java
  EscrowTransactionRepository.java
  PaymentOrderRepository.java
  WalletRepository.java
  entity/BrandWallet.java
  entity/EscrowTransaction.java
  entity/PaymentOrder.java
  entity/Wallet.java

backend/creatorx-service/src/main/java/com/creatorx/service/
  BrandWalletService.java
  WalletService.java
  PaymentCollectionService.java
  EscrowService.java
  razorpay/RazorpayService.java
  razorpay/RazorpayWebhookVerifier.java
  dto/CampaignDTO.java (escrow fields added Feb 12)
  mapper/CampaignMapper.java (escrow ignore on write-back)

backend/creatorx-api/src/main/java/com/creatorx/api/controller/
  BrandWalletController.java
  WalletController.java
  PaymentOrderController.java
  WebhookController.java
```

### Frontend (key files)

```
brand-dashboard/lib/api/wallet.ts
brand-dashboard/lib/hooks/use-wallet.ts
brand-dashboard/lib/types/index.ts (EscrowStatus enum)
brand-dashboard/app/(dashboard)/payments/page.tsx
brand-dashboard/app/(dashboard)/campaigns/page.tsx (FundingStatusBadge)
brand-dashboard/app/(dashboard)/campaigns/new/page.tsx (funding dialog)
brand-dashboard/app/(dashboard)/campaigns/[id]/applications/page.tsx (escrow banners)
brand-dashboard/components/wallet/wallet-balance-widget.tsx
brand-dashboard/components/campaigns/funding-status-badge.tsx
brand-dashboard/components/layout/header.tsx (wallet widget)
```
