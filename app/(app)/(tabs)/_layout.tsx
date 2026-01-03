import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet, Text } from 'react-native';
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

const CampaignIcon = ({ size = 24, color = '#888', focused = false }: { size?: number; color?: string; focused?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11V6C4 5.44772 4.44772 5 5 5H14C15.6569 5 17 6.34315 17 8V13C17 14.6569 15.6569 16 14 16H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.08 : 0}
    />
    <Path
      d="M4 11L2.5 10.5V9.5L4 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 16L10.5 20H13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
        name="active-campaigns"
        options={{
          title: 'My Campaign',
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <IconGlow focused={focused}>
                <CampaignIcon 
                  size={22} 
                  color={focused ? activeColor : inactiveColor}
                  focused={focused}
                />
              </IconGlow>
              <TabLabel 
                label="My Campaign" 
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
          href: null,
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
