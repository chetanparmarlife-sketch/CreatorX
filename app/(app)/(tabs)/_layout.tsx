import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { useApp } from '@/src/context';
import { useTheme } from '@/src/hooks';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const HomeIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.15 : 0}
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ExploreIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="2"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.1 : 0}
    />
    <Path
      d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.3 : 0}
    />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

const ChatIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.15 : 0}
    />
    <Circle cx="8.5" cy="11.5" r="1" fill={color} />
    <Circle cx="12.5" cy="11.5" r="1" fill={color} />
    <Circle cx="16.5" cy="11.5" r="1" fill={color} />
  </Svg>
);

const WalletIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="15"
      rx="3"
      stroke={color}
      strokeWidth="2"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.1 : 0}
    />
    <Path
      d="M2 10H22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="17" cy="15" r="1.5" fill={color} />
    <Path
      d="M6 5V3C6 2.44772 6.44772 2 7 2H17C17.5523 2 18 2.44772 18 3V5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth="2"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.15 : 0}
    />
    <Path
      d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.1 : 0}
    />
  </Svg>
);

const MoreIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="1.5"
      fill={color}
    />
    <Circle
      cx="6"
      cy="12"
      r="1.5"
      fill={color}
    />
    <Circle
      cx="18"
      cy="12"
      r="1.5"
      fill={color}
    />
  </Svg>
);

const TabLabel = ({ label, focused, activeColor, inactiveColor }: { label: string; focused: boolean; activeColor: string; inactiveColor: string }) => (
  <Text 
    numberOfLines={1}
    ellipsizeMode="tail"
    style={{
      fontSize: 9,
      fontWeight: focused ? '600' : '500',
      letterSpacing: 0.5,
      color: focused ? activeColor : inactiveColor,
      marginTop: 6,
      textAlign: 'center',
      textTransform: 'uppercase',
    }}
  >
    {label}
  </Text>
);

const IconGlow = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => (
  <View style={[
    styles.iconGlowContainer,
    focused && styles.iconGlowActive,
  ]}>
    {children}
  </View>
);

export default function TabsLayout() {
  const { unreadNotificationCount } = useApp();
  const { colors, isDark } = useTheme();

  const navBarBg = isDark ? '#0a0a0a' : '#ffffff';
  const activeColor = isDark ? '#ffffff' : colors.primary;
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: navBarBg,
          borderTopWidth: 0,
          height: 84,
          paddingTop: 18,
          paddingBottom: 14,
          paddingHorizontal: 4,
          position: 'absolute',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
            web: {
              boxShadow: isDark 
                ? '0 -4px 20px rgba(0, 0, 0, 0.5)' 
                : '0 -2px 12px rgba(0, 0, 0, 0.04)',
            },
          }),
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="active-campaigns"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <HomeIcon 
                  size={22} 
                  color={focused ? activeColor : inactiveColor}
                  focused={focused}
                />
              </IconGlow>
              <TabLabel 
                label="Home" 
                focused={focused} 
                activeColor={activeColor} 
                inactiveColor={inactiveColor}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Updates',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <View style={styles.iconWithBadge}>
                  <ChatIcon 
                    size={22} 
                    color={focused ? activeColor : inactiveColor}
                    focused={focused}
                  />
                  {unreadNotificationCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </IconGlow>
              <TabLabel 
                label="Updates" 
                focused={focused} 
                activeColor={activeColor} 
                inactiveColor={inactiveColor}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Money',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <WalletIcon 
                  size={22} 
                  color={focused ? activeColor : inactiveColor}
                  focused={focused}
                />
              </IconGlow>
              <TabLabel 
                label="Money" 
                focused={focused} 
                activeColor={activeColor} 
                inactiveColor={inactiveColor}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <ProfileIcon 
                  size={22} 
                  color={focused ? activeColor : inactiveColor}
                  focused={focused}
                />
              </IconGlow>
              <TabLabel 
                label="Profile" 
                focused={focused} 
                activeColor={activeColor} 
                inactiveColor={inactiveColor}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <MoreIcon 
                  size={22} 
                  color={focused ? activeColor : inactiveColor}
                  focused={focused}
                />
              </IconGlow>
              <TabLabel 
                label="More" 
                focused={focused} 
                activeColor={activeColor} 
                inactiveColor={inactiveColor}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: 2,
    height: 48,
  },
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
  },
  iconGlowContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  iconGlowActive: {
    backgroundColor: 'rgba(19, 55, 236, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#1337ec',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 0 16px rgba(19, 55, 236, 0.4)',
      },
    }),
  },
});
