'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSettingsService } from '@/lib/api/admin/settings'
import { PlatformSettingType } from '@/lib/types'
import { PLATFORM_SETTING_KEYS, WEEKDAY_OPTIONS } from '@/lib/constants/platform-settings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const parseJsonArray = (value?: string) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const stringifyJsonArray = (value: string[]) => JSON.stringify(value)

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminSettingsService.listSettings,
  })

  const settingsMap = useMemo(() => {
    return data.reduce<Record<string, { value: string; description?: string }>>((acc, setting) => {
      acc[setting.key] = { value: setting.value, description: setting.description }
      return acc
    }, {})
  }, [data])

  const [commissionPercent, setCommissionPercent] = useState('10')
  const [payoutDays, setPayoutDays] = useState<string[]>([])
  const [payoutStartHour, setPayoutStartHour] = useState('9')
  const [payoutEndHour, setPayoutEndHour] = useState('18')
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [campaignPreApproval, setCampaignPreApproval] = useState(false)
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(true)
  const [categoryEnforcement, setCategoryEnforcement] = useState(false)
  const [confirmingSection, setConfirmingSection] = useState<
    null | 'fees' | 'payouts' | 'categories' | 'features'
  >(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setCommissionPercent(settingsMap[PLATFORM_SETTING_KEYS.FEES_PLATFORM_COMMISSION_PERCENT]?.value || '10')
    setPayoutDays(parseJsonArray(settingsMap[PLATFORM_SETTING_KEYS.PAYOUT_ALLOWED_DAYS]?.value))
    setPayoutStartHour(settingsMap[PLATFORM_SETTING_KEYS.PAYOUT_START_HOUR]?.value || '9')
    setPayoutEndHour(settingsMap[PLATFORM_SETTING_KEYS.PAYOUT_END_HOUR]?.value || '18')
    setCategoryList(parseJsonArray(settingsMap[PLATFORM_SETTING_KEYS.CATEGORIES_ALLOWED_LIST]?.value))
    setCampaignPreApproval(settingsMap[PLATFORM_SETTING_KEYS.FEATURE_CAMPAIGN_PREAPPROVAL]?.value === 'true')
    setWithdrawalsEnabled(settingsMap[PLATFORM_SETTING_KEYS.FEATURE_WITHDRAWALS_ENABLED]?.value !== 'false')
    setCategoryEnforcement(settingsMap[PLATFORM_SETTING_KEYS.FEATURE_CATEGORY_ENFORCEMENT]?.value === 'true')
  }, [settingsMap])

  const saveMutation = useMutation({
    mutationFn: adminSettingsService.upsertSetting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  })

  const persistSetting = (key: string, value: string, dataType: PlatformSettingType, description: string) => {
    saveMutation.mutate({
      key,
      value,
      dataType,
      description,
    })
  }

  const handleSaveFees = () => {
    setValidationError(null)
    const commissionValue = Number(commissionPercent)
    if (Number.isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      setValidationError('Commission must be between 0 and 100.')
      return
    }
    setConfirmingSection('fees')
  }

  const confirmSaveFees = () => {
    persistSetting(
      PLATFORM_SETTING_KEYS.FEES_PLATFORM_COMMISSION_PERCENT,
      commissionPercent,
      PlatformSettingType.NUMBER,
      'Platform commission percentage applied to creator earnings'
    )
    setConfirmingSection(null)
  }

  const handleSavePayouts = () => {
    setValidationError(null)
    const startHour = Number(payoutStartHour)
    const endHour = Number(payoutEndHour)
    if (
      Number.isNaN(startHour) ||
      Number.isNaN(endHour) ||
      startHour < 0 ||
      endHour < 0 ||
      startHour > 23 ||
      endHour > 23
    ) {
      setValidationError('Payout hours must be between 0 and 23.')
      return
    }
    if (startHour >= endHour) {
      setValidationError('Payout start hour must be before end hour.')
      return
    }
    if (!payoutDays.length) {
      setValidationError('Select at least one payout weekday.')
      return
    }
    setConfirmingSection('payouts')
  }

  const confirmSavePayouts = () => {
    persistSetting(
      PLATFORM_SETTING_KEYS.PAYOUT_ALLOWED_DAYS,
      stringifyJsonArray(payoutDays),
      PlatformSettingType.JSON,
      'Allowed payout weekdays'
    )
    persistSetting(
      PLATFORM_SETTING_KEYS.PAYOUT_START_HOUR,
      payoutStartHour,
      PlatformSettingType.NUMBER,
      'Payout start hour (0-23)'
    )
    persistSetting(
      PLATFORM_SETTING_KEYS.PAYOUT_END_HOUR,
      payoutEndHour,
      PlatformSettingType.NUMBER,
      'Payout end hour (0-23)'
    )
    setConfirmingSection(null)
  }

  const handleSaveCategories = () => {
    setValidationError(null)
    if (categoryEnforcement && categoryList.length === 0) {
      setValidationError('Add at least one category before enforcing the list.')
      return
    }
    setConfirmingSection('categories')
  }

  const confirmSaveCategories = () => {
    persistSetting(
      PLATFORM_SETTING_KEYS.CATEGORIES_ALLOWED_LIST,
      stringifyJsonArray(categoryList),
      PlatformSettingType.JSON,
      'Allowed campaign categories'
    )
    persistSetting(
      PLATFORM_SETTING_KEYS.FEATURE_CATEGORY_ENFORCEMENT,
      categoryEnforcement ? 'true' : 'false',
      PlatformSettingType.BOOLEAN,
      'Enforce category allow list'
    )
    setConfirmingSection(null)
  }

  const handleSaveFeatures = () => {
    setValidationError(null)
    setConfirmingSection('features')
  }

  const confirmSaveFeatures = () => {
    persistSetting(
      PLATFORM_SETTING_KEYS.FEATURE_CAMPAIGN_PREAPPROVAL,
      campaignPreApproval ? 'true' : 'false',
      PlatformSettingType.BOOLEAN,
      'Require admin approval for campaigns'
    )
    persistSetting(
      PLATFORM_SETTING_KEYS.FEATURE_WITHDRAWALS_ENABLED,
      withdrawalsEnabled ? 'true' : 'false',
      PlatformSettingType.BOOLEAN,
      'Enable withdrawals and payout window checks'
    )
    setConfirmingSection(null)
  }

  const toggleDay = (day: string) => {
    setPayoutDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500">Configure fees, schedules, categories, and feature flags.</p>
      </div>

      {validationError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {validationError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Fees</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">Platform commission (%)</label>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              type="number"
              min="0"
              step="0.1"
              value={commissionPercent}
              onChange={(event) => setCommissionPercent(event.target.value)}
            />
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={handleSaveFees}
            >
              Save Fees
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Payout Schedule</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Allowed weekdays</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      payoutDays.includes(day)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600'
                    }`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Start hour</label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  type="number"
                  min="0"
                  max="23"
                  value={payoutStartHour}
                  onChange={(event) => setPayoutStartHour(event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">End hour</label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  type="number"
                  min="0"
                  max="23"
                  value={payoutEndHour}
                  onChange={(event) => setPayoutEndHour(event.target.value)}
                />
              </div>
            </div>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={handleSavePayouts}
            >
              Save Payout Schedule
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">Allowed categories</label>
            <textarea
              className="h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Comma-separated categories"
              value={categoryList.join(', ')}
              onChange={(event) => {
                const values = event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
                setCategoryList(values)
              }}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={categoryEnforcement}
                onChange={(event) => setCategoryEnforcement(event.target.checked)}
              />
              Enforce category list
            </label>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={handleSaveCategories}
            >
              Save Categories
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Feature Flags</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={campaignPreApproval}
                onChange={(event) => setCampaignPreApproval(event.target.checked)}
              />
              Require campaign pre-approval
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={withdrawalsEnabled}
                onChange={(event) => setWithdrawalsEnabled(event.target.checked)}
              />
              Enable withdrawals
            </label>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={handleSaveFeatures}
            >
              Save Feature Flags
            </button>
          </div>
        </div>
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

      <Dialog open={!!confirmingSection} onOpenChange={(open) => !open && setConfirmingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm changes</DialogTitle>
            <DialogDescription>Review setting updates before saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600">
            {confirmingSection === 'fees' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-400">Commission</p>
                <p className="font-semibold text-slate-900">{commissionPercent}%</p>
              </div>
            ) : null}
            {confirmingSection === 'payouts' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-400">Payout schedule</p>
                <p className="text-slate-700">Days: {payoutDays.join(', ')}</p>
                <p className="text-slate-700">
                  Window: {payoutStartHour}:00 - {payoutEndHour}:00
                </p>
              </div>
            ) : null}
            {confirmingSection === 'categories' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-400">Categories</p>
                <p className="text-slate-700">{categoryList.join(', ') || '—'}</p>
                <p className="text-slate-700">
                  Enforce: {categoryEnforcement ? 'Yes' : 'No'}
                </p>
              </div>
            ) : null}
            {confirmingSection === 'features' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-400">Feature flags</p>
                <p className="text-slate-700">
                  Campaign pre-approval: {campaignPreApproval ? 'On' : 'Off'}
                </p>
                <p className="text-slate-700">
                  Withdrawals: {withdrawalsEnabled ? 'On' : 'Off'}
                </p>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setConfirmingSection(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (confirmingSection === 'fees') confirmSaveFees()
                if (confirmingSection === 'payouts') confirmSavePayouts()
                if (confirmingSection === 'categories') confirmSaveCategories()
                if (confirmingSection === 'features') confirmSaveFeatures()
              }}
            >
              Confirm Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
