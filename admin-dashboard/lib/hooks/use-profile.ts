import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService, BrandProfile } from '@/lib/api/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BrandProfile) => profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => profileService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
