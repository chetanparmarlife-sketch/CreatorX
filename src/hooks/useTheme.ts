import { useMemo } from 'react';
import { useApp } from '@/src/context';
import { darkColors, lightColors, gradients, lightGradients, ThemeColors } from '@/src/theme/colors';

export interface ThemeResult {
  colors: ThemeColors;
  gradients: typeof gradients;
  isDark: boolean;
}

export function useTheme(): ThemeResult {
  const { darkMode } = useApp();
  
  return useMemo(() => ({
    colors: darkMode ? darkColors : lightColors,
    gradients: darkMode ? gradients : lightGradients,
    isDark: darkMode,
  }), [darkMode]);
}
