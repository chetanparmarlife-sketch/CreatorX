"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminSettingsPage from '@/app/(admin)/admin/settings/page'
import { PLATFORM_SETTING_KEYS } from '@/lib/constants/platform-settings'
import { PlatformSettingType } from '@/lib/types'

const listSettings = jest.fn()
const upsertSetting = jest.fn()

jest.mock('@/lib/api/admin/settings', () => ({
  adminSettingsService: {
    listSettings: (...args: unknown[]) => listSettings(...args),
    upsertSetting: (...args: unknown[]) => upsertSetting(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    listSettings.mockResolvedValue([
      {
        key: PLATFORM_SETTING_KEYS.FEES_PLATFORM_COMMISSION_PERCENT,
        value: '10',
        dataType: PlatformSettingType.NUMBER,
      },
      {
        key: PLATFORM_SETTING_KEYS.PAYOUT_ALLOWED_DAYS,
        value: '[]',
        dataType: PlatformSettingType.JSON,
      },
      {
        key: PLATFORM_SETTING_KEYS.PAYOUT_START_HOUR,
        value: '9',
        dataType: PlatformSettingType.NUMBER,
      },
      {
        key: PLATFORM_SETTING_KEYS.PAYOUT_END_HOUR,
        value: '18',
        dataType: PlatformSettingType.NUMBER,
      },
      {
        key: PLATFORM_SETTING_KEYS.CATEGORIES_ALLOWED_LIST,
        value: '["Fashion"]',
        dataType: PlatformSettingType.JSON,
      },
      {
        key: PLATFORM_SETTING_KEYS.FEATURE_CAMPAIGN_PREAPPROVAL,
        value: 'false',
        dataType: PlatformSettingType.BOOLEAN,
      },
      {
        key: PLATFORM_SETTING_KEYS.FEATURE_WITHDRAWALS_ENABLED,
        value: 'true',
        dataType: PlatformSettingType.BOOLEAN,
      },
      {
        key: PLATFORM_SETTING_KEYS.FEATURE_CATEGORY_ENFORCEMENT,
        value: 'false',
        dataType: PlatformSettingType.BOOLEAN,
      },
    ])
    upsertSetting.mockResolvedValue({})
  })

  it('saves feature flags, payout schedule, and categories', async () => {
    renderWithClient(<AdminSettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Platform Settings')).toBeInTheDocument()
    })

    const payoutCard = screen.getByRole('heading', { name: 'Payout Schedule' }).parentElement
    if (!payoutCard) {
      throw new Error('Payout schedule section not found')
    }
    const payoutSection = within(payoutCard)
    fireEvent.click(payoutSection.getByText('MON'))
    const payoutInputs = payoutSection.getAllByRole('spinbutton')
    fireEvent.change(payoutInputs[0], { target: { value: '8' } })
    fireEvent.change(payoutInputs[1], { target: { value: '17' } })
    fireEvent.click(payoutSection.getByText('Save Payout Schedule'))

    const categoriesCard = screen.getByRole('heading', { name: 'Categories' }).parentElement
    if (!categoriesCard) {
      throw new Error('Categories section not found')
    }
    const categoriesSection = within(categoriesCard)
    fireEvent.change(categoriesSection.getByPlaceholderText('Comma-separated categories'), {
      target: { value: 'Fashion, Beauty' },
    })
    fireEvent.click(categoriesSection.getByLabelText('Enforce category list'))
    fireEvent.click(categoriesSection.getByText('Save Categories'))

    const featureCard = screen.getByRole('heading', { name: 'Feature Flags' }).parentElement
    if (!featureCard) {
      throw new Error('Feature flags section not found')
    }
    const featureSection = within(featureCard)
    fireEvent.click(featureSection.getByLabelText('Require campaign pre-approval'))
    fireEvent.click(featureSection.getByLabelText('Enable withdrawals'))
    fireEvent.click(featureSection.getByText('Save Feature Flags'))

    await waitFor(() => {
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.PAYOUT_ALLOWED_DAYS,
          value: '["MONDAY"]',
          dataType: PlatformSettingType.JSON,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.PAYOUT_START_HOUR,
          value: '8',
          dataType: PlatformSettingType.NUMBER,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.PAYOUT_END_HOUR,
          value: '17',
          dataType: PlatformSettingType.NUMBER,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.CATEGORIES_ALLOWED_LIST,
          value: '["Fashion","Beauty"]',
          dataType: PlatformSettingType.JSON,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.FEATURE_CATEGORY_ENFORCEMENT,
          value: 'true',
          dataType: PlatformSettingType.BOOLEAN,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.FEATURE_CAMPAIGN_PREAPPROVAL,
          value: 'true',
          dataType: PlatformSettingType.BOOLEAN,
        })
      )
      expect(upsertSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          key: PLATFORM_SETTING_KEYS.FEATURE_WITHDRAWALS_ENABLED,
          value: 'false',
          dataType: PlatformSettingType.BOOLEAN,
        })
      )
    })
  })
})
