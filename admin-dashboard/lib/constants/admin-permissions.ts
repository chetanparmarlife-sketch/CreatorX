export const ADMIN_PERMISSIONS = [
  'ADMIN_USERS_READ',
  'ADMIN_USERS_WRITE',
  'ADMIN_KYC_REVIEW',
  'ADMIN_BRAND_VERIFICATION_REVIEW',
  'ADMIN_CAMPAIGN_MODERATION',
  'ADMIN_CAMPAIGN_REVIEW',
  'ADMIN_CAMPAIGN_MANAGE',
  'ADMIN_MODERATION_RULES',
  'ADMIN_DISPUTE_MANAGE',
  'ADMIN_AUDIT_READ',
  'ADMIN_COMPLIANCE_MANAGE',
  'ADMIN_FINANCE_READ',
  'ADMIN_SETTINGS_MANAGE',
  'ADMIN_SYSTEM_READ',
  'ADMIN_PERMISSIONS_MANAGE',
  'ADMIN_MESSAGES_MANAGE',
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

export const ADMIN_ROLE_TEMPLATES: Array<{
  id: string
  label: string
  description: string
  permissions: AdminPermission[]
}> = [
  {
    id: 'support',
    label: 'Support',
    description: 'Review users, KYC, brand verification, disputes, and messages.',
    permissions: [
      'ADMIN_USERS_READ',
      'ADMIN_KYC_REVIEW',
      'ADMIN_BRAND_VERIFICATION_REVIEW',
      'ADMIN_DISPUTE_MANAGE',
      'ADMIN_MESSAGES_MANAGE',
      'ADMIN_AUDIT_READ',
      'ADMIN_SYSTEM_READ',
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Monitor payouts, compliance exports, audits, and system health.',
    permissions: [
      'ADMIN_FINANCE_READ',
      'ADMIN_COMPLIANCE_MANAGE',
      'ADMIN_AUDIT_READ',
      'ADMIN_SYSTEM_READ',
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Own KYC, brand verification, moderation, disputes, audits, and compliance tasks.',
    permissions: [
      'ADMIN_KYC_REVIEW',
      'ADMIN_BRAND_VERIFICATION_REVIEW',
      'ADMIN_CAMPAIGN_MODERATION',
      'ADMIN_MODERATION_RULES',
      'ADMIN_DISPUTE_MANAGE',
      'ADMIN_AUDIT_READ',
      'ADMIN_COMPLIANCE_MANAGE',
      'ADMIN_SYSTEM_READ',
    ],
  },
  {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Full operational access, including settings and permission management.',
    permissions: [...ADMIN_PERMISSIONS],
  },
]
