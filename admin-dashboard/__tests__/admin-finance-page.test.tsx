"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminFinancePage from '@/app/(admin)/admin/finance/page'

const getSummary = jest.fn()
const getUserReport = jest.fn()
const getCampaignReport = jest.fn()
const getPeriodReport = jest.fn()
const exportReport = jest.fn()

jest.mock('@/lib/api/admin/finance', () => ({
  adminFinanceService: {
    getSummary: (...args: unknown[]) => getSummary(...args),
    getUserReport: (...args: unknown[]) => getUserReport(...args),
    getCampaignReport: (...args: unknown[]) => getCampaignReport(...args),
    getPeriodReport: (...args: unknown[]) => getPeriodReport(...args),
    exportReport: (...args: unknown[]) => exportReport(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminFinancePage', () => {
  beforeEach(() => {
    getSummary.mockResolvedValue({
      totalEarnings: 0,
      totalWithdrawals: 0,
      totalRefunds: 0,
      totalPenalties: 0,
      pendingPayouts: 0,
      totalTransactions: 0,
    })
    getPeriodReport.mockResolvedValue([])
    getUserReport.mockResolvedValue([])
    getCampaignReport.mockResolvedValue([])
    exportReport.mockResolvedValue(new Blob(['csv']))
  })

  it('switches report group and triggers CSV export', async () => {
    const createObjectUrl = jest.fn(() => 'blob:report')
    const revokeObjectUrl = jest.fn()
    Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectUrl })
    Object.defineProperty(global.URL, 'revokeObjectURL', { value: revokeObjectUrl })
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    renderWithClient(<AdminFinancePage />)

    await waitFor(() => {
      expect(getPeriodReport).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByDisplayValue('Group by Period'), { target: { value: 'USER' } })

    await waitFor(() => {
      expect(getUserReport).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByText('Export CSV'))

    await waitFor(() => {
      expect(exportReport).toHaveBeenCalled()
      expect(createObjectUrl).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    clickSpy.mockRestore()
  })
})
