# Admin Frontend UI/UX Audit and Redesign Plan

## Goal
Redesign the admin frontend UX to match the quality and interaction model of the brand dashboard, without breaking backend contracts or frontend data wiring.

## Scope
- In scope: Admin UI structure, page composition, layout responsiveness, design system consistency, and accessibility.
- Out of scope: Backend APIs, endpoint payloads, auth semantics, query keys, route paths, and business logic.

## Audit Summary (Current State)

### Architecture and wiring baseline
- Admin app is isolated and cleanly structured under `admin-dashboard/`.
- Data layer is already modular (`lib/api/admin/*`, React Query, Zustand auth store).
- Most admin pages already use shared service modules and query invalidation patterns.

### UX and consistency gaps
- 26 admin route pages exist under `admin-dashboard/app/(admin)/admin`.
- 0 pages use a page-shell abstraction like brand `DashboardPageShell`.
- Only 5 pages use `PageHeader`.
- Only 4 pages use `ActionBar`.
- 17 pages bypass both `PageHeader` and `ActionBar`, producing inconsistent hierarchy and spacing.
- Admin layout has no mobile navigation pattern; brand layout already has mobile drawer + sticky mobile top bar.
- Admin header component exists but is not part of the active admin layout flow.
- Queue pages are powerful but visually uneven because controls are mostly page-local and native HTML elements.

### Testing and regression safety
- Admin route/page count: 26
- Admin test files: 6 (`admin-dashboard/__tests__`)
- Coverage is concentrated in a few queue/settings pages; redesign needs stronger UI regression coverage.

## Non-Breaking Constraints (Must Keep)
Do not change these contract layers during redesign:
- `admin-dashboard/lib/api/**/*`
- `admin-dashboard/lib/hooks/**/*`
- `admin-dashboard/lib/store/auth-store.ts`
- `admin-dashboard/app/(admin)/layout.tsx` auth gating behavior (can change visuals/layout only)
- `admin-dashboard/middleware.ts`
- Any backend code (`backend/**/*`)

Do not change:
- Endpoint URLs
- Request/response DTO shapes
- Query keys and invalidation semantics
- Route paths and route params

## Target UX (Brand-Style Parity for Admin)
- Strong page hierarchy with reusable shell primitives.
- Consistent header/action/filter/table rhythm across all admin pages.
- Responsive layout parity (desktop + mobile nav behavior).
- Unified status semantics (chips, SLA badges, warning/critical panels).
- Fewer page-local ad-hoc styles, more shared components.

## Implementation Plan (Phased)

### Phase 0: Guardrails and baseline
Files:
- `admin-dashboard/README.md`
- `admin-dashboard/PROJECT_SUMMARY.md`

Work:
- Document redesign constraints and no-touch wiring boundaries.
- Capture current screenshots (desktop/mobile) for top admin workflows.

Acceptance:
- Team agrees on “UI-only” scope before code changes.

### Phase 1: Shared shell foundation
Files:
- `admin-dashboard/components/shared/page-header.tsx`
- `admin-dashboard/components/shared/action-bar.tsx`
- `admin-dashboard/components/shared/context-panel.tsx`
- `admin-dashboard/components/shared/empty-state.tsx`
- `admin-dashboard/components/shared/dashboard-page-shell.tsx` (new)
- `admin-dashboard/app/globals.css`

Work:
- Port brand-style `DashboardPageShell` pattern to admin.
- Upgrade admin `PageHeader` API to support `subtitle`, `eyebrow`, optional CTA.
- Normalize spacing tokens and card/table shell usage.

Acceptance:
- Core shell primitives exist and are used in at least 3 pilot pages.
- No API/service/store changes.

### Phase 2: Layout and navigation parity
Files:
- `admin-dashboard/app/(admin)/layout.tsx`
- `admin-dashboard/components/layout/admin-sidebar.tsx`
- `admin-dashboard/components/layout/header.tsx` (either integrate or remove dead path)

Work:
- Add mobile nav drawer and sticky mobile top bar (brand layout pattern).
- Keep existing auth/token flow; only change view composition.
- Keep sidebar IA, but improve section readability and active-state cues.

Acceptance:
- Admin nav usable on mobile/tablet without route or auth regressions.
- Desktop behavior remains unchanged for routing/data.

### Phase 3: High-impact queue pages (first migration wave)
Files:
- `admin-dashboard/app/(admin)/admin/kyc/page.tsx`
- `admin-dashboard/app/(admin)/admin/disputes/page.tsx`
- `admin-dashboard/app/(admin)/admin/compliance/page.tsx`
- `admin-dashboard/app/(admin)/admin/campaigns/page.tsx`
- `admin-dashboard/app/(admin)/admin/audit/page.tsx`

Work:
- Migrate page scaffolding to shared shell/header/action sections.
- Standardize filter bars, table wrappers, pagination placement, and empty/loading states.
- Keep existing mutations, query keys, and payloads unchanged.

Acceptance:
- User flows (review/resolve/export/bulk actions) are functionally identical.
- Visual consistency matches brand dashboard quality baseline.

### Phase 4: Remaining pages (second migration wave)
Files:
- `admin-dashboard/app/(admin)/admin/users/page.tsx`
- `admin-dashboard/app/(admin)/admin/users/[id]/page.tsx`
- `admin-dashboard/app/(admin)/admin/settings/page.tsx`
- `admin-dashboard/app/(admin)/admin/finance/page.tsx`
- `admin-dashboard/app/(admin)/admin/health/page.tsx`
- `admin-dashboard/app/(admin)/admin/permissions/page.tsx`
- `admin-dashboard/app/(admin)/admin/*` (remaining routes)

Work:
- Apply same shell and component standards to all long-tail screens.
- Remove style drift and duplicate patterns.

Acceptance:
- All admin pages follow one design grammar.
- No route/API/wiring changes required.

### Phase 5: QA hardening and regression safety
Files:
- `admin-dashboard/__tests__/*`
- New tests for migrated pages

Work:
- Add rendering and interaction smoke tests for migrated pages.
- Validate critical flows: KYC approve/reject, disputes assign/resolve, compliance actions, audit export, settings save.
- Run `npm run lint` and `npm test` in `admin-dashboard`.

Acceptance:
- Existing tests pass.
- New UI migration tests pass.
- No behavioral regressions in core admin workflows.

## Execution Order Recommendation
1. Phase 1 (shared shell)
2. Phase 2 (layout/nav)
3. Phase 3 (queue pages)
4. Phase 4 (remaining pages)
5. Phase 5 (QA)

This order gives maximum UX gain early while minimizing risk to backend and data wiring.

## Rollback Strategy
- Commit per phase and per page cluster.
- If regressions occur, revert only affected page-level UI commits; keep API/store layers untouched.
- Maintain a strict rule: no mixed UI + data-layer commits.
