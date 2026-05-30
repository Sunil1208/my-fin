import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DueTimelineItem } from '@/src/components/DueTimelineItem';
import { FinanceHeader } from '@/src/components/FinanceHeader';
import { RequireUnlocked } from '@/src/components/RequireUnlocked';
import { AppBackground, Card, ScreenTitle } from '@/src/components/ui';
import { formatInr } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, spacing } from '@/src/theme/tokens';

export default function DuesScreen() {
  const finance = useFinance();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <FinanceHeader />
        <RequireUnlocked>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenTitle
              accent="coral"
              eyebrow="Section 12 Reminder Matrix"
              title="Timeline & Dues"
              body="Track SIP schedules, card cycles, peer dues, and obligations due inside the next 30 days."
            />

            <Card accent="coral" style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>Active Outflows</Text>
                <Text style={styles.summaryValue}>{formatInr(finance.activeObligations)}</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Net Liquidity After 30D</Text>
                <Text style={[styles.summaryValue, styles.emeraldText]}>{formatInr(finance.netLiquidity)}</Text>
              </View>
            </Card>

            <View style={styles.timeline}>
              {finance.dues.map((item) => (
                <DueTimelineItem
                  item={item}
                  key={item.id}
                  onToggle={() => finance.toggleDueSettlement(item.id)}
                />
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  summaryLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 16,
    marginTop: 4,
  },
  emeraldText: {
    color: colors.emerald400,
  },
  timeline: {
    gap: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: `${colors.obsidian800}CC`,
    marginLeft: 5,
  },
});
