import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { clamp } from '@/src/lib/format';
import { colors, fonts, radius, shadows, spacing } from '@/src/theme/tokens';

type Accent = 'emerald' | 'indigo' | 'coral' | 'muted';

const accentColor: Record<Accent, string> = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
  muted: colors.obsidian400,
};

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={[colors.obsidian950, colors.obsidian900, colors.obsidian950]}
      locations={[0, 0.54, 1]}
      style={styles.background}>
      <View style={[styles.ambientGlow, styles.ambientEmerald]} />
      <View style={[styles.ambientGlow, styles.ambientIndigo]} />
      {children}
    </LinearGradient>
  );
}

export function BrandMark({ size = 42 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[colors.emerald600, colors.emerald400]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.brandMark,
        {
          width: size,
          height: size,
          borderRadius: Math.max(10, size * 0.28),
        },
      ]}>
      <Text style={[styles.brandText, { fontSize: size * 0.42 }]}>mf</Text>
    </LinearGradient>
  );
}

export function Card({
  children,
  accent = 'muted',
  style,
}: PropsWithChildren<{ accent?: Accent; style?: StyleProp<ViewStyle> }>) {
  return (
    <View style={[styles.card, { borderColor: `${accentColor[accent]}33` }, style]}>{children}</View>
  );
}

export function GradientCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <LinearGradient
      colors={[colors.obsidian900, colors.obsidian850]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientCard, style]}>
      <View style={styles.cardGlow} />
      {children}
    </LinearGradient>
  );
}

export function Eyebrow({ children, accent = 'emerald' }: PropsWithChildren<{ accent?: Accent }>) {
  return <Text style={[styles.eyebrow, { color: accentColor[accent] }]}>{children}</Text>;
}

export function ScreenTitle({
  eyebrow,
  title,
  body,
  accent = 'emerald',
}: {
  eyebrow: string;
  title: string;
  body?: string;
  accent?: Accent;
}) {
  return (
    <View style={styles.titleBlock}>
      <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
      <Text style={styles.screenTitle}>{title}</Text>
      {body ? <Text style={styles.bodyCopy}>{body}</Text> : null}
    </View>
  );
}

export function Pill({ children, accent = 'muted' }: PropsWithChildren<{ accent?: Accent }>) {
  return (
    <View style={[styles.pill, { backgroundColor: `${accentColor[accent]}1A`, borderColor: `${accentColor[accent]}33` }]}>
      <Text style={[styles.pillText, { color: accentColor[accent] }]}>{children}</Text>
    </View>
  );
}

export function ProgressBar({
  value,
  accent = 'emerald',
}: {
  value: number;
  accent?: Exclude<Accent, 'muted'>;
}) {
  const width = clamp(value);
  const gradient: [string, string] = accent === 'emerald'
    ? [colors.emerald500, colors.indigo400]
    : accent === 'indigo'
      ? [colors.indigo500, colors.emerald400]
      : [colors.coral500, colors.indigo400];

  return (
    <View style={styles.progressTrack}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${width}%` }]} />
    </View>
  );
}

export function PrimaryButton({
  children,
  onPress,
  accent = 'emerald',
  disabled = false,
  style,
}: PropsWithChildren<{
  onPress: () => void;
  accent?: Exclude<Accent, 'muted'>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>) {
  const gradient: [string, string] = accent === 'emerald'
    ? [colors.emerald500, colors.emerald400]
    : accent === 'indigo'
      ? [colors.indigo600, colors.indigo400]
      : [colors.coral600, colors.coral400];

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled, style]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.primaryButton, accent === 'emerald' ? shadows.emerald : shadows.indigo]}>
        <Text style={styles.primaryButtonText}>{children}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({
  children,
  onPress,
  accent = 'muted',
  style,
}: PropsWithChildren<{
  onPress: () => void;
  accent?: Accent;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, { borderColor: `${accentColor[accent]}33` }, pressed && styles.pressed, style]}>
      <Text style={[styles.ghostButtonText, { color: accentColor[accent] }]}>{children}</Text>
    </Pressable>
  );
}

export function AmountText({
  children,
  size = 'md',
  color = colors.white,
  style,
}: PropsWithChildren<{ size?: 'sm' | 'md' | 'lg' | 'xl'; color?: string; style?: StyleProp<TextStyle> }>) {
  const fontSize = size === 'xl' ? 34 : size === 'lg' ? 24 : size === 'md' ? 18 : 13;

  return <Text style={[styles.amount, { color, fontSize }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.obsidian950,
  },
  ambientGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.18,
  },
  ambientEmerald: {
    top: -160,
    left: -90,
    backgroundColor: colors.emerald500,
  },
  ambientIndigo: {
    right: -160,
    bottom: -120,
    backgroundColor: colors.indigo500,
  },
  brandMark: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.emerald,
  },
  brandText: {
    color: colors.obsidian950,
    fontFamily: fonts.sansExtraBold,
    letterSpacing: 0,
  },
  card: {
    backgroundColor: 'rgba(10, 14, 20, 0.82)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  gradientCard: {
    borderWidth: 1,
    borderColor: `${colors.emerald500}33`,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.emerald,
  },
  cardGlow: {
    position: 'absolute',
    right: -34,
    bottom: -34,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.emerald500}1A`,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: 0,
  },
  bodyCopy: {
    color: colors.obsidian300,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
  },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: fonts.monoBold,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.obsidian850,
    borderRadius: 999,
    backgroundColor: colors.obsidian950,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.obsidian950,
    fontFamily: fonts.sansExtraBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  ghostButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.obsidian900}CC`,
  },
  ghostButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  amount: {
    fontFamily: fonts.monoBold,
    letterSpacing: 0,
  },
});
