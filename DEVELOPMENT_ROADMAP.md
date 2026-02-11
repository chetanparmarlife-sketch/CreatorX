# 🗺️ CreatorX Development Roadmap

## Current Status
✅ **Brand Wallet System** - Complete (ready for commit & push)
✅ **Backend Compilation** - Success
✅ **Frontend Implementation** - Complete
📦 **Ready for:** Git commit, push to production (Railway/Vercel)

---

## 🚀 Phase 1: Campaign Funding Integration (High Priority)

### 1.1 Campaign Details Page - Show Escrow Status
**Location:** `brand-dashboard/app/(dashboard)/campaigns/[id]/page.tsx`

**Add:**
```tsx
{/* Escrow Status Banner */}
{campaign.escrowStatus === 'UNFUNDED' && (
  <Alert className="border-orange-200 bg-orange-50">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Campaign Not Funded</AlertTitle>
    <AlertDescription>
      This campaign needs {formatCurrency(campaign.budget)} to be activated.
      <Button onClick={handleFundCampaign}>Fund Campaign</Button>
    </AlertDescription>
  </Alert>
)}

{campaign.escrowStatus === 'FUNDED' && (
  <Card className="bg-green-50 border-green-200">
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <div>
        <p className="font-semibold">Campaign Funded</p>
        <p className="text-sm">
          Allocated: {formatCurrency(campaign.escrowAllocated)} •
          Released: {formatCurrency(campaign.escrowReleased)}
        </p>
      </div>
    </div>
  </Card>
)}
```

**Estimate:** 2-3 hours

---

### 1.2 Campaign Creation Flow - Post-Creation Funding
**Location:** `brand-dashboard/app/(dashboard)/campaigns/new/page.tsx`

**After campaign creation, show funding dialog:**
```tsx
const [showFundDialog, setShowFundDialog] = useState(false)
const [createdCampaign, setCreatedCampaign] = useState(null)

// In onSubmit after successful creation:
const campaign = await createCampaign.mutateAsync(data)
setCreatedCampaign(campaign)

// Check wallet balance
const wallet = await getBrandWallet()
if (wallet.balance >= campaign.budget) {
  setShowFundDialog(true) // Show allocation dialog
} else {
  // Redirect to payments page
  router.push('/payments?message=add_funds&campaign=' + campaign.id)
}
```

**Estimate:** 3-4 hours

---

### 1.3 Campaigns List - Show Funding Status
**Location:** `brand-dashboard/app/(dashboard)/campaigns/page.tsx`

**Add status badges:**
```tsx
<Badge
  className={
    campaign.escrowStatus === 'FUNDED'
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800'
  }
>
  {campaign.escrowStatus === 'FUNDED' ? '💰 Funded' : '⚠️ Needs Funding'}
</Badge>
```

**Estimate:** 1-2 hours

---

## 🎨 Phase 2: UI/UX Enhancements (Medium Priority)

### 2.1 Wallet Balance Widget (Sidebar/Header)
**Location:** `brand-dashboard/components/layout/header.tsx`

**Add persistent wallet display:**
```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
  <Wallet className="h-4 w-4 text-purple-600" />
  <span className="text-sm font-medium">
    {formatCurrency(wallet.balance)}
  </span>
</div>
```

**Estimate:** 2 hours

---

### 2.2 Low Balance Notifications
**Feature:** Notify brand when wallet balance is low

**Implementation:**
- Add threshold check (e.g., < ₹5,000)
- Show banner on dashboard
- Optional: Email notification

**Estimate:** 4-6 hours

---

### 2.3 Transaction Export (CSV/PDF)
**Location:** `brand-dashboard/app/(dashboard)/payments/page.tsx`

**Add export button:**
```tsx
<Button onClick={handleExportTransactions}>
  <Download className="mr-2 h-4 w-4" />
  Export CSV
</Button>
```

**Estimate:** 3-4 hours

---

## 💼 Phase 3: Business Logic Enhancements (Medium Priority)

### 3.1 Per-Deliverable Pricing
**Current:** Budget divided equally among deliverables
**Needed:** Custom price per deliverable

**Changes:**
1. Add `payment_amount` column to `campaign_deliverables`
2. Update `CampaignDeliverable` entity
3. Update UI to set custom prices
4. Update `calculateDeliverablePayment()` method

**Estimate:** 6-8 hours

---

### 3.2 Manual Payment Release
**Current:** Automatic release on approval
**Needed:** Optional manual approval step

**Changes:**
1. Add `payment_status` to deliverable submissions
2. Add "Release Payment" button for brands
3. Create `DeliverablePaymentController`
4. Update `DeliverableService`

**Estimate:** 6-8 hours

---

