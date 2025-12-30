'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSettingsService } from '@/lib/api/admin/settings'
import { PlatformSettingType } from '@/lib/types'

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    dataType: PlatformSettingType.STRING,
    description: '',
  })

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminSettingsService.listSettings,
  })

  const saveMutation = useMutation({
    mutationFn: adminSettingsService.upsertSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setNewSetting({
        key: '',
        value: '',
        dataType: PlatformSettingType.STRING,
        description: '',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500">Configure fees, schedules, and feature flags.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Setting</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="setting_key"
            value={newSetting.key}
            onChange={(event) => setNewSetting((prev) => ({ ...prev, key: event.target.value }))}
          />
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Value"
            value={newSetting.value}
            onChange={(event) => setNewSetting((prev) => ({ ...prev, value: event.target.value }))}
          />
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={newSetting.dataType}
            onChange={(event) =>
              setNewSetting((prev) => ({ ...prev, dataType: event.target.value as PlatformSettingType }))
            }
          >
            {Object.values(PlatformSettingType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Description"
            value={newSetting.description}
            onChange={(event) => setNewSetting((prev) => ({ ...prev, description: event.target.value }))}
          />
        </div>
        <button
          className="mt-4 h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
          onClick={() => saveMutation.mutate(newSetting)}
          disabled={!newSetting.key || !newSetting.value}
        >
          Save Setting
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Current Settings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Key</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : data.length ? (
                data.map((setting) => (
                  <tr key={setting.key} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{setting.key}</td>
                    <td className="py-3 pr-4">{setting.value}</td>
                    <td className="py-3 pr-4">{setting.dataType}</td>
                    <td className="py-3 pr-4 text-slate-500">{setting.description || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No settings configured.
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
