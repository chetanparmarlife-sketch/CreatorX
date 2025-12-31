import { OnboardingFlow, OnboardingSlide } from './_components/OnboardingFlow';

const CREATOR_SLIDES: OnboardingSlide[] = [
  {
    title: 'Discover creator-friendly campaigns',
    description: 'Browse campaigns that match your niche, platform, and style.',
    icon: 'compass',
  },
  {
    title: 'Apply with confidence',
    description: 'Showcase your profile once and apply in minutes.',
    icon: 'send',
  },
  {
    title: 'Deliver with clarity',
    description: 'Track milestones, feedback, and deadlines in one place.',
    icon: 'check-circle',
  },
  {
    title: 'Get paid on schedule',
    description: 'Complete deliverables and receive payouts without friction.',
    icon: 'dollar-sign',
  },
];

export default function CreatorOnboarding() {
  return (
    <OnboardingFlow
      role="creator"
      title="Create as a Creator"
      subtitle="Everything you need to manage campaigns and earnings."
      slides={CREATOR_SLIDES}
    />
  );
}
