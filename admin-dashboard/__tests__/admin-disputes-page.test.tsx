"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminDisputesPage from '@/app/(admin)/admin/disputes/page'

const list = jest.fn()
const resolve = jest.fn()

jest.mock('@/lib/api/admin/disputes', () => ({
  adminDisputeService: {
    list: (...args: unknown[]) => list(...args),
    resolve: (...args: unknown[]) => resolve(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminDisputesPage', () => {
  beforeEach(() => {
    list.mockResolvedValue({
      content: [
        {
          id: 'dispute-1',
          creatorEmail: 'creator@example.com',
          brandEmail: 'brand@example.com',
          type: 'PAYMENT',
          status: 'OPEN',
          campaignTitle: 'Launch Campaign',
        },
      ],
      totalPages: 1,
    })
  })

  it('renders disputes and opens resolve dialog', async () => {
    renderWithClient(<AdminDisputesPage />)

    await waitFor(() => {
      expect(screen.getByText('creator@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Resolve'))
    expect(screen.getByText('Resolve dispute')).toBeInTheDocument()
  })
})
