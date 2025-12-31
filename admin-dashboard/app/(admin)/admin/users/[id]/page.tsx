'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminProfileService } from '@/lib/api/admin/profiles'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'

type ProfileTab = 'USER' | 'CREATOR' | 'BRAND'

export default function AdminUserProfileEditPage() {
  const params = useParams<{ id: string }>()
  const userId = params?.id || ''
  const { toasts, pushToast, dismissToast } = useToast()
  const [tab, setTab] = useState<ProfileTab>('USER')

  const [userForm, setUserForm] = useState({ fullName: '', phone: '', bio: '' })
  const [creatorForm, setCreatorForm] = useState({
    username: '',
    category: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
  })
  const [brandForm, setBrandForm] = useState({
    companyName: '',
    gstNumber: '',
    industry: '',
    website: '',
    companyDescription: '',
  })

  const userMutation = useMutation({
    mutationFn: () => adminProfileService.updateUserProfile(userId, userForm),
    onSuccess: () => pushToast('User profile updated', 'success'),
    onError: () => pushToast('User profile update failed', 'error'),
  })

  const creatorMutation = useMutation({
    mutationFn: () => adminProfileService.updateCreatorProfile(userId, creatorForm),
    onSuccess: () => pushToast('Creator profile updated', 'success'),
    onError: () => pushToast('Creator profile update failed', 'error'),
  })

  const brandMutation = useMutation({
    mutationFn: () => adminProfileService.updateBrandProfile(userId, brandForm),
    onSuccess: () => pushToast('Brand profile updated', 'success'),
    onError: () => pushToast('Brand profile update failed', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Profiles</p>
          <h1 className="text-3xl font-semibold text-slate-900">Edit Profile</h1>
          <p className="text-slate-500">User ID: {userId}</p>
        </div>
        <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/users">
          Back to Users
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['USER', 'CREATOR', 'BRAND'] as ProfileTab[]).map((item) => (
          <button
            key={item}
            className={`h-9 rounded-lg px-4 text-xs font-semibold ${
              tab === item ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
            }`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'USER' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">User Profile</h2>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Full name"
            value={userForm.fullName}
            onChange={(event) => setUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Phone"
            value={userForm.phone}
            onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Bio"
            value={userForm.bio}
            onChange={(event) => setUserForm((prev) => ({ ...prev, bio: event.target.value }))}
          />
          <button
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
            onClick={() => userMutation.mutate()}
          >
            Save User Profile
          </button>
        </div>
      ) : null}

      {tab === 'CREATOR' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Creator Profile</h2>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Username"
            value={creatorForm.username}
            onChange={(event) => setCreatorForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Category"
            value={creatorForm.category}
            onChange={(event) => setCreatorForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Instagram URL"
            value={creatorForm.instagramUrl}
            onChange={(event) => setCreatorForm((prev) => ({ ...prev, instagramUrl: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="YouTube URL"
            value={creatorForm.youtubeUrl}
            onChange={(event) => setCreatorForm((prev) => ({ ...prev, youtubeUrl: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Twitter/X URL"
            value={creatorForm.twitterUrl}
            onChange={(event) => setCreatorForm((prev) => ({ ...prev, twitterUrl: event.target.value }))}
          />
          <button
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
            onClick={() => creatorMutation.mutate()}
          >
            Save Creator Profile
          </button>
        </div>
      ) : null}

      {tab === 'BRAND' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Brand Profile</h2>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Company name"
            value={brandForm.companyName}
            onChange={(event) => setBrandForm((prev) => ({ ...prev, companyName: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="GST number"
            value={brandForm.gstNumber}
            onChange={(event) => setBrandForm((prev) => ({ ...prev, gstNumber: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Industry"
            value={brandForm.industry}
            onChange={(event) => setBrandForm((prev) => ({ ...prev, industry: event.target.value }))}
          />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Website"
            value={brandForm.website}
            onChange={(event) => setBrandForm((prev) => ({ ...prev, website: event.target.value }))}
          />
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Company description"
            value={brandForm.companyDescription}
            onChange={(event) => setBrandForm((prev) => ({ ...prev, companyDescription: event.target.value }))}
          />
          <button
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
            onClick={() => brandMutation.mutate()}
          >
            Save Brand Profile
          </button>
        </div>
      ) : null}
    </div>
  )
}
