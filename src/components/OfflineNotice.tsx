/**
 * Offline notice component
 * Shows a banner when device is offline
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks';
import { API_BASE_URL, API_BASE_URL_READY } from '@/src/config/env';

export const OfflineNotice: React.FC = () => {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const checkNetwork = async () => {
      if (!API_BASE_URL_READY) {
        setIsOffline(false);
        return;
      }
      try {
        await fetch(API_BASE_URL, {
          method: 'HEAD',
          cache: 'no-cache',
        });
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    const interval = setInterval(checkNetwork, 5000);
    checkNetwork(); // Initial check

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, isOffline]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Feather name="wifi-off" size={16} color="#ffffff" />
        <Text style={styles.text}>Offline mode: showing cached data where available</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
