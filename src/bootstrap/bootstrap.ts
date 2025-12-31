import { featureFlags } from '@/src/config/featureFlags';
import { runStorageMigrations } from '@/src/storage/migrations';

export async function bootstrapApp(): Promise<{ requiresReauth: boolean }> {
  await featureFlags.loadFlags();
  return runStorageMigrations();
}
