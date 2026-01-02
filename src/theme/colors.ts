export const darkColors = {
  background: '#050505',
  card: '#121212',
  cardElevated: '#1a1a1a',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
  surface: '#121212',
  surfaceHighlight: '#1E1E1E',
  
  primary: '#1337ec',
  primaryLight: 'rgba(19, 55, 236, 0.15)',
  primaryBorder: 'rgba(19, 55, 236, 0.25)',
  
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  emerald: '#34d399',
  emeraldLight: 'rgba(52, 211, 153, 0.15)',
  emeraldBorder: 'rgba(52, 211, 153, 0.25)',
  
  amber: '#fbbf24',
  amberLight: 'rgba(251, 191, 36, 0.15)',
  amberBorder: 'rgba(251, 191, 36, 0.3)',
  
  blue: '#3b82f6',
  blueLight: 'rgba(59, 130, 246, 0.15)',
  
  red: '#ef4444',
  redLight: 'rgba(239, 68, 68, 0.15)',
  
  violet: '#7c3aed',
  violetLight: 'rgba(124, 58, 237, 0.15)',
  
  yellow: '#eab308',
  yellowLight: 'rgba(234, 179, 8, 0.15)',
  
  border: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  tabBar: '#050505',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
  inputBackground: '#121212',
  
  shadow: 'rgba(19, 55, 236, 0.15)',
  shadowGlow: 'rgba(19, 55, 236, 0.25)',
};

export const lightColors = {
  background: '#f6f6f8',
  card: '#ffffff',
  cardElevated: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  surface: '#ffffff',
  surfaceHighlight: '#f0f0f0',
  
  primary: '#1337ec',
  primaryLight: 'rgba(19, 55, 236, 0.1)',
  primaryBorder: 'rgba(19, 55, 236, 0.2)',
  
  text: '#0f172a',
  textSecondary: 'rgba(0, 0, 0, 0.55)',
  textMuted: 'rgba(0, 0, 0, 0.4)',
  
  emerald: '#059669',
  emeraldLight: 'rgba(5, 150, 105, 0.12)',
  emeraldBorder: 'rgba(5, 150, 105, 0.2)',
  
  amber: '#d97706',
  amberLight: 'rgba(217, 119, 6, 0.12)',
  amberBorder: 'rgba(217, 119, 6, 0.2)',
  
  blue: '#2563eb',
  blueLight: 'rgba(37, 99, 235, 0.12)',
  
  red: '#dc2626',
  redLight: 'rgba(220, 38, 38, 0.12)',
  
  violet: '#7c3aed',
  violetLight: 'rgba(124, 58, 237, 0.12)',
  
  yellow: '#ca8a04',
  yellowLight: 'rgba(202, 138, 4, 0.12)',
  
  border: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  inputBackground: '#f0f0f2',
  
  shadow: 'rgba(19, 55, 236, 0.1)',
  shadowGlow: 'rgba(19, 55, 236, 0.15)',
};

export const colors = darkColors;

export type ThemeColors = typeof darkColors;

export const gradients = {
  primary: ['rgba(19, 55, 236, 0.25)', 'rgba(19, 55, 236, 0.1)', 'rgba(19, 55, 236, 0.05)'],
  emerald: ['rgba(52, 211, 153, 0.12)', 'rgba(52, 211, 153, 0.04)'],
  amber: ['rgba(251, 191, 36, 0.12)', 'rgba(251, 191, 36, 0.04)'],
  card: ['#1a1a1a', '#121212'],
};

export const lightGradients = {
  primary: ['rgba(19, 55, 236, 0.15)', 'rgba(19, 55, 236, 0.06)', 'rgba(19, 55, 236, 0.02)'],
  emerald: ['rgba(5, 150, 105, 0.1)', 'rgba(5, 150, 105, 0.03)'],
  amber: ['rgba(217, 119, 6, 0.1)', 'rgba(217, 119, 6, 0.03)'],
  card: ['#ffffff', '#f8f8fa'],
};
