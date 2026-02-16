# Brand Dashboard Improvement Plan

**Owner:** Product + Design + Frontend + Backend  
**Date:** February 16, 2026  
**Scope:** `brand-dashboard` web app (all dashboard routes)

---

## 1) Objective

Improve the brand dashboard from a "data display" UI into an action-focused operating console that helps brands:

1. Launch campaigns faster
2. Review deliverables faster
3. Resolve payment blockers faster
4. Understand account health without hunting across pages

---

## 2) Success Metrics

Use these as release gates. If metrics do not move, continue iteration.

| Metric | Baseline (Week 0) | Target (60 days) | Source |
| --- | --- | --- | --- |
| Time to first key action (new session) | TBD | -30% | Frontend events |
| Dashboard -> Create Campaign CTR | TBD | +25% | Frontend events |
| Deliverable review turnaround | TBD | -35% | Deliverables API |
| Low-balance campaign blockage rate | TBD | -40% | Wallet + campaign events |
| Weekly active brand users | TBD | +20% | Auth + session analytics |
| 7-day retention (brand role) | TBD | +12% | Product analytics |

---

## 3) Product Principles

1. One screen should answer: "What needs action now?"
2. Every module should have a next action.
3. No duplicate KPIs across sections.
4. Prioritize operational clarity over decorative widgets.
5. Mobile should support core workflows, not just desktop fallback.

---

## 4) Workstreams

## WS-A: Measurement and Baseline (Week 1)

### A1. Event instrumentation model
- Add events:
  - `dashboard_viewed`
  - `priority_card_clicked`
  - `quick_action_clicked`
  - `campaign_created_from_dashboard`
  - `deliverable_review_started`
  - `wallet_fund_initiated`
  - `wallet_fund_success`
- Include dimensions:
  - `brand_id`
  - `route`
  - `time_since_login_sec`
  - `pending_deliverables_count`
  - `wallet_balance_band`

### A2. Baseline dashboard
- Create weekly report in analytics tool:
  - Traffic
  - Funnel conversion
  - Drop-off by route
  - Median time-to-action

**Acceptance criteria**
- Events appear in production telemetry.
- Baseline report shared weekly with PM + design + engineering.

---

## WS-B: Information Architecture and UX System (Week 1-2)

### B1. Standard page shell contract
- Every dashboard page must follow:
  1. Header with title + subtitle + primary action
  2. Action/filter bar
  3. Main content zone
  4. Context zone (desktop)
  5. Empty/loading/error states

### B2. Copy and tone pass
- Replace vague or technical copy with operational language:
  - "Review now", "Resolve", "Fund", "Publish", "Escalate"
- Remove inconsistent separators and placeholder symbols.

### B3. Design token hardening
- Standardize spacing, radii, shadows, typography scale, status color semantics.

**Acceptance criteria**
- 100% of core pages (`dashboard`, `campaigns`, `deliverables`, `applications`, `payments`, `messages`) match shell contract.
- No duplicate primary CTA on a page.

---

## WS-C: Dashboard Home Re-architecture (Week 2-3)

### C1. Above-the-fold focus
- Keep only:
  1. Priority queue
  2. Portfolio health snapshot
  3. Primary actions
- Move secondary insight modules below fold.

### C2. Priority Queue 2.0
- Show ranked items with severity:
  - `blocked`
  - `needs_action`
  - `on_track`
- One-click CTAs:
  - Review campaign
  - Approve deliverables
  - Add funds

### C3. Signal quality
- KPI cards must include:
  - current value
  - delta/trend
  - interpretation
  - direct action link

**Acceptance criteria**
- Reduced scroll depth to first action.
- Increase in `quick_action_clicked` rate by at least 15% in A/B test.

---

## WS-D: Workflow Speed Improvements (Week 3-5)

### D1. Campaign operations
- Add fast actions in campaign list:
  - submit draft
  - pause/resume
  - open analytics
- Add bulk operation confirmation with outcome summary.

### D2. Deliverables operations
- Improve queue handling:
  - multi-select + bulk approve/request changes
  - due-state grouping: overdue, due soon, on track
- Keep review modal keyboard-safe and fast.

### D3. Payments operations
- Add "fund recommendations" based on upcoming commitments.
- Improve wallet state messaging before campaign creation and approval.

**Acceptance criteria**
- 20% reduction in median clicks for common operations:
  - submit draft campaign
  - review deliverable
  - fund wallet

---

## WS-E: Navigation and Mobile Experience (Week 4-5)

### E1. Mobile-first dashboard behavior
- Drawer nav with compact route context.
- Mobile list->detail flow for messages and queues.

### E2. Contextual navigation
- Keep route-level subtitle and context hints.
- Show pending counters in nav where operationally useful.