### 3.3 Campaign End Auto-Refund
**Current:** Manual trigger needed
**Needed:** Scheduled job to refund unused funds

**Implementation:**
```java
@Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
public void refundEndedCampaigns() {
    List<Campaign> endedCampaigns = campaignRepository
        .findByEndDateBeforeAndEscrowStatusNot(
            LocalDate.now(),
            EscrowStatus.REFUNDED
        );

    for (Campaign campaign : endedCampaigns) {
        brandWalletService.refundUnusedCampaignFunds(campaign.getId());
    }
}
```

**Estimate:** 4-6 hours

---

## 🔒 Phase 4: Security & Compliance (High Priority)

### 4.1 Rate Limiting for Payment APIs
**Add rate limiting to prevent abuse:**
```java
@RateLimit(requests = 10, per = "1m")
@PostMapping("/wallet/deposit")
public ResponseEntity<PaymentOrderDTO> createDepositOrder(...) {
    // ...
}
```

**Estimate:** 2-3 hours

---

### 4.2 Payment Audit Logging
**Enhanced logging for compliance:**
```java
@Aspect
public class PaymentAuditAspect {
    @After("execution(* BrandWalletService.*(..))")
    public void logPaymentOperation(JoinPoint joinPoint) {
        // Log to separate audit table
    }
}
```

**Estimate:** 4-5 hours

---

### 4.3 Webhook Retry Mechanism
**Handle failed webhooks:**
```java
@Scheduled(fixedDelay = 300000) // Every 5 minutes
public void retryFailedWebhooks() {
    List<WebhookEvent> failed = webhookEventRepository
        .findByStatusAndCreatedAtAfter(
            WebhookStatus.FAILED,
            LocalDateTime.now().minusHours(24)
        );

    for (WebhookEvent event : failed) {
        processWebhook(event);
    }
}
```

**Estimate:** 6-8 hours

---

## 📊 Phase 5: Analytics & Reporting (Low Priority)

### 5.1 Payment Analytics Dashboard
**New page:** `/payments/analytics`

**Metrics:**
- Total deposits vs spending
- Average campaign funding
- Platform fee collected
- Monthly transaction volume
- Payment method breakdown

**Estimate:** 12-16 hours

---

### 5.2 Campaign ROI Calculator
**Show brands their spending efficiency:**
- Money spent per deliverable
- Creator payout breakdown
- Platform fee impact
- Unused funds recovered

**Estimate:** 8-10 hours

---

## 🌍 Phase 6: Advanced Features (Future)

### 6.1 Multi-Currency Support
**Support USD, EUR, etc.**
- Add currency conversion API
- Update all payment calculations
- UI currency selector

**Estimate:** 20-30 hours

---

### 6.2 Subscription Plans for Brands
**Recurring payments:**
- Monthly credits system
- Auto-reload when balance low
- Volume discounts

**Estimate:** 30-40 hours

---

### 6.3 Payment Scheduling
**Schedule future payments:**
- Delayed releases
- Milestone-based payments
- Recurring payouts

**Estimate:** 25-35 hours

---

## 🧪 Phase 7: Testing & Quality Assurance

### 7.1 Unit Tests
**Coverage needed:**
- BrandWalletService (all methods)
- PaymentCollectionService
- DeliverableService payment logic
- WebhookController routing

**Estimate:** 16-20 hours

---

### 7.2 Integration Tests
**E2E payment flows:**
- Deposit → Allocate → Release → Refund
- Webhook processing
- Concurrent transactions
- Idempotency

**Estimate:** 12-16 hours

---

### 7.3 Load Testing
**Test scalability:**
- 100 concurrent payments
- 1000 webhooks/minute
- Database connection pooling
- Cache performance

**Estimate:** 8-12 hours

---

## 📱 Phase 8: Creator App Integration

### 8.1 Real-time Payment Notifications
**Push notifications when paid:**
- FCM/OneSignal integration
- In-app notification center
- Email notifications

**Estimate:** 10-12 hours

---

### 8.2 Earnings Dashboard
**Enhanced creator wallet UI:**
- Earnings breakdown per campaign
- Payment history with campaign details
- Upcoming payments
- Tax documents

**Estimate:** 12-16 hours

---

## 🔧 Technical Debt & Improvements

### Priority Fixes

#### 1. Add Missing Method to PaymentCollectionService
**Issue:** `getByRazorpayOrderId()` called but doesn't exist

**Fix:**
```java
public Optional<PaymentOrder> getByRazorpayOrderId(String razorpayOrderId) {
    return paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId);
}
```

**Estimate:** 30 minutes

---

