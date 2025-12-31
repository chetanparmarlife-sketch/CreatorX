/**
 * Supabase configuration
 * 
 * Environment variables are set in Replit Secrets:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

const isValidHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const getSupabaseUrl = (): string => {
  // Try multiple ways to access environment variables
  // @ts-ignore - Expo environment variables
  const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const url = rawUrl?.trim();
  if (
    url &&
    url !== 'your-supabase-url' &&
    url !== 'https://your-project.supabase.co' &&
    isValidHttpUrl(url)
  ) {
    return url;
  }
  
  // Default placeholder (will show error if used)
  return 'https://your-project.supabase.co';
};

const getSupabaseAnonKey = (): string => {
  // @ts-ignore - Expo environment variables  
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (key && key !== 'your-supabase-key' && key !== 'your-anon-key') {
    return key;
  }
  
  // Default placeholder (will show error if used)
  return 'your-anon-key';
};

export const SUPABASE_CONFIG = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
};

// Validation for local development
if (__DEV__) {
  const isConfigured = 
    SUPABASE_CONFIG.url !== 'https://your-project.supabase.co' &&
    SUPABASE_CONFIG.anonKey !== 'your-anon-key';
  
  if (!isConfigured) {
    console.warn('⚠️  Supabase not configured!');
    console.warn('   Create .env.local file with:');
    console.warn('   EXPO_PUBLIC_SUPABASE_URL=your-project-url');
    console.warn('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.warn('   See .env.example for template');
  } else {
    console.log('✅ Supabase configured');
    console.log(`   URL: ${SUPABASE_CONFIG.url}`);
  }
}
