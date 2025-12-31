"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminCampaignFlagsPage from '@/app/(admin)/admin/campaigns/page'

const listFlags = jest.fn()
const resolveFlag = jest.fn()

jest.mock('@/lib/api/admin/moderation', () => ({
  adminModerationService: {
    listFlags: (...args: unknown[]) => listFlags(...args),
    resolveFlag: (...args: unknown[]) => resolveFlag(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminCampaignFlagsPage', () => {
  beforeEach(() => {
    listFlags.mockResolvedValue({
      content: [
        {
          id: 'flag-1',
          campaignTitle: 'Summer Drop',
          campaignId: 'camp-1',
          ruleName: 'Sensitive content',
          reason: 'Flagged keyword',
          status: 'OPEN',
        },
      ],
      totalPages: 1,
    })
  })

  it('renders flags and opens resolve dialog', async () => {
    renderWithClient(<AdminCampaignFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText('Summer Drop')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByDisplayValue('OPEN'), { target: { value: 'RESOLVED' } })
    expect(screen.getByText('Resolve campaign flag')).toBeInTheDocument()
  })
})
