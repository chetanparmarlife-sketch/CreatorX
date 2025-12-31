import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AUTH_ONBOARDING_ROUTE, DEFAULT_ONBOARDING_ROLE } from '@/src/constants/routes';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${AUTH_ONBOARDING_ROUTE}/${DEFAULT_ONBOARDING_ROLE}`);
  }, [router]);

  return null;
}
