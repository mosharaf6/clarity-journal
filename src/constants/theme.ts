// Professional Design System for Clarity Journal

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  
  // Neutral Grays
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Common colors
  white: '#ffffff',
  black: '#000000',
  
  // Mood Colors
  mood: {
    1: '#ef4444', // Very sad - red
    2: '#f97316', // Sad - orange  
    3: '#eab308', // Neutral - yellow
    4: '#22c55e', // Happy - green
    5: '#8b5cf6', // Very happy - purple
  },
  
  // Background Gradients
  gradients: {
    primary: ['#0ea5e9', '#3b82f6'],
    secondary: ['#d946ef', '#c026d3'],
    success: ['#22c55e', '#16a34a'],
    warm: ['#f59e0b', '#ef4444'],
    cool: ['#06b6d4', '#3b82f6'],
  }
};

export const Typography = {
  // Font Families
  primary: 'SF Pro Display', // iOS
  secondary: 'Roboto', // Android
  mono: 'SF Mono',
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Predefined text styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    fontFamily: 'SF Pro Display',
  },
  
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    fontFamily: 'SF Pro Display',
  },
  
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    fontFamily: 'SF Pro Display',
  },
  
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: 'SF Pro Display',
  },
  
  h5: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
    fontFamily: 'SF Pro Display',
  },
  
  h6: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: 'SF Pro Display',
  },
  
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'SF Pro Display',
  },
  
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'SF Pro Display',
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: 'SF Pro Display',
  },
  
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: 'SF Pro Display',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  }
};

// Component-specific theme tokens
export const Components = {
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    borderRadius: BorderRadius.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  input: {
    height: 44,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  }
};
