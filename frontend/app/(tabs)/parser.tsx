import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FinanceHeader } from '@/src/components/FinanceHeader';
import { RequireUnlocked } from '@/src/components/RequireUnlocked';
import {
  AmountText,
  AppBackground,
  Card,
  GhostButton,
  Pill,
  PrimaryButton,
  ScreenTitle,
} from '@/src/components/ui';
import { mockAlertPayloads } from '@/src/lib/parser';
import { formatInr } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, spacing } from '@/src/theme/tokens';

export default function ParserScreen() {
  const finance = useFinance();
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Waiting for local payload');

  function handleTextChange(value: string) {
    setText(value);
    const parsed = finance.parseAlertText(value);
    setStatus(parsed ? 'On-device regex extraction successful' : 'Waiting for a recognizable SMS or UPI alert');
  }

  function loadDemo(value: string) {
    setText(value);
    const parsed = finance.parseAlertText(value);
    setStatus(parsed ? 'Demo payload matched in local parser' : 'No local match found');
  }

  function clearInput() {
    setText('');
    setStatus('Waiting for local payload');
    finance.clearParser();
  }

  function commit() {
    const committed = finance.commitParsedTransaction();
    setStatus(committed ? 'Committed to local SQLCipher queue' : 'No extracted parameters to commit');
    if (committed) {
      setText('');
    }
  }

  const parsed = finance.parserResult;

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <FinanceHeader />
        <RequireUnlocked>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenTitle
              eyebrow="PRD Module 10 Ingestion"
              title="Smart Regex Parser"
              body="Paste bank alerts, credit card SMS statements, or UPI logs. Tier 1 matching runs entirely on-device."
            />

            <Card style={styles.inputCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Incoming Alert Paste Area</Text>
                <GhostButton accent="coral" onPress={clearInput} style={styles.compactButton}>
                  Flush
                </GhostButton>
              </View>
              <TextInput
                multiline
                onChangeText={handleTextChange}
                placeholder="Paste a bank confirmation notification text..."
                placeholderTextColor={colors.obsidian500}
                style={styles.textArea}
                textAlignVertical="top"
                value={text}
              />
              <View style={styles.demoRow}>
                <GhostButton accent="muted" onPress={() => loadDemo(mockAlertPayloads.hdfcCc)} style={styles.demoButton}>
                  HDFC CC SMS
                </GhostButton>
                <GhostButton accent="muted" onPress={() => loadDemo(mockAlertPayloads.gpayUpi)} style={styles.demoButton}>
                  UPI Alert
                </GhostButton>
              </View>
            </Card>

            <Card accent={parsed?.matchType === 'cc' ? 'coral' : parsed ? 'emerald' : 'muted'} style={styles.outputCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Local Matching Output</Text>
                <Pill accent={parsed?.matchType === 'cc' ? 'coral' : parsed ? 'emerald' : 'muted'}>
                  {parsed ? `${parsed.matchType.toUpperCase()} Match` : 'Waiting'}
                </Pill>
              </View>

              <View style={styles.resultGrid}>
                <View style={styles.resultCell}>
                  <Text style={styles.microLabel}>Parsed Amount</Text>
                  <AmountText size="md">{parsed ? formatInr(parsed.amount, { maximumFractionDigits: 2 }) : '₹0.00'}</AmountText>
                </View>
                <View style={styles.resultCell}>
                  <Text style={styles.microLabel}>Mapped Target</Text>
                  <Text numberOfLines={1} style={styles.resultText}>
                    {parsed?.merchant ?? 'NO TARGET'}
                  </Text>
                </View>
                <View style={styles.resultCell}>
                  <Text style={styles.microLabel}>Allocated Account</Text>
                  <Text numberOfLines={1} style={styles.resultMuted}>
                    {parsed?.sourceAccount ?? 'Unassigned'}
                  </Text>
                </View>
                <View style={styles.resultCell}>
                  <Text style={styles.microLabel}>Target Category</Text>
                  <Text style={styles.resultMuted}>{parsed?.category ?? 'Shopping'}</Text>
                </View>
              </View>

              <PrimaryButton disabled={!parsed} onPress={commit}>
                Commit Entry to Local DB
              </PrimaryButton>
            </Card>

            <Text style={styles.statusText}>{status}</Text>
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
  inputCard: {
    gap: spacing.md,
  },
  outputCard: {
    gap: spacing.lg,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  compactButton: {
    minHeight: 32,
  },
  textArea: {
    minHeight: 118,
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.obsidian950,
    color: colors.obsidian100,
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 19,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoButton: {
    flex: 1,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resultCell: {
    width: '47%',
    gap: 4,
  },
  microLabel: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  resultText: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 12,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  resultMuted: {
    color: colors.obsidian300,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  statusText: {
    color: colors.emerald400,
    fontFamily: fonts.mono,
    fontSize: 10,
    textAlign: 'center',
  },
});
