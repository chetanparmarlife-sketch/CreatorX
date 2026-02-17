'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Upload, Building2, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useProfile, useUpdateProfile, useUploadLogo } from '@/lib/hooks/use-profile'
import { useBrandVerificationStatus, useSubmitGstDocument } from '@/lib/hooks/use-brand-verification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const industries = ['Technology', 'Fashion', 'Beauty', 'Food & Beverage', 'Health & Fitness', 'Lifestyle', 'Travel', 'Education', 'Other']

const STEPS = [
  { id: 1, title: 'Company Details', icon: Building2 },
  { id: 2, title: 'GST Verification', icon: FileText },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: verificationStatus } = useBrandVerificationStatus()
  const updateProfile = useUpdateProfile()
  const uploadLogo = useUploadLogo()
  const submitGst = useSubmitGstDocument()

  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [gstFile, setGstFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)

  // Pre-fill from existing profile (for REJECTED brands returning)
  useEffect(() => {
    if (!profile) return
    setCompanyName(profile.companyName || '')
    setIndustry(profile.industry || '')
    setWebsite(profile.website || '')
    setGstNumber(profile.gstNumber || '')
    if (profile.logoUrl) setLogoPreview(profile.logoUrl)
  }, [profile])

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleStep1Submit = async () => {
    setStepError(null)

    if (!companyName.trim()) {
      setStepError('Company name is required.')
      return
    }
    if (!industry) {
      setStepError('Please select an industry.')
      return
    }

    try {
      await updateProfile.mutateAsync({
        companyName: companyName.trim(),
        industry,
        website: website.trim() || undefined,
        gstNumber: profile?.gstNumber,
        logoUrl: profile?.logoUrl,
      })

      if (logoFile) {
        await uploadLogo.mutateAsync(logoFile)
      }

      setStep(2)
    } catch (err: any) {
      setStepError(err.message || 'Failed to save company details.')
    }
  }

  const handleStep2Submit = async () => {
    setStepError(null)

    if (!gstNumber.trim()) {
      setStepError('GST number is required.')
      return
    }
    if (!gstFile && !verificationStatus?.fileUrl) {
      setStepError('Please upload your GST document.')
      return
    }

    try {
      // Save GST number to profile first
      await updateProfile.mutateAsync({
        companyName,
        industry,
        website: website.trim() || undefined,
        gstNumber: gstNumber.trim(),
        logoUrl: profile?.logoUrl,
      })

      // Submit GST document for verification
      if (gstFile) {
        await submitGst.mutateAsync({ file: gstFile, gstNumber: gstNumber.trim() })
      }

      // Update auth store so the dashboard gate knows we're SUBMITTED
      if (user) {
        setUser({ ...user, onboardingStatus: 'SUBMITTED' })
      }

      setSubmitted(true)
    } catch (err: any) {
      setStepError(err.message || 'Failed to submit verification.')
    }
  }

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  // Success state after submission
  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-green-100 p-4 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted</h2>
          <p className="text-slate-600 max-w-md mb-2">
            Your onboarding application has been submitted for review.
          </p>
          <p className="text-sm text-slate-500 max-w-md mb-8">
            Our team will review your company details and GST document. This usually takes 1-2 business days. You will be notified once the review is complete.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isRejected = user?.onboardingStatus === 'REJECTED'

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon
          const isActive = step === s.id
          const isCompleted = step > s.id

          return (
            <div key={s.id} className="flex items-center gap-3">
              {i > 0 && (
                <div className={`h-px w-12 ${isCompleted ? 'bg-sky-500' : 'bg-slate-200'}`} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-sky-500 text-white'
                      : isActive
                        ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-500'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive ? 'text-slate-900' : isCompleted ? 'text-sky-600' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rejection alert */}
      {isRejected && verificationStatus?.rejectionReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Rejected</AlertTitle>
          <AlertDescription>
            {verificationStatus.rejectionReason}. Please update your details and resubmit.
          </AlertDescription>
        </Alert>
      )}

      {/* Step error */}
      {stepError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{stepError}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Company Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              Tell us about your brand. This information will be visible on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="">Select industry</option>
                {industries.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Brand Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-sky-500 flex items-center justify-center overflow-hidden text-white text-lg font-semibold shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span>{companyName?.substring(0, 2).toUpperCase() || 'CX'}</span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Upload className="h-4 w-4" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleStep1Submit}
                disabled={updateProfile.isPending || uploadLogo.isPending}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                {updateProfile.isPending || uploadLogo.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: GST Verification */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>GST Verification</CardTitle>
            <CardDescription>
              Upload your GST certificate to verify your business. This is required to create campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                GST Number <span className="text-red-500">*</span>
              </label>
              <Input
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                GST Document <span className="text-red-500">*</span>
              </label>
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center hover:border-sky-300 transition-colors">
                {gstFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                    <FileText className="h-5 w-5 text-sky-500" />
                    <span className="font-medium">{gstFile.name}</span>
                    <button
                      onClick={() => setGstFile(null)}
                      className="ml-2 text-slate-400 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : verificationStatus?.fileUrl ? (
                  <div className="text-sm text-slate-600">
                    <p className="mb-2">Previously uploaded document on file.</p>
                    <label className="cursor-pointer text-sky-600 hover:text-sky-700 font-medium">
                      Upload new document
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => setGstFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      Click to upload GST certificate
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF or image, max 10MB</p>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => setGstFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-2">What happens next?</p>
              <ul className="space-y-1 text-slate-500">
                <li>We validate your GST document and business details.</li>
                <li>Review usually takes 1-2 business days.</li>
                <li>Once approved, you can create and launch campaigns.</li>
              </ul>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleStep2Submit}
                disabled={submitGst.isPending || updateProfile.isPending}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                {submitGst.isPending || updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
