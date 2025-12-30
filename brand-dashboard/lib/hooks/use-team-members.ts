import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileService, InvitePayload } from '@/lib/api/profile'
import { TeamMember } from '@/lib/types'

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: () => profileService.getTeamMembers(),
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvitePayload) => profileService.inviteTeamMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => profileService.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}
