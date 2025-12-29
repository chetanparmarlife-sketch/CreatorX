import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
  },
  h2: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 38,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  xs: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  xxs: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  caption: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
};
