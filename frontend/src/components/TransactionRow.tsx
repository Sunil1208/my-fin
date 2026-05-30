import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/src/data/mockFinance';
import { formatSignedInr } from '@/src/lib/format';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';

type Props = {
  onPress?: () => void;
  transaction: Transaction;
};

export function TransactionRow({ onPress, transaction }: Props) {
  const isInflow = transaction.flow === 'inflow';
  const isAdjustment = transaction.type === 'Adjustment';
  const statusLabel =
    transaction.type === 'Refund'
      ? 'refund'
      : transaction.type === 'Adjustment'
        ? 'adjust'
        : transaction.status === 'synced_postgres'
          ? 'cloud'
          : 'local';
  const accentColor = isInflow ? colors.emerald400 : isAdjustment ? colors.coral400 : colors.white;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { borderColor: isInflow ? `${colors.emerald500}44` : colors.obsidian800 }]}>
          <Text style={[styles.iconText, { color: isInflow ? colors.emerald400 : colors.coral400 }]}>
            {isInflow ? '+' : '-'}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>
            {transaction.title}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {transaction.account} - {transaction.category}
          </Text>
        </View>
      </View>
      <View style={styles.amountBlock}>
        <Text style={[styles.amount, { color: accentColor }]}>
          {formatSignedInr(isInflow ? transaction.amount : -transaction.amount)}
        </Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${colors.obsidian800}99`,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: `${colors.obsidian900}A6`,
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
  left: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.obsidian950,
  },
  iconText: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
  },
  copy: {
    flex: 1,
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
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  status: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
