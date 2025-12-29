export const darkColors = {
  background: '#0a0a0a',
  card: '#141414',
  cardElevated: '#1a1a1a',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  
  primary: '#8b5cf6',
  primaryLight: 'rgba(139, 92, 246, 0.2)',
  primaryBorder: 'rgba(139, 92, 246, 0.3)',
  
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  emerald: '#34d399',
  emeraldLight: 'rgba(52, 211, 153, 0.2)',
  emeraldBorder: 'rgba(52, 211, 153, 0.3)',
  
  amber: '#fbbf24',
  amberLight: 'rgba(251, 191, 36, 0.2)',
  amberBorder: 'rgba(251, 191, 36, 0.3)',
  
  blue: '#3b82f6',
  blueLight: 'rgba(59, 130, 246, 0.2)',
  
  red: '#ef4444',
  redLight: 'rgba(239, 68, 68, 0.2)',
  
  violet: '#7c3aed',
  violetLight: 'rgba(124, 58, 237, 0.2)',
  
  border: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  tabBar: '#0a0a0a',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  inputBackground: '#1a1a1a',
  
  shadow: 'rgba(255, 255, 255, 0.15)',
  shadowGlow: 'rgba(255, 255, 255, 0.25)',
};

export const lightColors = {
  background: '#f5f5f7',
  card: '#ffffff',
  cardElevated: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  
  primary: '#8b5cf6',
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  primaryBorder: 'rgba(139, 92, 246, 0.25)',
  
  text: '#1a1a1a',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textMuted: 'rgba(0, 0, 0, 0.4)',
  
  emerald: '#059669',
  emeraldLight: 'rgba(5, 150, 105, 0.15)',
  emeraldBorder: 'rgba(5, 150, 105, 0.25)',
  
  amber: '#d97706',
  amberLight: 'rgba(217, 119, 6, 0.15)',
  amberBorder: 'rgba(217, 119, 6, 0.25)',
  
  blue: '#2563eb',
  blueLight: 'rgba(37, 99, 235, 0.15)',
  
  red: '#dc2626',
  redLight: 'rgba(220, 38, 38, 0.15)',
  
  violet: '#7c3aed',
  violetLight: 'rgba(124, 58, 237, 0.15)',
  
  border: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  inputBackground: '#f0f0f0',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowGlow: 'rgba(0, 0, 0, 0.15)',
};

export const colors = darkColors;

export type ThemeColors = typeof darkColors;

export const gradients = {
  primary: ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.1)'],
  emerald: ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)'],
  amber: ['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)'],
  card: ['#1a1a1a', '#141414'],
};

export const lightGradients = {
  primary: ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)', 'rgba(124, 58, 237, 0.05)'],
  emerald: ['rgba(5, 150, 105, 0.12)', 'rgba(5, 150, 105, 0.04)'],
  amber: ['rgba(217, 119, 6, 0.12)', 'rgba(217, 119, 6, 0.04)'],
  card: ['#ffffff', '#f8f8f8'],
};
