import { StyleSheet, Text, View } from 'react-native';

import type { Account } from '@/src/data/mockFinance';
import { formatInr } from '@/src/lib/format';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { Card, Pill } from '@/src/components/ui';

const accentMap = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
} as const;

const accountTypeLabel = {
  bank: 'Bank',
  wallet: 'Wallet',
  'credit-card': 'Credit',
  investment: 'Invest',
} as const;

export function AccountBalanceCard({ account }: { account: Account }) {
  const isCredit = account.type === 'credit-card';

  return (
    <Card accent={account.accent} style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.mark, { borderColor: `${accentMap[account.accent]}44` }]}>
          <View style={[styles.dot, { backgroundColor: accentMap[account.accent] }]} />
        </View>
        <Pill accent={account.accent}>{accountTypeLabel[account.type]}</Pill>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {account.name}
        </Text>
        <Text style={styles.descriptor}>{account.descriptor}</Text>
      </View>
      <Text style={[styles.balance, isCredit && styles.creditBalance]}>
        {isCredit ? `-${formatInr(Math.abs(account.balance))}` : formatInr(account.balance)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 188,
    minHeight: 138,
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.obsidian950,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  copy: {
    gap: 3,
  },
  name: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    letterSpacing: 0,
  },
  descriptor: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  balance: {
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  creditBalance: {
    color: colors.coral400,
  },
});
