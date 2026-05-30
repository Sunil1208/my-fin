import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AccountType } from '@/src/data/mockFinance';
import { type AccountInput, useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { GhostButton, PrimaryButton } from '@/src/components/ui';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const accountTypes: Array<{ label: string; value: AccountType; description: string }> = [
  { label: 'Bank', value: 'bank', description: 'Savings and current accounts' },
  { label: 'Wallet', value: 'wallet', description: 'UPI and digital wallets' },
  { label: 'Credit', value: 'credit-card', description: 'Statement and due cycles' },
  { label: 'Invest', value: 'investment', description: 'Manual asset accounts' },
];

const accentOptions: Array<{ label: string; value: AccountInput['accent']; color: string }> = [
  { label: 'Emerald', value: 'emerald', color: colors.emerald500 },
  { label: 'Indigo', value: 'indigo', color: colors.indigo500 },
  { label: 'Coral', value: 'coral', color: colors.coral500 },
];

export function AccountSetupSheet({ onClose, visible }: Props) {
  const finance = useFinance();
  const [type, setType] = useState<AccountType>('bank');
  const [name, setName] = useState('');
  const [descriptor, setDescriptor] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [billingDay, setBillingDay] = useState('12');
  const [dueDay, setDueDay] = useState('5');
  const [accent, setAccent] = useState<AccountInput['accent']>('emerald');
  const [error, setError] = useState('');

  const selectedType = useMemo(
    () => accountTypes.find((item) => item.value === type) ?? accountTypes[0],
    [type],
  );

  function resetAndClose() {
    setName('');
    setDescriptor('');
    setBalance('');
    setCreditLimit('');
    setBillingDay('12');
    setDueDay('5');
    setType('bank');
    setAccent('emerald');
    setError('');
    onClose();
  }

  function handleSubmit() {
    const didCreate = finance.addAccount({
      name,
      descriptor: descriptor || selectedType.description,
      balance: Number(balance.replace(/,/g, '')),
      type,
      accent,
      creditLimit: Number(creditLimit.replace(/,/g, '')),
      billingDay: Number(billingDay),
      dueDay: Number(dueDay),
    });

    if (!didCreate) {
      setError('Complete the required account fields. Credit cards need limit, billing day, and due day.');
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
              <Text style={styles.eyebrow}>Account Structural Mapping</Text>
              <Text style={styles.title}>New Account</Text>
            </View>
            <Pressable accessibilityLabel="Close account sheet" onPress={resetAndClose} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={colors.obsidian300} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.typeGrid}>
              {accountTypes.map((item) => {
                const isActive = item.value === type;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setType(item.value)}
                    style={[styles.typeCard, isActive && styles.typeCardActive]}>
                    <Text style={[styles.typeLabel, isActive && styles.activeText]}>{item.label}</Text>
                    <Text style={[styles.typeDescription, isActive && styles.activeMuted]}>
                      {item.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Name</Text>
              <TextInput
                maxLength={32}
                onChangeText={setName}
                placeholder="e.g. HDFC Savings"
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descriptor</Text>
              <TextInput
                maxLength={28}
                onChangeText={setDescriptor}
                placeholder={selectedType.description}
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={descriptor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {type === 'credit-card' ? 'Outstanding Balance' : 'Opening Balance'}
              </Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setBalance}
                placeholder="0.00"
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={balance}
              />
            </View>

            {type === 'credit-card' ? (
              <View style={styles.creditGrid}>
                <View style={styles.creditCell}>
                  <Text style={styles.label}>Credit Limit</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setCreditLimit}
                    placeholder="200000"
                    placeholderTextColor={colors.obsidian500}
                    style={styles.input}
                    value={creditLimit}
                  />
                </View>
                <View style={styles.creditCell}>
                  <Text style={styles.label}>Billing Day</Text>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={setBillingDay}
                    style={styles.input}
                    value={billingDay}
                  />
                </View>
                <View style={styles.creditCell}>
                  <Text style={styles.label}>Due Day</Text>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={2}
                    onChangeText={setDueDay}
                    style={styles.input}
                    value={dueDay}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visual Accent</Text>
              <View style={styles.accentRow}>
                {accentOptions.map((item) => {
                  const isActive = item.value === accent;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setAccent(item.value)}
                      style={[styles.accentOption, isActive && { borderColor: item.color }]}>
                      <View style={[styles.swatch, { backgroundColor: item.color }]} />
                      <Text style={[styles.accentLabel, isActive && styles.activeText]}>{item.label}</Text>
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
              <PrimaryButton accent="emerald" onPress={handleSubmit} style={styles.action}>
                Add Account
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
  form: {
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    width: '48%',
    minHeight: 84,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: 4,
  },
  typeCardActive: {
    borderColor: colors.emerald500,
    backgroundColor: `${colors.emerald500}1A`,
  },
  typeLabel: {
    color: colors.obsidian100,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  typeDescription: {
    color: colors.obsidian400,
    fontFamily: fonts.mono,
    fontSize: 9,
    lineHeight: 14,
  },
  activeText: {
    color: colors.white,
  },
  activeMuted: {
    color: colors.obsidian200,
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
  creditGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  creditCell: {
    flex: 1,
    minWidth: 104,
    gap: spacing.sm,
  },
  accentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  accentOption: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    backgroundColor: colors.obsidian900,
    gap: spacing.sm,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accentLabel: {
    color: colors.obsidian300,
    fontFamily: fonts.sansBold,
    fontSize: 11,
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