#### 2. Campaign Service - Check Wallet Before Creation
**Prevent unfunded campaigns:**
```java
@Transactional
public Campaign createCampaign(CreateCampaignRequest request, String brandId) {
    // Check wallet balance
    BrandWallet wallet = brandWalletRepository.findByBrandId(brandId)
        .orElseThrow(() -> new BusinessException("Please add funds first"));

    if (wallet.getBalance().compareTo(request.getBudget()) < 0) {
        throw new BusinessException(
            "Insufficient wallet balance. " +
            "Available: ₹" + wallet.getBalance() +
            ", Required: ₹" + request.getBudget()
        );
    }

    // ... rest of creation logic
}
```

**Estimate:** 2-3 hours

---

#### 3. Error Handling Improvements
**Better error messages for users:**
```java
@ExceptionHandler(InsufficientBalanceException.class)
public ResponseEntity<ErrorResponse> handleInsufficientBalance(
    InsufficientBalanceException e
) {
    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
        .body(new ErrorResponse(
            "INSUFFICIENT_BALANCE",
            e.getMessage(),
            Map.of(
                "available", e.getAvailable(),
                "required", e.getRequired(),
                "shortfall", e.getShortfall()
            )
        ));
}
```

**Estimate:** 4-6 hours

---

## 📋 Immediate Next Steps (Priority Order)

### Before Deployment
1. ✅ **Commit & Push** - Brand wallet system code
2. ⏳ **Database Migration** - Ensure V54 runs on production
3. ⏳ **Environment Variables** - Set Razorpay keys on Railway/Vercel
4. ⏳ **Webhook URL** - Configure on Razorpay dashboard

### Week 1 (High Priority)
1. Campaign details page escrow status (3 hours)
2. Campaign creation funding flow (4 hours)
3. Campaigns list funding badges (2 hours)
4. Add `getByRazorpayOrderId()` method (30 min)
5. Basic testing - deposit & allocation (4 hours)

**Total: ~14 hours**

### Week 2 (Medium Priority)
1. Per-deliverable pricing (8 hours)
2. Low balance notifications (6 hours)
3. Campaign end auto-refund (6 hours)
4. Transaction export CSV (4 hours)

**Total: ~24 hours**

### Week 3 (Testing & Polish)
1. Unit tests for wallet service (12 hours)
2. Integration tests (12 hours)
3. UI/UX polish (8 hours)
4. Bug fixes (8 hours)

**Total: ~40 hours**

---

## 🎯 Sprint Planning

### Sprint 1: Core Integration (2 weeks)
- Campaign funding UI
- Wallet balance checks
- Payment flow improvements
- Basic testing

### Sprint 2: Enhancements (2 weeks)
- Per-deliverable pricing
- Auto-refund scheduler
- Analytics dashboard
- Export features

### Sprint 3: Quality & Scale (2 weeks)
- Comprehensive testing
- Performance optimization
- Security hardening
- Documentation updates

---

## 💰 Estimated Development Time

| Phase | Hours | Days (8h/day) |
|-------|-------|---------------|
| Campaign Integration | 14 | 1.75 |
| UI/UX Enhancements | 24 | 3 |
| Business Logic | 40 | 5 |
| Security | 24 | 3 |
| Analytics | 32 | 4 |
| Testing | 48 | 6 |
| **Total** | **182** | **~23 days** |

---

## 🚦 Release Strategy

### v1.0 - Basic Wallet (Current)
- ✅ Wallet deposits
- ✅ Campaign allocation
- ✅ Payment release
- ✅ Transaction history

### v1.1 - Campaign Integration (Week 1-2)
- Campaign funding UI
- Escrow status badges
- Balance checks
- Basic notifications

### v1.2 - Enhancements (Week 3-4)
- Per-deliverable pricing
- Manual payment approval
- Auto-refund
- Export features

### v1.3 - Analytics (Week 5-6)
- Payment analytics
- ROI calculator
- Enhanced reporting

### v2.0 - Advanced (Month 2-3)
- Multi-currency
- Subscription plans
- Scheduled payments

---

## 📞 Support & Resources

**Documentation:**
- [BRAND_WALLET_IMPLEMENTATION.md](./BRAND_WALLET_IMPLEMENTATION.md) - Architecture
- [WALLET_SYSTEM_COMPLETE.md](./WALLET_SYSTEM_COMPLETE.md) - API reference
- [QUICK_START_WALLET.md](./QUICK_START_WALLET.md) - Quick start guide

**Code Review Checklist:**
- [ ] All tests passing
- [ ] No hardcoded credentials
- [ ] Error handling complete
- [ ] Logging adequate
- [ ] Documentation updated

---

**Last Updated:** February 11, 2026
**Status:** Brand Wallet v1.0 Complete ✅
**Next Milestone:** Campaign Integration (v1.1)
