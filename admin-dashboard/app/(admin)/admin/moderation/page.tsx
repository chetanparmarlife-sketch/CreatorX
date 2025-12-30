'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminModerationService } from '@/lib/api/admin/moderation'
import { ModerationRuleSeverity, ModerationRuleStatus } from '@/lib/types'

export default function AdminModerationRulesPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    pattern: '',
    description: '',
    severity: ModerationRuleSeverity.MEDIUM,
    status: ModerationRuleStatus.ACTIVE,
    action: 'FLAG',
  })

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-moderation-rules'],
    queryFn: adminModerationService.listRules,
  })

  const createMutation = useMutation({
    mutationFn: () => adminModerationService.createRule(form),
    onSuccess: () => {
      setForm({
        name: '',
        pattern: '',
        description: '',
        severity: ModerationRuleSeverity.MEDIUM,
        status: ModerationRuleStatus.ACTIVE,
        action: 'FLAG',
      })
      queryClient.invalidateQueries({ queryKey: ['admin-moderation-rules'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => adminModerationService.deleteRule(ruleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-moderation-rules'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Moderation Rules</h1>
        <p className="text-slate-500">Configure automated content checks for campaigns.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create Rule</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Rule name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Regex or keyword pattern"
            value={form.pattern}
            onChange={(event) => setForm((prev) => ({ ...prev, pattern: event.target.value }))}
          />
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={form.severity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, severity: event.target.value as ModerationRuleSeverity }))
            }
          >
            {Object.values(ModerationRuleSeverity).map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as ModerationRuleStatus }))
            }
          >
            {Object.values(ModerationRuleStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-4 h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
          onClick={() => createMutation.mutate()}
          disabled={!form.name || !form.pattern}
        >
          Create Rule
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Existing Rules</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Rule</th>
                <th className="py-2 pr-4">Pattern</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : data.length ? (
                data.map((rule) => (
                  <tr key={rule.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{rule.name}</p>
                      <p className="text-xs text-slate-500">{rule.description}</p>
                    </td>
                    <td className="py-3 pr-4 max-w-sm text-slate-600">{rule.pattern}</td>
                    <td className="py-3 pr-4">{rule.severity}</td>
                    <td className="py-3 pr-4">{rule.status}</td>
                    <td className="py-3 pr-4">
                      <button
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                        onClick={() => deleteMutation.mutate(rule.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No moderation rules configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
