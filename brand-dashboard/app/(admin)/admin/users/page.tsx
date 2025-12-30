'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserService } from '@/lib/api/admin/users'
import { UserStatus } from '@/lib/types'

const statusOptions = Object.values(UserStatus)

export default function AdminUsersPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUserService.listUsers({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminUserService.updateStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Users</h1>
        <p className="text-slate-500">Monitor accounts and update user status.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
