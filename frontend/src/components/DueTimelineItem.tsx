import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DueItem } from '@/src/data/mockFinance';
import { formatInr } from '@/src/lib/format';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { Pill } from '@/src/components/ui';

const accentMap = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
} as const;

export function DueTimelineItem({
  item,
  onToggle,
}: {
  item: DueItem;
  onToggle: () => void;
}) {
  const accent = item.settled ? colors.obsidian500 : accentMap[item.accent];

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <Pill accent={item.accent}>{item.settled ? 'Settled' : item.tag}</Pill>
          </View>
          <Text style={styles.meta}>{item.dueLabel}</Text>
        </View>
        <View style={styles.amountBlock}>
          <Text style={[styles.amount, { color: item.direction === 'inflow' ? colors.emerald400 : colors.white }]}>
            {item.direction === 'inflow' ? '+' : '-'} {formatInr(item.amount)}
          </Text>
          <View style={[styles.checkbox, item.settled && styles.checkboxActive]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    paddingLeft: spacing.xl,
  },
  dot: {
    position: 'absolute',
    top: 20,
    left: 0,
    zIndex: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: colors.obsidian950,
  },
  card: {
    minHeight: 72,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.obsidian850,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  meta: {
    color: colors.obsidian400,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  amount: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.obsidian700,
    borderRadius: 5,
    backgroundColor: colors.obsidian950,
  },
  checkboxActive: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emerald500,
  },
});
