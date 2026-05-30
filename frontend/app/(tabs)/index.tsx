import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountBalanceCard } from '@/src/components/AccountBalanceCard';
import { AccountSetupSheet } from '@/src/components/AccountSetupSheet';
import { CategoryRoutingSheet } from '@/src/components/CategoryRoutingSheet';
import { FinanceHeader } from '@/src/components/FinanceHeader';
import { LockedState } from '@/src/components/LockedState';
import { ManualTransactionSheet } from '@/src/components/ManualTransactionSheet';
import { MetricTile } from '@/src/components/MetricTile';
import { ProfilePreferencesSheet } from '@/src/components/ProfilePreferencesSheet';
import { TransactionDetailSheet } from '@/src/components/TransactionDetailSheet';
import { TransactionRow } from '@/src/components/TransactionRow';
import {
  AmountText,
  AppBackground,
  Card,
  Eyebrow,
  GhostButton,
  GradientCard,
  Pill,
  ProgressBar,
} from '@/src/components/ui';
import { formatInr, formatPercent } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, shadows, spacing } from '@/src/theme/tokens';

export default function DashboardScreen() {
  const finance = useFinance();
  const [entryVisible, setEntryVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const spendingPercent = (finance.currentMonthSpends / finance.spendingCeiling) * 100;
  const categorySummary = useMemo(() => {
    const expenseCount = finance.categories.filter((category) => category.kind === 'Expense').length;
    const incomeCount = finance.categories.filter((category) => category.kind === 'Income').length;
    const customCount = finance.categories.filter((category) => category.isCustom).length;
    const expenseTotals = finance.transactions
      .filter((transaction) => transaction.type === 'Expense')
      .reduce<Record<string, number>>((totals, transaction) => {
        totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
        return totals;
      }, {});
    const topExpense =
      Object.entries(expenseTotals).sort(([, left], [, right]) => right - left)[0] ?? null;

    return {
      expenseCount,
      incomeCount,
      customCount,
      topExpenseLabel: topExpense?.[0] ?? 'No expenses',
      topExpenseAmount: topExpense?.[1] ?? 0,
    };
  }, [finance.categories, finance.transactions]);
  const selectedTransaction = useMemo(
    () => finance.transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [finance.transactions, selectedTransactionId],
  );

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <FinanceHeader />
        {!finance.isUnlocked ? (
          <LockedState />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{finance.profile.initials}</Text>
                </View>
                <View style={styles.profileCopy}>
                  <Text style={styles.profileLabel}>{finance.profile.workspace}</Text>
                  <Text style={styles.profileName}>{finance.profile.name}</Text>
                </View>
                <View style={styles.profileActions}>
                  <Pill accent={finance.tripActive ? 'indigo' : 'emerald'}>
                    {finance.tripActive ? 'Trip mode' : 'Local shell'}
                  </Pill>
                  <GhostButton accent="muted" onPress={() => setProfileVisible(true)} style={styles.editProfileButton}>
                    Edit
                  </GhostButton>
                </View>
              </View>

              <Card style={styles.profileMatrix}>
                <View style={styles.profileMatrixCell}>
                  <Text style={styles.profileMatrixLabel}>Currency</Text>
                  <Text style={styles.profileMatrixValue}>{finance.profile.defaultCurrency}</Text>
                </View>
                <View style={styles.profileMatrixCell}>
                  <Text style={styles.profileMatrixLabel}>Cycle Start</Text>
                  <Text style={styles.profileMatrixValue}>Day {finance.profile.cycleStartDay}</Text>
                </View>
                <View style={styles.profileMatrixCell}>
                  <Text style={styles.profileMatrixLabel}>Timezone</Text>
                  <Text numberOfLines={1} style={styles.profileMatrixValue}>
                    {finance.profile.timezone}
                  </Text>
                </View>
              </Card>

              <GradientCard>
                <View style={styles.heroHeader}>
                  <Eyebrow>Net Liquidity (Active 30D)</Eyebrow>
                  <Pill accent="emerald">Formula Active</Pill>
                </View>
                <AmountText size="xl">{formatInr(finance.netLiquidity)}</AmountText>
                <View style={styles.heroBreakdown}>
                  <View style={styles.heroMetric}>
                    <Text style={styles.metricLabel}>Liquid Pool</Text>
                    <Text style={styles.metricValue}>{formatInr(finance.totalLiquidCash)}</Text>
                  </View>
                  <View style={styles.heroMetric}>
                    <Text style={styles.metricLabel}>CC & Due Outflows</Text>
                    <Text style={[styles.metricValue, styles.coralText]}>
                      - {formatInr(finance.activeObligations)}
                    </Text>
                  </View>
                </View>
              </GradientCard>

              <View style={styles.metricGrid}>
                <MetricTile
                  accent="emerald"
                  detail="Assets"
                  label="Investments"
                  value={formatInr(finance.illiquidAssets)}
                />
                <MetricTile
                  accent="indigo"
                  detail="Balanced"
                  label="Net Worth"
                  value={formatInr(finance.netWorth)}
                />
              </View>

              <Card style={styles.budgetCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardLabel}>Monthly Spending Ceiling</Text>
                  <Text style={styles.cardValue}>
                    {formatInr(finance.currentMonthSpends)} / {formatInr(finance.spendingCeiling)}
                  </Text>
                </View>
                <ProgressBar value={spendingPercent} />
                <View style={styles.rowBetween}>
                  <Text style={styles.microText}>{formatPercent(spendingPercent)} velocity paced</Text>
                  <Text style={[styles.microText, styles.emeraldText]}>Safe range confirmed</Text>
                </View>
              </Card>

              <Card style={styles.categoryRoutingCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Category Routing</Text>
                    <Text style={styles.categorySubline}>Expense and income tree nodes</Text>
                  </View>
                  <GhostButton accent="indigo" onPress={() => setCategoryVisible(true)} style={styles.compactButton}>
                    Manage
                  </GhostButton>
                </View>
                <View style={styles.categoryMetricGrid}>
                  <View style={styles.categoryMetric}>
                    <Text style={styles.profileMatrixLabel}>Expense Nodes</Text>
                    <Text style={styles.profileMatrixValue}>{categorySummary.expenseCount}</Text>
                  </View>
                  <View style={styles.categoryMetric}>
                    <Text style={styles.profileMatrixLabel}>Income Nodes</Text>
                    <Text style={styles.profileMatrixValue}>{categorySummary.incomeCount}</Text>
                  </View>
                  <View style={styles.categoryMetric}>
                    <Text style={styles.profileMatrixLabel}>Custom</Text>
                    <Text style={styles.profileMatrixValue}>{categorySummary.customCount}</Text>
                  </View>
                </View>
                <View style={styles.topCategoryRow}>
                  <Text numberOfLines={1} style={styles.topCategoryLabel}>
                    {categorySummary.topExpenseLabel}
                  </Text>
                  <Text style={styles.topCategoryAmount}>{formatInr(categorySummary.topExpenseAmount)}</Text>
                </View>
              </Card>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Account Balance Matrix</Text>
                <GhostButton accent="emerald" onPress={() => setAccountVisible(true)} style={styles.compactButton}>
                  Add Account
                </GhostButton>
              </View>
              <ScrollView
                contentContainerStyle={styles.accountRail}
                horizontal
                showsHorizontalScrollIndicator={false}>
                {finance.accounts.map((account) => (
                  <AccountBalanceCard account={account} key={account.id} />
                ))}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Local SQLite Ledger Feed</Text>
                <Text style={styles.sectionLink}>Continuous journal</Text>
              </View>
              <View style={styles.feed}>
                {finance.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    onPress={() => setSelectedTransactionId(transaction.id)}
                    transaction={transaction}
                  />
                ))}
              </View>
            </ScrollView>

            <Pressable
              accessibilityLabel="Add manual ledger entry"
              onPress={() => setEntryVisible(true)}
              style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={26} tintColor={colors.obsidian950} />
            </Pressable>
            <ManualTransactionSheet onClose={() => setEntryVisible(false)} visible={entryVisible} />
            <AccountSetupSheet onClose={() => setAccountVisible(false)} visible={accountVisible} />
            <ProfilePreferencesSheet onClose={() => setProfileVisible(false)} visible={profileVisible} />
            <CategoryRoutingSheet onClose={() => setCategoryVisible(false)} visible={categoryVisible} />
            <TransactionDetailSheet
              onClose={() => setSelectedTransactionId(null)}
              transaction={selectedTransaction}
            />
          </>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: 96,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.emerald500}33`,
    borderRadius: 12,
    backgroundColor: `${colors.emerald500}1A`,
  },
  avatarText: {
    color: colors.emerald400,
    fontFamily: fonts.sansExtraBold,
    fontSize: 13,
    letterSpacing: 0,
  },
  profileCopy: {
    flex: 1,
  },
  profileLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  profileName: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0,
  },
  profileActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  editProfileButton: {
    minHeight: 30,
    minWidth: 58,
    borderRadius: 10,
  },
  profileMatrix: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  profileMatrixCell: {
    flex: 1,
    gap: 4,
  },
  profileMatrixLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  profileMatrixValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroBreakdown: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `${colors.obsidian800}CC`,
  },
  heroMetric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 0,
  },
  coralText: {
    color: colors.coral400,
  },
  emeraldText: {
    color: colors.emerald400,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  budgetCard: {
    gap: spacing.md,
  },
  categoryRoutingCard: {
    gap: spacing.md,
  },
  categorySubline: {
    color: colors.obsidian400,
    fontFamily: fonts.sans,
    fontSize: 11,
    marginTop: 3,
  },
  categoryMetricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryMetric: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.obsidian850,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.obsidian950,
    gap: 3,
  },
  topCategoryRow: {
    minHeight: 42,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${colors.indigo500}33`,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.indigo500}12`,
    gap: spacing.md,
  },
  topCategoryLabel: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  topCategoryAmount: {
    color: colors.indigo400,
    fontFamily: fonts.monoBold,
    fontSize: 12,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardLabel: {
    flex: 1,
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  microText: {
    color: colors.obsidian400,
    fontFamily: fonts.mono,
    fontSize: 9,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionLink: {
    color: colors.emerald400,
    fontFamily: fonts.sansBold,
    fontSize: 10,
  },
  compactButton: {
    minHeight: 32,
  },
  feed: {
    gap: spacing.sm,
  },
  accountRail: {
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 88,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: colors.emerald500,
    ...shadows.emerald,
  },
  fabPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
