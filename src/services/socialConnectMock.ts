export type SocialPlatform = 'instagram' | 'youtube' | 'linkedin';

export interface SocialConnectResult {
  platform: SocialPlatform;
  connected: boolean;
  handle: string;
  followerCount: number;
  profileUrl?: string;
}

const MOCK_DELAY = 1500;

const MOCK_FOLLOWER_COUNTS: Record<SocialPlatform, number> = {
  instagram: 2500,
  youtube: 15000,
  linkedin: 800,
};

const MOCK_HANDLES: Record<SocialPlatform, string> = {
  instagram: '@creator_demo',
  youtube: 'CreatorChannel',
  linkedin: 'creator-demo',
};

export async function connectSocialPlatform(
  platform: SocialPlatform
): Promise<SocialConnectResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        platform,
        connected: true,
        handle: MOCK_HANDLES[platform],
        followerCount: MOCK_FOLLOWER_COUNTS[platform],
        profileUrl: `https://${platform}.com/${MOCK_HANDLES[platform]}`,
      });
    }, MOCK_DELAY);
  });
}

export function isEligible(followerCount: number): boolean {
  return followerCount >= 1000;
}

export function getPlatformDisplayName(platform: SocialPlatform): string {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    case 'linkedin':
      return 'LinkedIn';
    default:
      return platform;
  }
}

export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
