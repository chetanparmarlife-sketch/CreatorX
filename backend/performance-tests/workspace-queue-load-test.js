import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const options = {
  scenarios: {
    enterprise_workspace: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 25 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'workspace_summary_latency{route:brand-summary}': ['p(95)<500'],
    'workspace_summary_latency{route:admin-summary}': ['p(95)<500'],
    'action_queue_latency{route:brand-queue}': ['p(95)<800'],
    'action_queue_latency{route:admin-queue}': ['p(95)<800'],
    'workspace_status_ok': ['rate>0.99'],
  },
};

const workspaceSummaryLatency = new Trend('workspace_summary_latency', true);
const actionQueueLatency = new Trend('action_queue_latency', true);
const workspaceStatusOk = new Rate('workspace_status_ok');

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const BRAND_TOKEN = __ENV.BRAND_TOKEN || '';
const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || '';

const headersFor = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  },
});

const record = (response, metric, route) => {
  metric.add(response.timings.duration, { route });
  workspaceStatusOk.add(response.status >= 200 && response.status < 300);
  check(response, {
    [`${route} returned 2xx`]: (res) => res.status >= 200 && res.status < 300,
  });
};

export default function () {
  if (BRAND_TOKEN) {
    record(
      http.get(`${BASE_URL}/api/v1/brand/workspace-summary`, headersFor(BRAND_TOKEN)),
      workspaceSummaryLatency,
      'brand-summary'
    );
    record(
      http.get(`${BASE_URL}/api/v1/brand/action-queue?page=0&size=20`, headersFor(BRAND_TOKEN)),
      actionQueueLatency,
      'brand-queue'
    );
  }

  if (ADMIN_TOKEN) {
    record(
      http.get(`${BASE_URL}/api/v1/admin/workspace-summary`, headersFor(ADMIN_TOKEN)),
      workspaceSummaryLatency,
      'admin-summary'
    );
    record(
      http.get(`${BASE_URL}/api/v1/admin/action-queue?page=0&size=20`, headersFor(ADMIN_TOKEN)),
      actionQueueLatency,
      'admin-queue'
    );
  }

  sleep(1);
}
