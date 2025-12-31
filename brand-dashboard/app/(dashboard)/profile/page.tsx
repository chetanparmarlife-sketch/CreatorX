'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile, useUpdateProfile, useUploadLogo } from '@/lib/hooks/use-profile'
import { useBrandVerificationStatus, useSubmitGstDocument } from '@/lib/hooks/use-brand-verification'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useCreators } from '@/lib/hooks/use-creators'
import { useTransactions } from '@/lib/hooks/use-payments'
import { CampaignStatus, Transaction } from '@/lib/types'

const industries = ['Technology', 'Fashion', 'Beauty', 'Food & Beverage', 'Health & Fitness']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadLogo = useUploadLogo()
  const { data: verificationStatus } = useBrandVerificationStatus()
  const submitGst = useSubmitGstDocument()

  const { data: campaignsData } = useCampaigns({}, 0)
  const { data: creatorsData } = useCreators({ page: 0, size: 20 })
  const { data: transactions } = useTransactions({ page: 0, size: 50 })

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [gstNumber, setGstNumber] = useState('')

  useEffect(() => {
    if (!profile) return
    setCompanyName(profile.companyName || '')
    setIndustry(profile.industry || '')
    setWebsite(profile.website || '')
    setGstNumber(profile.gstNumber || '')
  }, [profile])

  const activeCampaigns = (campaignsData?.items ?? []).filter(
    (campaign) => campaign.status === CampaignStatus.ACTIVE
  )

  const creatorsResponse = creatorsData as { items?: any[]; total?: number } | any[] | undefined
  const creators = Array.isArray(creatorsResponse)
    ? creatorsResponse
    : creatorsResponse?.items ?? []
  const creatorsTotal =
    (Array.isArray(creatorsResponse) ? creatorsResponse.length : creatorsResponse?.total) ??
    creators.length

  const totalSpent = (transactions ?? []).reduce(
    (sum: number, transaction: Transaction) => sum + (transaction.amount ?? 0),
    0
  )
  const averageEngagement = useMemo(() => {
    if (!creators.length) return 0
    const total = creators.reduce((acc, creator: any) => acc + (creator.engagementRate ?? 0), 0)
    return Number((total / creators.length).toFixed(1))
  }, [creators])

  const verificationAgeDays = verificationStatus?.submittedAt
    ? Math.ceil((Date.now() - new Date(verificationStatus.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleSave = () => {
    updateProfile.mutate({
      companyName,
      industry,
      website,
      gstNumber,
      logoUrl: profile?.logoUrl,
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadLogo.mutate(file)
    }
  }

  const handleGstUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    submitGst.mutate({ file, gstNumber: gstNumber.trim() })
  }

  return (
    <div>
      <PageHeader title="Profile" />

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt="Brand logo" className="h-full w-full object-cover" />
              ) : (
                <span>{user?.email?.substring(0, 2).toUpperCase() || 'CF'}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.companyName || user?.email?.split('@')[0] || 'Brand'}
              </h2>
              <p className="text-gray-600">{user?.email || 'demo@creatorx.com'}</p>
              <p className="text-sm text-gray-500">Brand Account</p>
              <label className="mt-2 inline-flex items-center text-sm text-sky-600 hover:text-sky-700 cursor-pointer">
                Upload logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading profile...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="">Select industry</option>
                  {industries.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <Input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <Input
                  value={gstNumber}
                  onChange={(event) => setGstNumber(event.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">{activeCampaigns.length}</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">{creatorsTotal}</div>
              <div className="text-sm text-gray-600">Creators</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">{averageEngagement}%</div>
              <div className="text-sm text-gray-600">Avg. Engagement</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Verification</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-medium text-gray-900">
                {verificationStatus?.status || 'NOT_SUBMITTED'}
              </span>
            </div>
            {verificationStatus?.submittedAt && (
              <div className="flex items-center justify-between">
                <span>Submitted</span>
                <span className="font-medium text-gray-900">
                  {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                  {verificationAgeDays !== null ? ` · ${verificationAgeDays}d ago` : ''}
                </span>
              </div>
            )}
            {verificationStatus?.reviewedAt && (
              <div className="flex items-center justify-between">
                <span>Reviewed</span>
                <span className="font-medium text-gray-900">
                  {new Date(verificationStatus.reviewedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {verificationStatus?.rejectionReason && (
              <p className="text-xs text-red-600">
                Rejection reason: {verificationStatus.rejectionReason}
              </p>
            )}
            {verificationStatus?.fileUrl && (
              <a
                href={verificationStatus.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-600 hover:text-sky-700"
              >
                View last submitted document
              </a>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload GST document (PDF or image)
              </label>
              <div className="flex items-center gap-3">
                <input type="file" accept="application/pdf,image/*" onChange={handleGstUpload} />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!gstNumber.trim() || submitGst.isPending}
                >
                  {submitGst.isPending ? 'Uploading...' : 'Submit GST'}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                GST number is required and stored on your profile.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">What happens next</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>We validate your GST document and business details.</li>
                <li>If anything is missing, you’ll see a rejection reason here.</li>
                <li>Once approved, you can launch campaigns without verification prompts.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
