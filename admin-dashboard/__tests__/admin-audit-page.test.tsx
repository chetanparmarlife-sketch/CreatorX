"use client"

import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminAuditPage from '@/app/(admin)/admin/audit/page'

const list = jest.fn()
const exportCsv = jest.fn()

jest.mock('@/lib/api/admin/audit', () => ({
  adminAuditService: {
    list: (...args: unknown[]) => list(...args),
    exportCsv: (...args: unknown[]) => exportCsv(...args),
  },
}))

const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AdminAuditPage', () => {
  beforeEach(() => {
    list.mockResolvedValue({
      items: [
        {
          id: 'audit-1',
          adminId: 'admin-1',
          adminEmail: 'admin@example.com',
          actionType: 'KYC_APPROVED',
          entityType: 'KYC_DOCUMENT',
          entityId: 'doc-1',
          createdAt: new Date().toISOString(),
          details: {},
        },
      ],
      totalPages: 1,
    })
    exportCsv.mockResolvedValue(new Blob(['csv']))
  })

  it('renders entries and exports CSV', async () => {
    const createObjectUrl = jest.fn(() => 'blob:audit')
    const revokeObjectUrl = jest.fn()
    Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectUrl })
    Object.defineProperty(global.URL, 'revokeObjectURL', { value: revokeObjectUrl })
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    renderWithClient(<AdminAuditPage />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    await waitFor(() => {
      expect(exportCsv).toHaveBeenCalled()
      expect(createObjectUrl).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    clickSpy.mockRestore()
  })
})
