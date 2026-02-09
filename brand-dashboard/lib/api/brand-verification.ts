import { apiClient } from './client'
import { BrandVerificationStatus } from '@/lib/types'

export const brandVerificationService = {
  async getStatus(): Promise<BrandVerificationStatus> {
    return apiClient.get('/brand-verification/status')
  },
  async submitGstDocument(file: File, gstNumber: string): Promise<BrandVerificationStatus> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('gstNumber', gstNumber)

    // Axios automatically sets the correct Content-Type with boundary for FormData
    return apiClient.post('/brand-verification/submit', formData)
  },
}
