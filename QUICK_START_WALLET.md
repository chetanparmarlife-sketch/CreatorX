# 🚀 Quick Start: Brand Wallet System

## Prerequisites
- ✅ Backend compiles successfully
- ✅ Database running (PostgreSQL)
- ✅ Razorpay test account credentials

---

## Step 1: Configure Environment (2 minutes)

### Backend
Already configured in `application.properties` ✓

### Frontend
Create `brand-dashboard/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## Step 2: Start Backend (1 minute)

```bash
cd backend
./gradlew :creatorx-api:bootRun
```

**Wait for:**
```
✓ Flyway migration V54 completed
✓ Started CreatorxApiApplication
```

---

## Step 3: Start Frontend (1 minute)

```bash
cd brand-dashboard
npm run dev
```

**Open:** http://localhost:3000

---

## Step 4: Test Payment Flow (5 minutes)

### 1. Login as Brand
```
Email: test-brand@example.com
Password: your_password
```

### 2. Navigate to Payments
```
Click "Payments" in sidebar
OR go to: http://localhost:3000/payments
```

### 3. Add Funds
```
1. Click "Add Funds" button
2. Enter: ₹10,000
3. Click "Pay ₹10,000"
4. Razorpay checkout opens
```

### 4. Complete Test Payment
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Click "Pay"
```

### 5. Verify Success
```
✓ Payment modal closes
✓ Wait 2-3 seconds
✓ Balance shows ₹10,000
✓ Transaction appears in history
```

---

## What You'll See

### Payments Page
- **Available Balance:** ₹10,000
- **Total Deposited:** ₹10,000
- **Allocated:** ₹0
- **Released:** ₹0

### Transaction History
```
┌─────────────────────────────────────────────────────┐
│ Wallet deposit via Razorpay: pay_xxxxx             │
│ Feb 11, 2026, 10:30 AM                   +₹10,000  │
│ Type: DEPOSIT         Balance: ₹10,000             │
└─────────────────────────────────────────────────────┘
```

---

## Next Steps

### Create a Campaign
```bash
1. Go to /campaigns/new
2. Fill in campaign details
3. Set budget: ₹5,000
4. Create campaign
5. Allocate ₹5,000 from wallet
```

### Verify Allocation
```bash
1. Return to /payments
2. Balance: ₹5,000 (₹10k - ₹5k)
3. Allocated: ₹5,000
4. New transaction: "Allocated to campaign: [name]"
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process if needed
taskkill /PID <process_id> /F

# Restart backend
./gradlew :creatorx-api:bootRun
```

### Migration Fails
```bash
# Check database connection
psql -d creatorx

# If tables already exist, drop them
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS brand_wallets CASCADE;

# Restart backend (migration will re-run)
```

### Frontend Can't Connect
```bash
# Verify backend is running
curl http://localhost:8080/api/v1/health

# Check .env.local exists
cat .env.local

# Restart frontend
npm run dev
```

### Razorpay Not Loading
```bash
# Check internet connection
# Check browser console for errors
# Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set
echo $NEXT_PUBLIC_RAZORPAY_KEY_ID
```

---

## Success Indicators ✅

- [ ] Backend starts without errors
- [ ] Migration V54 completes
- [ ] Frontend loads payments page
- [ ] "Add Funds" button visible
- [ ] Razorpay checkout opens
- [ ] Payment succeeds
- [ ] Balance updates to ₹10,000
- [ ] Transaction appears in history

---

## Common Issues

**"Payment order creation failed"**
- Check Razorpay credentials
- Verify API key in .env.local
- Check backend logs

**"Wallet balance not updating"**
- Wait 3-5 seconds
- Refresh page
- Check backend logs for webhook

**"Razorpay SDK not loaded"**
- Check internet connection
- Wait for script to load
- Try hard refresh (Ctrl+Shift+R)

---

## Testing Tips

1. **Use Test Mode:** Always use `rzp_test_` keys
2. **Check Logs:** Backend console shows all webhook events
3. **Browser DevTools:** Network tab shows API calls
4. **Database:** Query directly to verify data

```sql
-- Check wallet balance
SELECT * FROM brand_wallets;

-- Check transactions
SELECT * FROM escrow_transactions ORDER BY created_at DESC;

-- Check campaign escrow
SELECT id, title, escrow_allocated, escrow_released, escrow_status
FROM campaigns;
```

---

## Time to Complete
- **Setup:** 5 minutes
- **First Payment:** 2 minutes
- **Total:** ~7 minutes

---

## Need Help?
- Check logs: `backend/logs/application.log`
- See full docs: `WALLET_SYSTEM_COMPLETE.md`
- Implementation details: `BRAND_WALLET_IMPLEMENTATION.md`

---

**Ready to go! 🎉**
Start backend → Start frontend → Test payment → Done!
