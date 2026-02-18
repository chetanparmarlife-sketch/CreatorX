'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminSystemService } from '@/lib/api/admin/system'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'

const formatNumber = (value?: number | null, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return `${value.toFixed(2)}${suffix}`
}

export default function AdminHealthPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => adminSystemService.getHealthSummary(),
  })

  const components = data?.components ?? {}
  const metrics = data?.metrics ?? {}

  const dbStatus = components.db || components.datasource || components.database || 'UNKNOWN'
  const redisStatus = components.redis || components.cache || 'NOT_CONFIGURED'
  const queueStatus = components.rabbit || components.kafka || components.queue || 'NOT_CONFIGURED'

  const httpAvgMs = metrics.httpAvgMs ?? null
  const httpMaxMs = metrics.httpMaxMs ?? null
  const dbActive = metrics.dbActive ?? null
  const dbMax = metrics.dbMax ?? null
  const dbUtilization = useMemo(() => {
    if (!dbActive || !dbMax || dbMax === 0) return null
    return (dbActive / dbMax) * 100
  }, [dbActive, dbMax])

  const apiLatencyStatus = httpAvgMs && httpAvgMs > 500 ? 'DEGRADED' : 'OK'
  const dbPoolStatus = dbUtilization && dbUtilization > 80 ? 'PRESSURE' : 'OK'

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="System Health"
        subtitle="Operational health, metrics, and service statuses."
        eyebrow="System"
      >

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overall Status</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{isLoading ? '—' : data?.status}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Database</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{isLoading ? '—' : dbStatus}</p>
          <p className="mt-1 text-xs text-slate-500">Pool {formatNumber(dbUtilization, '%')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Redis/Cache</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{isLoading ? '—' : redisStatus}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Queue</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{isLoading ? '—' : queueStatus}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">API Latency</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {isLoading ? '—' : formatNumber(httpAvgMs, ' ms')}
          </p>
          <p className="mt-1 text-xs text-slate-500">Max {formatNumber(httpMaxMs, ' ms')} · {apiLatencyStatus}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">DB Pool Pressure</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {isLoading ? '—' : formatNumber(dbUtilization, '%')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active {formatNumber(dbActive)} / Max {formatNumber(dbMax)} · {dbPoolStatus}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Heap Usage</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {isLoading ? '—' : formatNumber(metrics.jvmHeapUsed ? metrics.jvmHeapUsed / (1024 * 1024) : null, ' MB')}
          </p>
        </div>
      </div>

      <div className="table-shell p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Component Status</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Actuator</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.keys(components).length ? (
            Object.entries(components).map(([name, status]) => (
              <div key={name} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase text-slate-400">{name}</p>
                <p className="text-sm font-semibold text-slate-800">{status}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No component details available.</p>
          )}
        </div>
      </div>
      </DashboardPageShell>
    </div>
  )
}
