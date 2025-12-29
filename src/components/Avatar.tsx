import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, borderRadius } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  size?: number;
  name?: string;
  imageUrl?: string;
  showBadge?: boolean;
  badgeColor?: string;
}

export function Avatar({ 
  size = 48, 
  name = '', 
  imageUrl, 
  showBadge = false,
  badgeColor = colors.emerald 
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const badgeSize = size * 0.25;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <LinearGradient
          colors={[colors.primaryLight, colors.violetLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </LinearGradient>
      )}
      {showBadge && (
        <View 
          style={[
            styles.badge, 
            { 
              width: badgeSize, 
              height: badgeSize, 
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              borderWidth: size * 0.04,
            }
          ]} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  initials: {
    color: colors.text,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.card,
  },
});
