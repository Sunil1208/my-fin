import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FinanceHeader } from '@/src/components/FinanceHeader';
import { RequireUnlocked } from '@/src/components/RequireUnlocked';
import {
  AppBackground,
  Card,
  GhostButton,
  GradientCard,
  Pill,
  ProgressBar,
  ScreenTitle,
} from '@/src/components/ui';
import { formatInr, formatPercent } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, spacing } from '@/src/theme/tokens';

export default function TripScreen() {
  const finance = useFinance();
  const [usd, setUsd] = useState('150');
  const tripPercent = (finance.trip.spentAllocated / finance.trip.maxBudget) * 100;
  const converted = useMemo(() => Number(usd || 0) * finance.trip.exchangeRate, [finance.trip.exchangeRate, usd]);

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <FinanceHeader />
        <RequireUnlocked>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientCard style={styles.tripHero}>
              <View style={styles.rowBetween}>
                <ScreenTitle
                  accent="indigo"
                  eyebrow="Section 15 Sandbox Space"
                  title={finance.trip.title}
                  body="Activate Trip Mode to default new ledger writes into the isolated vacation workspace."
                />
                <Pill accent={finance.tripActive ? 'emerald' : 'muted'}>
                  {finance.tripActive ? 'Active' : 'Inactive'}
                </Pill>
              </View>
              <GhostButton accent={finance.tripActive ? 'coral' : 'emerald'} onPress={finance.toggleTripMode}>
                {finance.tripActive ? 'Deactivate Trip Mode' : 'Activate Trip Mode'}
              </GhostButton>
            </GradientCard>

            <Card accent="indigo" style={styles.cardStack}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Allocated Trip Wallet</Text>
                <Text style={styles.value}>
                  {formatInr(finance.trip.spentAllocated)} / {formatInr(finance.trip.maxBudget)}
                </Text>
              </View>
              <ProgressBar accent="indigo" value={tripPercent} />
              <View style={styles.rowBetween}>
                <Text style={styles.microText}>{formatPercent(tripPercent)} allocated</Text>
                <Text style={styles.microText}>{formatInr(finance.trip.maxBudget - finance.trip.spentAllocated)} remaining</Text>
              </View>
            </Card>

            <Card style={styles.cardStack}>
              <Text style={styles.cardTitle}>Offline Currency Converter</Text>
              <View style={styles.currencyGrid}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Input USD ($)</Text>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={setUsd}
                    style={styles.input}
                    value={usd}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Estimated INR</Text>
                  <View style={styles.outputField}>
                    <Text style={styles.outputText}>{formatInr(converted, { maximumFractionDigits: 2 })}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.microText}>
                Using system-cached parameters ($1 USD = {formatInr(finance.trip.exchangeRate)}) valid offline.
              </Text>
            </Card>
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
  tripHero: {
    gap: spacing.lg,
    borderColor: `${colors.indigo500}55`,
  },
  rowBetween: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardStack: {
    gap: spacing.md,
  },
  label: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 12,
  },
  microText: {
    color: colors.obsidian400,
    fontFamily: fonts.mono,
    fontSize: 9,
    lineHeight: 15,
  },
  cardTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0,
  },
  currencyGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.obsidian950,
    color: colors.white,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  outputField: {
    height: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.obsidian900,
  },
  outputText: {
    color: colors.emerald400,
    fontFamily: fonts.monoBold,
    fontSize: 12,
  },
});
