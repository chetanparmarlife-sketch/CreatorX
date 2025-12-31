import { OnboardingFlow, OnboardingSlide } from './_components/OnboardingFlow';

const BRAND_SLIDES: OnboardingSlide[] = [
  {
    title: 'Plan campaigns faster',
    description: 'Set goals, budgets, and deliverables in a guided flow.',
    icon: 'clipboard',
  },
  {
    title: 'Find the right creators',
    description: 'Review applicants, shortlist talent, and track fits.',
    icon: 'users',
  },
  {
    title: 'Review deliverables',
    description: 'Approve content with feedback and revision tracking.',
    icon: 'check-square',
  },
  {
    title: 'Measure results',
    description: 'Monitor performance and reporting across campaigns.',
    icon: 'bar-chart-2',
  },
];

export default function BrandOnboarding() {
  return (
    <OnboardingFlow
      role="brand"
      title="Launch as a Brand"
      subtitle="Plan, review, and measure creator campaigns."
      slides={BRAND_SLIDES}
    />
  );
}
