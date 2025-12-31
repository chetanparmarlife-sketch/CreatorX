'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserService } from '@/lib/api/admin/users'
import { adminPermissionService } from '@/lib/api/admin/permissions'
import { ADMIN_PERMISSIONS } from '@/lib/constants/admin-permissions'
import { UserRole } from '@/lib/types'

export default function AdminPermissionsPage() {
  const queryClient = useQueryClient()
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [permissionInput, setPermissionInput] = useState('')

  const { data: adminData, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUserService.listUsers({ role: UserRole.ADMIN, page: 0, size: 100 }),
  })

  const adminItems = useMemo(
    () => (adminData as any)?.items ?? (adminData as any)?.content ?? [],
    [adminData]
  )

  useEffect(() => {
    if (!selectedAdminId && adminItems.length) {
      setSelectedAdminId(adminItems[0].id)
    }
  }, [adminItems, selectedAdminId])

  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['admin-permissions', selectedAdminId],
    queryFn: () => adminPermissionService.list(selectedAdminId),
    enabled: !!selectedAdminId,
  })

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    setSelectedPermissions(permissions)
  }, [permissions, selectedAdminId])

  const normalizedPermissions = useMemo(
    () => new Set(permissions.map((permission) => permission.trim()).filter(Boolean)),
    [permissions]
  )

  const grantMutation = useMutation({
    mutationFn: (permission: string) => adminPermissionService.grant(selectedAdminId, permission),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-permissions', selectedAdminId] }),
  })

  const revokeMutation = useMutation({
    mutationFn: (permission: string) => adminPermissionService.revoke(selectedAdminId, permission),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-permissions', selectedAdminId] }),
  })

  const replaceMutation = useMutation({
    mutationFn: (nextPermissions: string[]) => adminPermissionService.replace(selectedAdminId, nextPermissions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-permissions', selectedAdminId] }),
  })

  const handleGrant = (permission: string) => {
    if (!permission.trim()) return
    grantMutation.mutate(permission.trim())
    setPermissionInput('')
  }

  const handleToggleSelected = (permission: string) => {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((value) => value !== permission)
      }
      return [...current, permission]
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Admin Permissions</h1>
        <p className="text-slate-500">Grant or revoke permissions for admin users.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Admin user</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={selectedAdminId}
              onChange={(event) => setSelectedAdminId(event.target.value)}
            >
              {isLoadingAdmins ? (
                <option value="">Loading...</option>
              ) : (
                adminItems.map((admin: any) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.email}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <label className="text-sm font-medium text-slate-700">Grant permission</label>
            <div className="flex gap-2">
              <input
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                placeholder="ADMIN_USERS_READ"
                value={permissionInput}
                onChange={(event) => setPermissionInput(event.target.value)}
              />
              <button
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
                onClick={() => handleGrant(permissionInput)}
                disabled={!selectedAdminId || !permissionInput.trim()}
              >
                Grant
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Current permissions</h2>
            {isLoadingPermissions ? (
              <p className="text-sm text-slate-500">Loading permissions...</p>
            ) : permissions.length ? (
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">{permission}</span>
                    <button
                      className="text-xs font-semibold text-rose-600"
                      onClick={() => revokeMutation.mutate(permission)}
                      disabled={!selectedAdminId}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No permissions assigned.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Available permissions</h2>
            <div className="space-y-2">
              {ADMIN_PERMISSIONS.map((permission) => {
                const isGranted = normalizedPermissions.has(permission)
                const isSelected = selectedPermissions.includes(permission)
                return (
                  <div
                    key={permission}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <label className="flex items-center gap-2 text-slate-800">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelected(permission)}
                        disabled={!selectedAdminId}
                      />
                      <span className={isGranted ? 'text-slate-400 line-through' : 'text-slate-800'}>
                        {permission}
                      </span>
                    </label>
                    <button
                      className="text-xs font-semibold text-emerald-600"
                      onClick={() => handleGrant(permission)}
                      disabled={!selectedAdminId || isGranted}
                    >
                      Grant
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                className="text-xs font-semibold text-slate-600"
                onClick={() => setSelectedPermissions(permissions)}
                disabled={!selectedAdminId}
              >
                Reset selection
              </button>
              <button
                className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
                onClick={() => replaceMutation.mutate(selectedPermissions)}
                disabled={!selectedAdminId}
              >
                Replace permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
