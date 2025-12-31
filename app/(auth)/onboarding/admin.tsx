import { OnboardingFlow, OnboardingSlide } from './_components/OnboardingFlow';

const ADMIN_SLIDES: OnboardingSlide[] = [
  {
    title: 'Monitor trust & safety',
    description: 'Review KYC, moderation flags, and disputes in one queue.',
    icon: 'shield',
  },
  {
    title: 'Resolve issues faster',
    description: 'Track evidence, timelines, and resolution actions.',
    icon: 'activity',
  },
  {
    title: 'Stay compliant',
    description: 'Audit logs, GDPR exports, and policy updates live here.',
    icon: 'file-text',
  },
  {
    title: 'System visibility',
    description: 'Health checks, alerts, and reports in one view.',
    icon: 'eye',
  },
];

export default function AdminOnboarding() {
  return (
    <OnboardingFlow
      role="admin"
      title="Operate as an Admin"
      subtitle="Govern the platform with clarity and control."
      slides={ADMIN_SLIDES}
    />
  );
}
