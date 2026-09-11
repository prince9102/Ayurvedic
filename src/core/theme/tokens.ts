export const lightColors = {
  primary: '#2D6A4F',
  primaryLight: '#40916C',
  primaryDark: '#1B4332',
  secondary: '#D4A373',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6C757D',
  textInverse: '#FFFFFF',
  border: '#E9ECEF',
  error: '#DC3545',
  warning: '#FFC107',
  success: '#28A745',
  info: '#17A2B8',
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: '#FFFFFF',
  card: '#FFFFFF',
  disabled: '#ADB5BD',
};

export const darkColors = {
  primary: '#52B788',
  primaryLight: '#74C69D',
  primaryDark: '#2D6A4F',
  secondary: '#E9C46A',
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',
  text: '#F0F6FC',
  textSecondary: '#8B949E',
  textInverse: '#0D1117',
  border: '#30363D',
  error: '#F85149',
  warning: '#D29922',
  success: '#3FB950',
  info: '#58A6FF',
  overlay: 'rgba(0,0,0,0.7)',
  tabBar: '#161B22',
  card: '#21262D',
  disabled: '#484F58',
};

export type ColorScheme = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
};
