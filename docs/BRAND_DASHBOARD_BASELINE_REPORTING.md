# Brand Dashboard Baseline Reporting Spec

**Created:** February 16, 2026  
**Scope:** Brand dashboard telemetry baseline (WS-A / BD-001 / BD-002)

## 1. Event Pipeline

- Client tracker: `brand-dashboard/lib/analytics/use-brand-event-tracker.ts`
- Event schema: `brand-dashboard/lib/analytics/brand-events.ts`
- Collection endpoint: `brand-dashboard/app/api/brand-events/route.ts`
- Local fallback queue key: `creatorx_brand_event_queue`

## 2. Instrumented Events

1. `dashboard_viewed`
2. `priority_card_clicked`
3. `quick_action_clicked`
4. `campaign_created_from_dashboard`
5. `deliverable_review_started`
6. `wallet_fund_initiated`
7. `wallet_fund_success`

## 3. Required Dimensions (Attached to Every Event)

1. `brand_id`
2. `route`
3. `time_since_login_sec`
4. `pending_deliverables_count`
5. `wallet_balance_band` (`empty`, `low`, `healthy`, `strong`, `unknown`)

## 4. Weekly KPI View (Baseline Dashboard)

Track each metric weekly (Mon-Sun), segmented by `route` and `wallet_balance_band`.

1. Traffic
- Unique brands with `dashboard_viewed`
- Sessions hitting dashboard route

2. Funnel conversion
- `dashboard_viewed` -> `quick_action_clicked` (Create campaign)
- `dashboard_viewed` -> `deliverable_review_started`
- `wallet_fund_initiated` -> `wallet_fund_success`

3. Drop-off by route
- % of dashboard views with no key action in same session
- Action distribution by destination route (`campaigns`, `deliverables`, `payments`)

4. Median time-to-action
- Median `time_since_login_sec` for:
  - `quick_action_clicked`
  - `priority_card_clicked`
  - `deliverable_review_started`

## 5. KPI Query Templates

Use the telemetry sink table as `brand_events`.

```sql
-- Weekly dashboard traffic
select
  date_trunc('week', sent_at) as week_start,
  count(*) filter (where event = 'dashboard_viewed') as dashboard_views,
  count(distinct brand_id) filter (where event = 'dashboard_viewed') as active_brands
from brand_events
group by 1
order by 1 desc;
```

```sql
-- Dashboard -> Create campaign CTR
with weekly as (
  select
    date_trunc('week', sent_at) as week_start,
    count(*) filter (
      where event = 'quick_action_clicked'
      and properties->>'action_id' in ('create_campaign', 'launch_campaign_hero')
    ) as create_clicks,
    count(*) filter (where event = 'dashboard_viewed') as dashboard_views
  from brand_events
  group by 1
)
select
  week_start,
  create_clicks,
  dashboard_views,
  case when dashboard_views = 0 then 0
       else round((create_clicks::numeric / dashboard_views::numeric) * 100, 2)
  end as dashboard_to_create_ctr_pct
from weekly
order by week_start desc;
```

```sql
-- Wallet funding completion rate
select
  date_trunc('week', sent_at) as week_start,
  count(*) filter (where event = 'wallet_fund_initiated') as initiated,
  count(*) filter (where event = 'wallet_fund_success') as success,
  case when count(*) filter (where event = 'wallet_fund_initiated') = 0 then 0
       else round(
         (count(*) filter (where event = 'wallet_fund_success')::numeric /
          count(*) filter (where event = 'wallet_fund_initiated')::numeric) * 100, 2
       )
  end as success_rate_pct
from brand_events
group by 1
order by 1 desc;
```

## 6. Weekly Ritual

1. Monday morning: refresh dashboard snapshot and share KPI deltas.
2. Tuesday: identify weakest funnel segment and assign one product/design/engineering fix.
3. Friday: release review against KPI targets from `docs/BRAND_DASHBOARD_IMPROVEMENT_PLAN.md`.