**Acceptance criteria**
- No horizontal overflow in key pages on 360px width.
- Mobile usability test: user completes 3 core tasks without assistance.

---

## WS-F: Performance, Quality, Accessibility (Week 5-6)

### F1. Performance
- Budget targets:
  - LCP under 2.5s on dashboard home
  - INP under 200ms for top interactions
- Reduce expensive re-renders and unstable memo dependencies.

### F2. Quality
- Resolve all build-blocking lint errors.
- Triage and address top warning classes:
  - hook dependency stability
  - image optimization strategy

### F3. Accessibility
- Keyboard access for all core CTAs and dialogs.
- Consistent focus indicators.
- Improve contrast for all status chips and muted text.

**Acceptance criteria**
- CI build stable on main.
- Lighthouse accessibility score >= 90 for dashboard routes.

---

## 5) Detailed Backlog (Execution Tickets)

| ID | Priority | Area | Task | Est. |
| --- | --- | --- | --- | --- |
| BD-001 | P0 | Analytics | Instrument dashboard and workflow events | 1 day |
| BD-002 | P0 | Analytics | Build weekly KPI report | 1 day |
| BD-003 | P0 | UX | Page shell contract implementation for core pages | 2 days |
| BD-004 | P0 | UX | Copy normalization and action-language pass | 1 day |
| BD-005 | P0 | Dashboard | Priority Queue 2.0 + severity states + CTAs | 2 days |
| BD-006 | P1 | Dashboard | KPI trend/delta support in home cards | 1.5 days |
| BD-007 | P1 | Campaigns | Bulk action UX and action feedback | 2 days |
| BD-008 | P1 | Deliverables | Due-state grouping + queue controls | 2 days |
| BD-009 | P1 | Payments | Funding recommendation card | 1.5 days |
| BD-010 | P1 | Mobile | Full responsive QA sweep + fixes | 2 days |
| BD-011 | P1 | Messages | Mobile list/detail and quick back actions | 1.5 days |
| BD-012 | P1 | Quality | Resolve lint warning clusters | 2 days |
| BD-013 | P2 | Perf | Route-level performance optimization pass | 2 days |
| BD-014 | P2 | A11y | Accessibility sweep and fixes | 2 days |
| BD-015 | P2 | Experiment | A/B test: top module ordering | 1 day |

---

## 6) Sprint Plan (6 Weeks)

### Sprint 1 (Week 1)
- BD-001, BD-002, BD-003, BD-004
- Output: measurable baseline + consistent page scaffolding

### Sprint 2 (Week 2-3)
- BD-005, BD-006
- Output: action-first dashboard home

### Sprint 3 (Week 3-4)
- BD-007, BD-008
- Output: faster campaign and deliverable operations

### Sprint 4 (Week 4-5)
- BD-009, BD-010, BD-011
- Output: wallet guidance + complete mobile behavior

### Sprint 5 (Week 5-6)
- BD-012, BD-013, BD-014, BD-015
- Output: stable quality, performance, accessibility, experiment results

---

## 7) Roles and Ownership

| Function | Owner | Responsibility |
| --- | --- | --- |
| Product Manager | PM | KPI definition, prioritization, release decisions |
| UI/UX Designer | Design | IA, visual hierarchy, copy, usability tests |
| Frontend Engineer | FE | Dashboard UI, interaction, responsiveness, telemetry |
| Backend Engineer | BE | Aggregation endpoints, queue stats, performance |
| QA Engineer | QA | Regression, cross-browser/mobile, accessibility checks |
| Data/Analytics | Data | Event validation, KPI dashboards, experiment analysis |

---

## 8) Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Too many UI changes at once | Regression risk | Ship by workstream behind feature flags |
| Metrics not instrumented early | No proof of improvement | Complete WS-A before major UI experiments |
| Mobile complexity in message workflows | Broken navigation | Dedicated mobile test scripts + device matrix |
| API payload growth | Performance degradation | Profile heavy routes and paginate aggressively |
| Copy inconsistency returns | UX drift | Add copy/style checklist to PR template |

---

## 9) Release and Validation Checklist

- Feature flags for major dashboard modules
- Canary release to internal users
- 1-week monitored rollout
- KPI review at Day 7 and Day 30
- Rollback criteria:
  - task completion rate drops >10%
  - error rate rises >2x baseline
  - session performance breaches SLA

---

## 10) Definition of Done

The initiative is complete when:

1. Core KPI targets show positive movement for 2 consecutive weeks.
2. Dashboard core tasks are faster and require fewer clicks.
3. Mobile and desktop experiences are consistent and usable.
4. No critical lint/build failures block deployment.
5. PM, design, and engineering sign off on quality and usability.

