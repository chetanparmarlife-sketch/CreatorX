"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminCompliancePage from '@/app/(admin)/admin/compliance/page'

const listRequests = jest.fn()
const updateRequest = jest.fn()
const generateExport = jest.fn()
const anonymizeRequest = jest.fn()

jest.mock('@/lib/api/admin/compliance', () => ({
  adminComplianceService: {
    listRequests: (...args: unknown[]) => listRequests(...args),
    updateRequest: (...args: unknown[]) => updateRequest(...args),
    generateExport: (...args: unknown[]) => generateExport(...args),
    anonymizeRequest: (...args: unknown[]) => anonymizeRequest(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminCompliancePage', () => {
  beforeEach(() => {
    listRequests.mockResolvedValue({
      items: [
        {
          id: 'gdpr-export',
          userEmail: 'export@example.com',
          requestType: 'EXPORT',
          status: 'PENDING',
        },
        {
          id: 'gdpr-delete',
          userEmail: 'delete@example.com',
          requestType: 'DELETE',
          status: 'IN_PROGRESS',
        },
      ],
      page: 0,
      size: 20,
      total: 2,
      totalPages: 1,
    })
    generateExport.mockResolvedValue({})
    anonymizeRequest.mockResolvedValue({})
  })

  it('triggers export and anonymize actions', async () => {
    renderWithClient(<AdminCompliancePage />)

    await waitFor(() => {
      expect(screen.getByText('export@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Generate export'))
    fireEvent.click(screen.getByText('Anonymize'))

    await waitFor(() => {
      expect(generateExport).toHaveBeenCalledWith('gdpr-export')
      expect(anonymizeRequest).toHaveBeenCalledWith('gdpr-delete')
    })
  })
})
