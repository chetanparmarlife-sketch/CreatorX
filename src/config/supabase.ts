/**
 * Supabase configuration
 * 
 * For local development:
 * 1. Create .env.local file
 * 2. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * 3. Or use remote Supabase instance
 * 
 * To get your Supabase credentials:
 * - Go to your Supabase project dashboard
 * - Settings > API
 * - Copy Project URL and anon/public key
 */

const getSupabaseUrl = (): string => {
  // @ts-ignore - Expo environment variables
  const url = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL;
  if (url && url !== 'your-supabase-url' && url !== 'https://your-project.supabase.co') {
    return url;
  }
  
  // Default placeholder (will show error if used)
  return 'https://your-project.supabase.co';
};

const getSupabaseAnonKey = (): string => {
  // @ts-ignore - Expo environment variables
  const key = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
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

