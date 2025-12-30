import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { brandVerificationService } from '@/lib/api/brand-verification'

export function useBrandVerificationStatus() {
  return useQuery({
    queryKey: ['brand-verification'],
    queryFn: () => brandVerificationService.getStatus(),
  })
}

export function useSubmitGstDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, gstNumber }: { file: File; gstNumber: string }) =>
      brandVerificationService.submitGstDocument(file, gstNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-verification'] })
    },
  })
}
