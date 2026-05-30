import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CategoryKind } from '@/src/data/mockFinance';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { GhostButton, Pill, PrimaryButton } from '@/src/components/ui';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const typeOptions: CategoryKind[] = ['Expense', 'Income'];

const accentMap = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
} as const;

export function ManualTransactionSheet({ onClose, visible }: Props) {
  const finance = useFinance();
  const [type, setType] = useState<CategoryKind>('Expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(finance.accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const categoryOptions = useMemo(
    () => finance.categories.filter((category) => category.kind === type),
    [finance.categories, type],
  );

  const accountOptions = useMemo(
    () =>
      type === 'Income'
        ? finance.accounts.filter((account) => account.type !== 'credit-card')
        : finance.accounts,
    [finance.accounts, type],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setError('');
    setCategoryId((current) =>
      categoryOptions.some((category) => category.id === current)
        ? current
        : categoryOptions[0]?.id ?? '',
    );
    setAccountId((current) =>
      accountOptions.some((account) => account.id === current) ? current : accountOptions[0]?.id ?? '',
    );
  }, [accountOptions, categoryOptions, visible]);

  function resetAndClose() {
    setTitle('');
    setAmount('');
    setError('');
    onClose();
  }

  function handleSubmit() {
    const numericAmount = Number(amount.replace(/,/g, ''));
    const didCreate = finance.addManualTransaction({
      title,
      amount: numericAmount,
      type,
      accountId,
      categoryId,
    });

    if (!didCreate) {
      setError('Enter a title, amount, account, and matching category.');
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
            <View>
              <Text style={styles.eyebrow}>Atomic Local Mutation</Text>
              <Text style={styles.title}>New Ledger Entry</Text>
            </View>
            <Pressable accessibilityLabel="Close entry sheet" onPress={resetAndClose} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={colors.obsidian300} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.segmented}>
              {typeOptions.map((item) => {
                const isActive = item === type;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setType(item)}
                    style={[styles.segmentOption, isActive && styles.segmentOptionActive]}>
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Merchant / Source</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder={type === 'Expense' ? 'e.g. Blue Tokai Coffee' : 'e.g. Consulting Retainer'}
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={title}
              />
            </View>

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
              <Text style={styles.label}>Account</Text>
              <View style={styles.optionGrid}>
                {accountOptions.map((account) => {
                  const isActive = account.id === accountId;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => setAccountId(account.id)}
                      style={[
                        styles.optionCard,
                        isActive && {
                          borderColor: accentMap[account.accent],
                          backgroundColor: `${accentMap[account.accent]}1A`,
                        },
                      ]}>
                      <Text numberOfLines={1} style={[styles.optionTitle, isActive && styles.optionTitleActive]}>
                        {account.name}
                      </Text>
                      <Text style={styles.optionMeta}>{account.descriptor}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.chipGrid}>
                {categoryOptions.map((category) => {
                  const isActive = category.id === categoryId;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryId(category.id)}
                      style={[
                        styles.categoryChip,
                        isActive && {
                          borderColor: accentMap[category.accent],
                          backgroundColor: `${accentMap[category.accent]}1A`,
                        },
                      ]}>
                      <Pill accent={category.accent}>{category.parent}</Pill>
                      <Text style={[styles.categoryText, isActive && styles.optionTitleActive]}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <GhostButton accent="muted" onPress={resetAndClose} style={styles.action}>
                Cancel
              </GhostButton>
              <PrimaryButton accent={type === 'Income' ? 'emerald' : 'indigo'} onPress={handleSubmit} style={styles.action}>
                Save Locally
              </PrimaryButton>
            </View>
          </ScrollView>
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
    maxHeight: '88%',
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
  form: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: 4,
    backgroundColor: colors.obsidian900,
  },
  segmentOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentOptionActive: {
    backgroundColor: colors.emerald500,
  },
  segmentText: {
    color: colors.obsidian400,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  segmentTextActive: {
    color: colors.obsidian950,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionCard: {
    width: '48%',
    minHeight: 68,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
  },
  optionTitle: {
    color: colors.obsidian100,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  optionTitleActive: {
    color: colors.white,
  },
  optionMeta: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  chipGrid: {
    gap: spacing.sm,
  },
  categoryChip: {
    minHeight: 58,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: spacing.md,
  },
  categoryText: {
    flex: 1,
    color: colors.obsidian200,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    textAlign: 'right',
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
