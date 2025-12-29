# ADR-004: Use Razorpay for Payment Processing

## Status
Accepted

## Context
CreatorX needs a payment gateway for processing creator payouts and brand payments. Options considered:
- **Razorpay**: India-focused, good mobile SDK
- **Stripe**: Global, excellent API but higher fees in India
- **PayPal**: Global but limited in India
- **Custom solution**: Too complex and risky

## Decision
We will use **Razorpay** for payment processing.

## Rationale

### 1. India-Focused
- **UPI support**: Native UPI integration
- **Local payment methods**: Net banking, wallets, cards
- **Compliance**: PCI-DSS compliant, RBI approved

### 2. Developer Experience
- **Excellent API**: Well-documented REST API
- **Mobile SDKs**: React Native SDK available
- **Webhooks**: Reliable webhook system
- **Dashboard**: Comprehensive merchant dashboard

### 3. Cost
- **Competitive fees**: Lower than Stripe for Indian transactions
- **No setup fees**: Free to start
- **Transparent pricing**: Clear fee structure

### 4. Features
- **Payouts API**: Direct bank transfers to creators
- **Refunds**: Easy refund processing
- **Subscriptions**: Support for recurring payments
- **International**: Support for international cards

## Consequences

### Positive
- ✅ **India-optimized**: Best support for Indian payment methods
- ✅ **Easy integration**: Well-documented API and SDKs
- ✅ **Cost-effective**: Lower fees for Indian transactions
- ✅ **Compliance**: Meets Indian regulatory requirements

### Negative
- ⚠️ **India-focused**: Limited international support
- ⚠️ **Vendor dependency**: Relies on Razorpay service
- ⚠️ **Migration complexity**: Moving away would require refactoring

### Mitigation
- Abstract payment logic in service layer
- Support multiple payment gateways in future if needed
- Keep payment data in our database for audit

## Implementation Details

### Payment Flow
1. Brand creates campaign with budget
2. Creator completes deliverables
3. Brand approves deliverables
4. System creates payout via Razorpay
5. Creator receives funds in bank account

### Integration Points
- **Payouts API**: For creator withdrawals
- **Webhooks**: For payment status updates
- **Refunds API**: For dispute resolution

## Alternatives Considered
1. **Stripe**: Better global support but higher fees in India (rejected)
2. **PayPal**: Limited in India, poor mobile experience (rejected)
3. **Custom solution**: Too risky and time-consuming (rejected)

## References
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Payouts API](https://razorpay.com/docs/payouts/)
- [Razorpay React Native SDK](https://github.com/razorpay/react-native-razorpay)

