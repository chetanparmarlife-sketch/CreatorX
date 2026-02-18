"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminDisputesPage from '@/app/(admin)/admin/disputes/page'

const list = jest.fn()
const assign = jest.fn()
const resolve = jest.fn()

jest.mock('@/lib/api/admin/disputes', () => ({
  adminDisputeService: {
    list: (...args: unknown[]) => list(...args),
    assign: (...args: unknown[]) => assign(...args),
    resolve: (...args: unknown[]) => resolve(...args),
  },
}))

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: () => ({
    user: { id: 'admin-1' },
  }),
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
          createdAt: new Date().toISOString(),
          slaResolutionDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      totalPages: 1,
    })
    assign.mockResolvedValue({})
    resolve.mockResolvedValue({})
  })

  it('assigns and resolves a dispute', async () => {
    renderWithClient(<AdminDisputesPage />)

    await waitFor(() => {
      expect(screen.getByText('creator@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: 'Assign to me' }))

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('dispute-1', 'admin-1', 'Review dispute')
    })

    fireEvent.click(screen.getByText('Resolve'))
    expect(screen.getByText('Resolve dispute')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(resolve).toHaveBeenCalledWith(
        'dispute-1',
        expect.any(String),
        undefined,
        undefined,
        undefined
      )
    })
  })
})
