'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileService, BrandProfile, TeamMember, InvitePayload } from '@/lib/api/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const industries = ['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel'] as const

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.enum(industries, { required_error: 'Select an industry' }),
  website: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
})

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['Owner', 'Manager', 'Viewer']),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Enter current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type InviteFormValues = z.infer<typeof inviteSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    applications: true,
    deliverables: true,
    messages: true,
    push: false,
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      industry: undefined,
      website: '',
      gstNumber: '',
    },
  })

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'Manager',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  })

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => profileService.getTeamMembers(),
  })

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        companyName: profile.companyName || '',
        industry: (profile.industry as (typeof industries)[number]) || undefined,
        website: profile.website || '',
        gstNumber: profile.gstNumber || '',
      })
      setLogoPreview(profile.logoUrl || null)
    }
  }, [profile, profileForm])

  const updateProfileMutation = useMutation({
    mutationFn: (payload: BrandProfile) => profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (payload: InvitePayload) => profileService.inviteTeamMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      inviteForm.reset({ email: '', role: 'Manager' })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (id: string | number) => profileService.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setLogoPreview(previewUrl)
    uploadLogoMutation.mutate(file)
  }

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      companyName: values.companyName,
      industry: values.industry,
      website: values.website || undefined,
      gstNumber: values.gstNumber || undefined,
      logoUrl: profile?.logoUrl,
    })
  }

  const handleInvite = (values: InviteFormValues) => {
    inviteMutation.mutate(values)
  }

  const handlePasswordUpdate = (values: PasswordFormValues) => {
    passwordForm.reset()
  }

  const notificationList = useMemo(
    () => [
      {
        key: 'applications',
        label: 'Email notifications for new applications',
      },
      {
        key: 'deliverables',
        label: 'Email notifications for deliverable submissions',
      },
      {
        key: 'messages',
        label: 'Email notifications for messages',
      },
      {
        key: 'push',
        label: 'Push notifications (browser)',
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your brand profile and preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-lg border bg-white p-6">
            {profileLoading ? (
              <div className="text-sm text-slate-500">Loading profile...</div>
            ) : (
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-[160px,1fr]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-24 w-24 overflow-hidden rounded-full border bg-slate-50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Company logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Logo
                          </div>
                        )}
                      </div>
                      <label className="text-xs text-slate-500">
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        <span className="cursor-pointer rounded-md border px-3 py-1 text-xs text-slate-600">
                          Upload logo
                        </span>
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="CreatorX Brands" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                value={field.value ?? ''}
                                onChange={(event) => field.onChange(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                              >
                                <option value="" disabled>
                                  Select industry
                                </option>
                                {industries.map((industry) => (
                                  <option key={industry} value={industry}>
                                    {industry}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://creatorx.io" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="GSTIN1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Invite Team Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Send an invite to collaborate on campaigns.</DialogDescription>
                  </DialogHeader>
                  <Form {...inviteForm}>
                    <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
                      <FormField
                        control={inviteForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="teammate@brand.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={inviteForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                value={field.value}
                                onChange={(event) => field.onChange(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                              >
                                <option value="Owner">Owner</option>
                                <option value="Manager">Manager</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={inviteMutation.isPending}>
                          Send Invite
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {teamLoading ? (
              <div className="text-sm text-slate-500">Loading team members...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(teamMembers as TeamMember[]).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500">
                        No team members yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (teamMembers as TeamMember[]).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeMemberMutation.mutate(member.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            <div className="space-y-3">
              {notificationList.map((item) => (
                <label key={item.key} className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(event) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-lg border bg-white p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Password</Button>
              </form>
            </Form>

            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Two-factor authentication</p>
                  <p className="text-xs text-slate-500">Coming soon</p>
                </div>
                <span className="text-xs rounded-full bg-slate-200 px-2 py-1 text-slate-600">
                  Disabled
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
