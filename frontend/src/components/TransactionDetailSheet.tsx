import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Transaction } from '@/src/data/mockFinance';
import { formatInr, formatSignedInr } from '@/src/lib/format';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { GhostButton, Pill, PrimaryButton } from '@/src/components/ui';

type Props = {
  onClose: () => void;
  transaction: Transaction | null;
};

function transactionSign(transaction: Transaction) {
  return transaction.flow === 'inflow' ? transaction.amount : -transaction.amount;
}

export function TransactionDetailSheet({ onClose, transaction }: Props) {
  const finance = useFinance();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const linkedEntries = useMemo(
    () =>
      transaction
        ? finance.transactions.filter((item) => item.linkedTransactionId === transaction.id)
        : [],
    [finance.transactions, transaction],
  );

  const linkedSource = useMemo(
    () =>
      transaction?.linkedTransactionId
        ? finance.transactions.find((item) => item.id === transaction.linkedTransactionId) ?? null
        : null,
    [finance.transactions, transaction],
  );

  const linkedOffsetTotal = useMemo(
    () =>
      transaction
        ? linkedEntries
            .filter((item) => item.flow !== transaction.flow)
            .reduce((sum, item) => sum + item.amount, 0)
        : 0,
    [linkedEntries, transaction],
  );

  const remainingOffset = transaction ? Math.max(0, transaction.amount - linkedOffsetTotal) : 0;
  const isDerivedEntry = transaction?.type === 'Refund' || transaction?.type === 'Adjustment';
  const canReverse = Boolean(transaction && !isDerivedEntry && remainingOffset > 0);
  const canRefund = Boolean(canReverse && transaction?.flow === 'outflow');
  const visible = Boolean(transaction);

  useEffect(() => {
    if (!transaction) {
      setAmount('');
      setNote('');
      setError('');
      return;
    }

    setAmount(remainingOffset > 0 ? String(remainingOffset) : '');
    setNote('');
    setError('');
  }, [remainingOffset, transaction]);

  function resetAndClose() {
    setAmount('');
    setNote('');
    setError('');
    onClose();
  }

  function handleRecord(mode: 'refund' | 'adjustment') {
    if (!transaction) {
      return;
    }

    const numericAmount = Number(amount.replace(/,/g, ''));

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !note.trim()) {
      setError('Enter a valid amount and an audit note.');
      return;
    }

    if (!canReverse || numericAmount > remainingOffset) {
      setError('This transaction has no remaining reversible amount.');
      return;
    }

    if (mode === 'refund' && !canRefund) {
      setError('Refunds are available only for outgoing transactions.');
      return;
    }

    const didRecord = finance.recordTransactionAdjustment({
      transactionId: transaction.id,
      amount: numericAmount,
      mode,
      note,
    });

    if (!didRecord) {
      setError('Unable to record this immutable ledger entry.');
      return;
    }

    resetAndClose();
  }

  return (
    <Modal animationType="fade" onRequestClose={resetAndClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={resetAndClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Immutable Ledger Control</Text>
              <Text numberOfLines={1} style={styles.title}>
                Transaction Detail
              </Text>
            </View>
            <Pressable accessibilityLabel="Close transaction detail" onPress={resetAndClose} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={colors.obsidian300} />
            </Pressable>
          </View>

          {transaction ? (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.amountPanel}>
                <View style={styles.amountHeader}>
                  <Pill accent={transaction.flow === 'inflow' ? 'emerald' : 'coral'}>{transaction.type}</Pill>
                  <Text style={styles.timestamp}>{transaction.timestamp}</Text>
                </View>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text
                  style={[
                    styles.primaryAmount,
                    { color: transaction.flow === 'inflow' ? colors.emerald400 : colors.white },
                  ]}>
                  {formatSignedInr(transactionSign(transaction))}
                </Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailCell}>
                  <Text style={styles.label}>Account</Text>
                  <Text numberOfLines={1} style={styles.detailValue}>
                    {transaction.account}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.label}>Category</Text>
                  <Text numberOfLines={1} style={styles.detailValue}>
                    {transaction.category}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.detailValue}>
                    {transaction.status === 'synced_postgres' ? 'Cloud Synced' : 'Local SQLite'}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.label}>Reversible</Text>
                  <Text style={styles.detailValue}>{formatInr(remainingOffset)}</Text>
                </View>
              </View>

              {linkedSource ? (
                <View style={styles.linkedPanel}>
                  <Text style={styles.label}>Linked Source</Text>
                  <Text numberOfLines={1} style={styles.linkedTitle}>
                    {linkedSource.title}
                  </Text>
                  <Text style={styles.linkedMeta}>{formatSignedInr(transactionSign(linkedSource))}</Text>
                </View>
              ) : null}

              {transaction.note ? (
                <View style={styles.linkedPanel}>
                  <Text style={styles.label}>Audit Note</Text>
                  <Text style={styles.bodyCopy}>{transaction.note}</Text>
                </View>
              ) : null}

              {linkedEntries.length > 0 ? (
                <View style={styles.linkedPanel}>
                  <View style={styles.linkedHeader}>
                    <Text style={styles.label}>Adjustments</Text>
                    <Pill accent="indigo">{linkedEntries.length} entries</Pill>
                  </View>
                  <View style={styles.linkedList}>
                    {linkedEntries.map((item) => (
                      <View key={item.id} style={styles.linkedRow}>
                        <View style={styles.linkedCopy}>
                          <Text numberOfLines={1} style={styles.linkedTitle}>
                            {item.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.linkedMeta}>
                            {item.note ?? item.timestamp}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.linkedAmount,
                            { color: item.flow === 'inflow' ? colors.emerald400 : colors.coral400 },
                          ]}>
                          {formatSignedInr(transactionSign(item))}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {!isDerivedEntry ? (
                <View style={styles.adjustmentPanel}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={setAmount}
                      placeholder="0.00"
                      placeholderTextColor={colors.obsidian500}
                      style={styles.input}
                      value={amount}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Audit Note</Text>
                    <TextInput
                      maxLength={120}
                      multiline
                      onChangeText={setNote}
                      placeholder="Reason for the refund or correction"
                      placeholderTextColor={colors.obsidian500}
                      style={[styles.input, styles.noteInput]}
                      textAlignVertical="top"
                      value={note}
                    />
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <View style={styles.actionRow}>
                    <GhostButton accent="muted" onPress={resetAndClose} style={styles.action}>
                      Cancel
                    </GhostButton>
                    <PrimaryButton
                      accent="emerald"
                      disabled={!canRefund}
                      onPress={() => handleRecord('refund')}
                      style={styles.action}>
                      Record Refund
                    </PrimaryButton>
                  </View>
                  <PrimaryButton
                    accent="indigo"
                    disabled={!canReverse}
                    onPress={() => handleRecord('adjustment')}>
                    Record Adjustment
                  </PrimaryButton>
                </View>
              ) : (
                <GhostButton accent="muted" onPress={resetAndClose}>
                  Done
                </GhostButton>
              )}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 7, 10, 0.72)',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.obsidian800,
    padding: spacing.xl,
    backgroundColor: colors.obsidian950,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.obsidian700,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.emerald400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    letterSpacing: 0,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    backgroundColor: colors.obsidian900,
  },
  content: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  amountPanel: {
    borderWidth: 1,
    borderColor: `${colors.emerald500}33`,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.obsidian900}CC`,
    gap: spacing.sm,
  },
  amountHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  timestamp: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  transactionTitle: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 16,
    letterSpacing: 0,
  },
  primaryAmount: {
    fontFamily: fonts.monoBold,
    fontSize: 26,
    letterSpacing: 0,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailCell: {
    width: '48%',
    minHeight: 64,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: 4,
  },
  label: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  linkedPanel: {
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: spacing.sm,
  },
  linkedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  linkedList: {
    gap: spacing.sm,
  },
  linkedRow: {
    minHeight: 48,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.obsidian850,
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: colors.obsidian950,
    gap: spacing.md,
  },
  linkedCopy: {
    flex: 1,
  },
  linkedTitle: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0,
  },
  linkedMeta: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  linkedAmount: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 0,
  },
  bodyCopy: {
    color: colors.obsidian200,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  adjustmentPanel: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.obsidian900,
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
  },
  noteInput: {
    minHeight: 86,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.coral400,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
});
