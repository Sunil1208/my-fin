import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Profile } from '@/src/data/mockFinance';
import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { GhostButton, Pill, PrimaryButton } from '@/src/components/ui';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const currencies: Profile['defaultCurrency'][] = ['INR', 'USD', 'EUR', 'GBP'];
const timezoneOptions = ['Asia/Kolkata', 'Etc/UTC', 'America/New_York', 'Europe/London'];

export function ProfilePreferencesSheet({ onClose, visible }: Props) {
  const finance = useFinance();
  const [name, setName] = useState(finance.profile.name);
  const [workspace, setWorkspace] = useState(finance.profile.workspace);
  const [email, setEmail] = useState(finance.profile.email);
  const [currency, setCurrency] = useState<Profile['defaultCurrency']>(finance.profile.defaultCurrency);
  const [timezone, setTimezone] = useState(finance.profile.timezone);
  const [cycleStartDay, setCycleStartDay] = useState(String(finance.profile.cycleStartDay));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(finance.profile.name);
    setWorkspace(finance.profile.workspace);
    setEmail(finance.profile.email);
    setCurrency(finance.profile.defaultCurrency);
    setTimezone(finance.profile.timezone);
    setCycleStartDay(String(finance.profile.cycleStartDay));
    setError('');
  }, [finance.profile, visible]);

  function resetAndClose() {
    setError('');
    onClose();
  }

  function handleSubmit() {
    const didUpdate = finance.updateProfile({
      name,
      workspace,
      email,
      defaultCurrency: currency,
      timezone,
      cycleStartDay: Number(cycleStartDay),
    });

    if (!didUpdate) {
      setError('Enter a valid profile, email, timezone, and cycle day from 1 to 31.');
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
              <Text style={styles.eyebrow}>Profile Matrix</Text>
              <Text style={styles.title}>Workspace Preferences</Text>
            </View>
            <Pressable accessibilityLabel="Close profile preferences" onPress={resetAndClose} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={colors.obsidian300} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                maxLength={48}
                onChangeText={setName}
                placeholder="Sunil Kumar"
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Workspace Label</Text>
              <TextInput
                maxLength={36}
                onChangeText={setWorkspace}
                placeholder="Personal Space"
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={workspace}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={colors.obsidian500}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Default Currency</Text>
              <View style={styles.segmented}>
                {currencies.map((item) => {
                  const isActive = item === currency;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCurrency(item)}
                      style={[styles.segmentOption, isActive && styles.segmentOptionActive]}>
                      <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Timezone</Text>
              <View style={styles.timezoneGrid}>
                {timezoneOptions.map((item) => {
                  const isActive = item === timezone;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setTimezone(item)}
                      style={[styles.timezoneOption, isActive && styles.timezoneOptionActive]}>
                      <Text style={[styles.timezoneText, isActive && styles.activeText]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.cycleRow}>
              <View style={styles.cycleCopy}>
                <Text style={styles.label}>Financial Cycle Start</Text>
                <Text style={styles.helpText}>Day of month used for budget windows.</Text>
              </View>
              <TextInput
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setCycleStartDay}
                style={styles.dayInput}
                value={cycleStartDay}
              />
            </View>

            <View style={styles.previewRow}>
              <Pill accent="emerald">{currency}</Pill>
              <Pill accent="indigo">{timezone}</Pill>
              <Pill accent="muted">Day {cycleStartDay || '-'}</Pill>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <GhostButton accent="muted" onPress={resetAndClose} style={styles.action}>
                Cancel
              </GhostButton>
              <PrimaryButton accent="emerald" onPress={handleSubmit} style={styles.action}>
                Save Profile
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
  timezoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timezoneOption: {
    minHeight: 42,
    width: '48%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.obsidian900,
  },
  timezoneOptionActive: {
    borderColor: colors.indigo500,
    backgroundColor: `${colors.indigo500}1A`,
  },
  timezoneText: {
    color: colors.obsidian200,
    fontFamily: fonts.monoBold,
    fontSize: 10,
  },
  activeText: {
    color: colors.white,
  },
  cycleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cycleCopy: {
    flex: 1,
    gap: 4,
  },
  helpText: {
    color: colors.obsidian400,
    fontFamily: fonts.sans,
    fontSize: 11,
  },
  dayInput: {
    width: 70,
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: radius.md,
    backgroundColor: colors.obsidian900,
    color: colors.white,
    fontFamily: fonts.monoBold,
    fontSize: 16,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
