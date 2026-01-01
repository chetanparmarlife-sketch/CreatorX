import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/src/theme';
import { connectSocialPlatform, SocialPlatform } from '@/src/services/socialConnectMock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/context/AuthContext';

const STORAGE_KEYS = {
  CONNECTED_PLATFORM: '@connected_platform',
  FOLLOWER_COUNT: '@follower_count',
  SOCIAL_HANDLE: '@social_handle',
};

export default function ConnectScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();
  const [loading, setLoading] = useState<SocialPlatform | null>(null);

  const handleConnect = async (platform: SocialPlatform) => {
    setLoading(platform);
    try {
      const result = await connectSocialPlatform(platform);
      await AsyncStorage.setItem(STORAGE_KEYS.CONNECTED_PLATFORM, result.platform);
      await AsyncStorage.setItem(STORAGE_KEYS.FOLLOWER_COUNT, result.followerCount.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_HANDLE, result.handle);
      router.push({
        pathname: '/(auth)/eligibility',
        params: {
          platform: result.platform,
          followerCount: result.followerCount.toString(),
          handle: result.handle,
        },
      });
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login-otp');
  };

  const handleSkipDev = () => {
    devLogin();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[colors.primary, colors.violet]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="zap" size={28} color={colors.text} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Join CreatorX</Text>
        <Text style={styles.subtitle}>Connect your social account to get started</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleConnect('instagram')}
            disabled={loading !== null}
          >
            <LinearGradient
              colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
              style={styles.instagramGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading === 'instagram' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <FontAwesome5 name="instagram" size={20} color={colors.text} />
                  <Text style={styles.buttonText}>Instagram</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleConnect('youtube')}
            disabled={loading !== null}
          >
            <View style={styles.youtubeButton}>
              {loading === 'youtube' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <FontAwesome5 name="youtube" size={20} color={colors.text} />
                  <Text style={styles.buttonText}>YouTube</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleConnect('linkedin')}
            disabled={loading !== null}
          >
            <View style={styles.linkedinButton}>
              {loading === 'linkedin' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <FontAwesome5 name="linkedin" size={20} color={colors.text} />
                  <Text style={styles.buttonText}>LinkedIn</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Feather name="info" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>Minimum 1,000 followers required to join</Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipDev}>
          <Text style={styles.skipText}>Skip for Dev Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  socialButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  instagramGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  linkedinButton: {
    backgroundColor: '#0A66C2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  loginPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
