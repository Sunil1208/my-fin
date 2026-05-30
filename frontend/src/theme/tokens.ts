import { Platform, type ViewStyle } from 'react-native';

export const colors = {
  obsidian50: '#F4F5F6',
  obsidian100: '#E9EAEB',
  obsidian200: '#C7C9CC',
  obsidian300: '#A4A8AD',
  obsidian400: '#606770',
  obsidian500: '#1C2530',
  obsidian700: '#151D28',
  obsidian800: '#111821',
  obsidian850: '#0D131C',
  obsidian900: '#0A0E14',
  obsidian950: '#05070A',
  emerald100: '#D1FAE5',
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',
  indigo100: '#E0E7FF',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  coral100: '#FFE4E6',
  coral400: '#FB7185',
  coral500: '#F43F5E',
  coral600: '#E11D48',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const fonts = {
  sans: 'PlusJakartaSans_500Medium',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function shadow(color: string, opacity: number, blur: number, y: number, elevation: number): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 ${y}px ${blur}px ${hexToRgba(color, opacity)}`,
    } as ViewStyle;
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: blur,
    shadowOffset: { width: 0, height: y },
    elevation,
  };
}

export const shadows = {
  emerald: shadow(colors.emerald500, 0.2, 24, 0, 8),
  indigo: shadow(colors.indigo500, 0.2, 24, 0, 8),
  raised: shadow(colors.black, 0.28, 22, 14, 9),
} as const;
