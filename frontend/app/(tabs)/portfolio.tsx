import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FinanceHeader } from '@/src/components/FinanceHeader';
import { RequireUnlocked } from '@/src/components/RequireUnlocked';
import { AmountText, AppBackground, Card, GradientCard, Pill, ScreenTitle } from '@/src/components/ui';
import { formatInr } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';

const accentMap = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
} as const;

export default function PortfolioScreen() {
  const finance = useFinance();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <FinanceHeader />
        <RequireUnlocked>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenTitle
              accent="indigo"
              eyebrow="Sections 13 and 17 Core Ledger"
              title="Investments & Assets"
              body="Separate daily liquid balances from structural assets like funds, provident fund, and gold."
            />

            <GradientCard style={styles.netWorthCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Absolute Net Worth Index</Text>
                <Pill accent="indigo">Equation Balanced</Pill>
              </View>
              <AmountText size="lg">{formatInr(finance.netWorth)}</AmountText>
              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownCell}>
                  <Text style={styles.microLabel}>Aggregate Assets</Text>
                  <Text style={[styles.breakdownValue, styles.emeraldText]}>{formatInr(finance.aggregateAssets)}</Text>
                </View>
                <View style={styles.breakdownCell}>
                  <Text style={styles.microLabel}>Aggregate Liabilities</Text>
                  <Text style={[styles.breakdownValue, styles.coralText]}>{formatInr(finance.aggregateLiabilities)}</Text>
                </View>
              </View>
            </GradientCard>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Illiquid Asset Base Allocations</Text>
            </View>

            <View style={styles.assetList}>
              {finance.portfolioAssets.map((asset) => (
                <Card key={asset.id} style={styles.assetRow}>
                  <View style={styles.assetCopy}>
                    <View style={[styles.assetMark, { borderColor: `${accentMap[asset.accent]}44` }]}>
                      <View style={[styles.assetDot, { backgroundColor: accentMap[asset.accent] }]} />
                    </View>
                    <View style={styles.assetText}>
                      <Text style={styles.assetTitle}>{asset.title}</Text>
                      <Text style={styles.assetSubtitle}>{asset.subtitle}</Text>
                    </View>
                  </View>
                  <Text style={styles.assetAmount}>{formatInr(asset.amount)}</Text>
                </Card>
              ))}
            </View>
          </ScrollView>
        </RequireUnlocked>
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
  netWorthCard: {
    gap: spacing.md,
    borderColor: `${colors.indigo500}33`,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
    color: colors.indigo400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  breakdownGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.obsidian800,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  breakdownCell: {
    flex: 1,
  },
  microLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  breakdownValue: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    marginTop: 4,
  },
  emeraldText: {
    color: colors.emerald400,
  },
  coralText: {
    color: colors.coral400,
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  assetList: {
    gap: spacing.sm,
  },
  assetRow: {
    minHeight: 70,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  assetCopy: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  assetMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.obsidian950,
  },
  assetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  assetText: {
    flex: 1,
  },
  assetTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  assetSubtitle: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  assetAmount: {
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 12,
  },
});
