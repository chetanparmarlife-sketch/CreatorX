import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  allocateToCampaign,
  createDepositOrder,
  getBrandWallet,
  getCampaignTransactions,
  getWalletTransactions,
  type AllocationRequest,
  type DepositRequest,
} from '../api/wallet'

/**
 * Hook to get brand wallet balance and stats
 */
export function useBrandWallet() {
  return useQuery({
    queryKey: ['brand-wallet'],
    queryFn: getBrandWallet,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to get wallet transaction history
 */
export function useWalletTransactions(params: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['wallet-transactions', params],
    queryFn: () => getWalletTransactions(params),
    staleTime: 10000, // 10 seconds
  })
}

/**
 * Hook to get campaign escrow transactions
 */
export function useCampaignTransactions(
  campaignId: string,
  params: { page?: number; size?: number }
) {
  return useQuery({
    queryKey: ['campaign-transactions', campaignId, params],
    queryFn: () => getCampaignTransactions(campaignId, params),
    enabled: !!campaignId,
    staleTime: 10000,
  })
}

/**
 * Hook to create deposit order
 * Returns mutation that creates Razorpay order
 */
export function useCreateDepositOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: DepositRequest) => createDepositOrder(request),
    onSuccess: () => {
      // Invalidate wallet query so balance updates after payment
      // Note: Balance will be updated after webhook processes payment
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] })
    },
  })
}

/**
 * Hook to allocate funds to campaign
 */
export function useAllocateToCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      campaignId,
      request,
    }: {
      campaignId: string
      request: AllocationRequest
    }) => allocateToCampaign(campaignId, request),
    onSuccess: (_, variables) => {
      // Invalidate wallet and campaign queries
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      queryClient.invalidateQueries({
        queryKey: ['campaign', variables.campaignId],
      })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
