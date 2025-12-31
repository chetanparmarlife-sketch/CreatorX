'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserService } from '@/lib/api/admin/users'
import { UserStatus } from '@/lib/types'
import { Pagination } from '@/components/shared/pagination'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'

const statusOptions = Object.values(UserStatus)

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, sortDir],
    queryFn: () => adminUserService.listUsers({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminUserService.updateStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      pushToast('User status updated', 'success')
    },
    onError: () => pushToast('Failed to update user', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Users</h1>
        <p className="text-slate-500">Monitor accounts and update user status.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">User directory</div>
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((user: any) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {user.fullName || user.companyName || user.creatorUsername || '—'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">{user.role}</td>
                    <td className="py-3 pr-4">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                        value={user.status}
                        onChange={(event) =>
                          statusMutation.mutate({
                            userId: user.id,
                            status: event.target.value as UserStatus,
                          })
                        }
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <a
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        href={`/admin/users/${user.id}`}
                      >
                        Edit Profile
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}
