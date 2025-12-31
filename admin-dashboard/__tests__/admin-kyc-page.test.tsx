"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminKycPage from '@/app/(admin)/admin/kyc/page'

const listPending = jest.fn()
const approve = jest.fn()
const reject = jest.fn()
const bulkReview = jest.fn()

jest.mock('@/lib/api/admin/kyc', () => ({
  adminKycService: {
    listPending: (...args: unknown[]) => listPending(...args),
    approve: (...args: unknown[]) => approve(...args),
    reject: (...args: unknown[]) => reject(...args),
    bulkReview: (...args: unknown[]) => bulkReview(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminKycPage', () => {
  beforeEach(() => {
    listPending.mockResolvedValue({
      items: [
        {
          id: 'doc-1',
          userEmail: 'creator@example.com',
          fileUrl: 'https://example.com/doc.pdf',
          documentType: 'AADHAAR',
          submittedAt: new Date().toISOString(),
        },
      ],
      page: 0,
      size: 20,
      total: 1,
      totalPages: 1,
    })
  })

  it('renders pending documents and opens reject dialog', async () => {
    renderWithClient(<AdminKycPage />)

    await waitFor(() => {
      expect(screen.getByText('creator@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Reject'))

    expect(screen.getByText('Reject KYC document')).toBeInTheDocument()
  })
})
