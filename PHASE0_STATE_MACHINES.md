# CreatorX Phase 0 State Machines & Invariants

Scope: Mobile app flows (Creator/Brand) plus Admin overrides. States reflect backend enums where available.

## Campaign Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `DRAFT` | `PENDING_REVIEW`, `ACTIVE`, `CANCELLED` | Brand, Admin | `CAMPAIGN_CREATED`, `CAMPAIGN_STATUS_CHANGED` |
| `PENDING_REVIEW` | `ACTIVE`, `DRAFT`, `CANCELLED` | Admin | `CAMPAIGN_SUBMITTED_FOR_REVIEW`, `CAMPAIGN_APPROVED`, `CAMPAIGN_REJECTED` |
| `ACTIVE` | `PAUSED`, `COMPLETED`, `CANCELLED` | Brand, Admin, System | `CAMPAIGN_LAUNCHED`, `CAMPAIGN_STATUS_CHANGED` |
| `PAUSED` | `ACTIVE`, `CANCELLED` | Brand, Admin | `CAMPAIGN_STATUS_CHANGED` |
| `COMPLETED` | None (terminal) | System, Admin | `CAMPAIGN_COMPLETED` |
| `CANCELLED` | None (terminal) | Brand, Admin | `CAMPAIGN_CANCELLED` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| `ACTIVE` requires required fields complete (budget, dates, deliverables) | Validate at publish/approve time |
| `PENDING_REVIEW` can only be approved by Admin | Brand cannot self-approve when pre-approval is enabled |
| `COMPLETED` only after all deliverables final and payouts reconciled | System can auto-complete when criteria met |
| `CANCELLED` should stop new applications and future payouts | Existing obligations must be resolved |

## Application Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `APPLIED` | `SHORTLISTED`, `REJECTED`, `WITHDRAWN` | Creator, Brand, Admin | `APPLICATION_SUBMITTED` |
| `SHORTLISTED` | `SELECTED`, `REJECTED`, `WITHDRAWN` | Brand, Admin, Creator | `APPLICATION_SHORTLISTED` |
| `SELECTED` | `REJECTED` (exception), `WITHDRAWN` (creator request) | Admin, Brand, Creator | `APPLICATION_SELECTED` |
| `REJECTED` | None (terminal) | Brand, Admin | `APPLICATION_REJECTED` |
| `WITHDRAWN` | None (terminal) | Creator | `APPLICATION_WITHDRAWN` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Only `ACTIVE` campaigns accept applications | Reject apply if campaign not `ACTIVE` |
| Application belongs to exactly one campaign + creator | Immutable relationship |
| `SELECTED` implies a deliverable schedule exists | Enforce before status change |
| Admin overrides must be audited | Write admin action log |

## Deliverable Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `PENDING` | `SUBMITTED`, `DRAFT_SUBMITTED` | Creator | `DELIVERABLE_CREATED` |
| `DRAFT_SUBMITTED` | `BRAND_REVIEWING`, `CHANGES_REQUESTED`, `REJECTED` | Brand, Admin | `DELIVERABLE_DRAFT_SUBMITTED` |
| `SUBMITTED` | `BRAND_REVIEWING`, `APPROVED`, `REJECTED`, `REVISION` | Creator (submit), Brand/Admin (review) | `DELIVERABLE_SUBMITTED` |
| `BRAND_REVIEWING` | `APPROVED`, `CHANGES_REQUESTED`, `REJECTED` | Brand, Admin | `DELIVERABLE_REVIEW_STARTED` |
| `REVISION` | `SUBMITTED` | Creator | `DELIVERABLE_REVISION_REQUESTED` |
| `CHANGES_REQUESTED` | `DRAFT_SUBMITTED`, `SUBMITTED` | Creator | `DELIVERABLE_CHANGES_REQUESTED` |
| `APPROVED` | `POSTED` | Brand, Admin (approve), Creator (post) | `DELIVERABLE_APPROVED` |
| `POSTED` | None (terminal) | Creator | `DELIVERABLE_POSTED` |
| `REJECTED` | None (terminal) | Brand, Admin | `DELIVERABLE_REJECTED` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Deliverable must belong to an `ACTIVE` campaign | Block submissions otherwise |
| Only creator can submit or post | Admin can override for compliance |
| `APPROVED` required before `POSTED` | Enforce in UI and API |
| Each status change should include reviewer + reason when applicable | Required for audit trail |

## KYC Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `PENDING` | `APPROVED`, `REJECTED` | Admin | `KYC_SUBMITTED` |
| `REJECTED` | `PENDING` (new submission) | Creator | `KYC_REJECTED` |
| `APPROVED` | None (terminal) | Admin | `KYC_APPROVED` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Only latest `PENDING` doc per type can be approved | Prevent duplicate approvals |
| Approval requires required documents present | Validate on review |
| Rejected docs must include reason | Required for notifications |

## Notification Read Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `UNREAD` | `READ` | Creator, Brand, Admin (recipient) | `NOTIFICATION_CREATED` |
| `READ` | None (terminal) | Recipient | `NOTIFICATION_READ` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Only recipient can mark read | Enforce ownership |
| `READ` should set `readAt` timestamp | Use server time |

## Messaging Read Lifecycle

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `SENDING` | `SENT` | Client | `MESSAGE_SENDING` |
| `SENT` | `DELIVERED`, `READ` | System, Recipient | `MESSAGE_SENT` |
| `DELIVERED` | `READ` | Recipient | `MESSAGE_DELIVERED` |
| `READ` | None (terminal) | Recipient | `MESSAGE_READ` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Only recipient can mark `READ` | Sender cannot mark own message read |
| `READ` implies delivered | Enforce order on server |
| Conversation unread counts derived from message `read` state | Must stay consistent |

## Wallet Transaction Lifecycle (Future-proofed)

| State | Allowed Transitions | Triggered By | Events |
| --- | --- | --- | --- |
| `PENDING` | `COMPLETED`, `FAILED`, `CANCELLED` | System, Admin | `TRANSACTION_CREATED` |
| `COMPLETED` | None (terminal) | System | `TRANSACTION_COMPLETED` |
| `FAILED` | None (terminal) | System | `TRANSACTION_FAILED` |
| `CANCELLED` | None (terminal) | Admin, System | `TRANSACTION_CANCELLED` |

| Invariant / Validation Rule | Notes |
| --- | --- |
| Transaction has immutable `type` (`EARNING`, `WITHDRAWAL`, `REFUND`, `BONUS`, `PENALTY`) | Type cannot change after creation |
| Payouts may include `PaymentStatus` (`PENDING`, `PROCESSING`, `PAID`, `FAILED`, `REFUNDED`) | Use to model escrow/release steps |
| Wallet balance = sum of completed credits/debits | Pending should not affect available balance |
| Admin adjustments require audit entry | Must log reason |
