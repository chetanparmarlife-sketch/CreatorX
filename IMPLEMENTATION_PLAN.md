# CreatorX Wallet System - Implementation Plan

**Last Updated:** February 12, 2026
**Current Phase:** Phase 2 complete, ready for Phase 3

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

### Phase 2: UX Polish - COMPLETE

| Task | What was built | Status |
| --- | --- | --- |
| Campaign detail page | Full overview page at `campaigns/[id]/page.tsx` — breadcrumb, header, escrow banners, stat cards, details, sub-page nav | Done |
| Low balance notifications | Amber banner on dashboard when wallet balance < ₹5,000 with "Add funds" link to payments | Done |
| Transaction export | "Export CSV" button on payments page Transaction History section | Done |

---

## Next Phases

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

**Phase 3: Business Logic** — per-deliverable pricing + auto-refund scheduler.

These are real business logic gaps. Per-deliverable pricing lets brands assign custom payment amounts to each deliverable instead of equal splits (needs migration V55). The auto-refund scheduler reclaims unused campaign funds automatically when campaigns end.

Security (Phase 4) and testing (Phase 6) can be interleaved with Phase 3.

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
brand-dashboard/app/(dashboard)/campaigns/[id]/page.tsx (campaign detail/overview)
brand-dashboard/app/(dashboard)/campaigns/[id]/applications/page.tsx (escrow banners)
brand-dashboard/app/(dashboard)/dashboard/page.tsx (low balance banner)
brand-dashboard/components/wallet/wallet-balance-widget.tsx
brand-dashboard/components/campaigns/funding-status-badge.tsx
brand-dashboard/components/layout/header.tsx (wallet widget)
```
