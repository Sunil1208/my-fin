import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CategoryKind } from '@/src/data/mockFinance';
import { type CategoryInput, useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { GhostButton, Pill, PrimaryButton } from '@/src/components/ui';

type Props = {
  onClose: () => void;
  visible: boolean;
};

const kindOptions: CategoryKind[] = ['Expense', 'Income'];
const accentOptions: Array<{ label: string; value: CategoryInput['accent']; color: string }> = [
  { label: 'Emerald', value: 'emerald', color: colors.emerald500 },
  { label: 'Indigo', value: 'indigo', color: colors.indigo500 },
  { label: 'Coral', value: 'coral', color: colors.coral500 },
];

const accentMap = {
  emerald: colors.emerald500,
  indigo: colors.indigo500,
  coral: colors.coral500,
} as const;

export function CategoryRoutingSheet({ onClose, visible }: Props) {
  const finance = useFinance();
  const [kind, setKind] = useState<CategoryKind>('Expense');
  const [label, setLabel] = useState('');
  const [parent, setParent] = useState('');
  const [accent, setAccent] = useState<CategoryInput['accent']>('emerald');
  const [error, setError] = useState('');

  const visibleCategories = useMemo(
    () => finance.categories.filter((category) => category.kind === kind),
    [finance.categories, kind],
  );

  function resetAndClose() {
    setLabel('');
    setParent('');
    setAccent('emerald');
    setKind('Expense');
    setError('');
    onClose();
  }

  function handleSubmit() {
    const didCreate = finance.addCategory({
      label,
      parent,
      kind,
      accent,
    });

    if (!didCreate) {
      setError('Enter a unique parent and child category for this ledger type.');
      return;
    }

    setLabel('');
    setParent('');
    setError('');
  }

  return (
    <Modal animationType="fade" onRequestClose={resetAndClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={resetAndClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Category Tree Routing</Text>
              <Text style={styles.title}>Ledger Categories</Text>
            </View>
            <Pressable accessibilityLabel="Close category routing" onPress={resetAndClose} style={styles.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={colors.obsidian300} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.segmented}>
              {kindOptions.map((item) => {
                const isActive = item === kind;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setKind(item)}
                    style={[styles.segmentOption, isActive && styles.segmentOptionActive]}>
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent Group</Text>
                <TextInput
                  maxLength={28}
                  onChangeText={setParent}
                  placeholder={kind === 'Expense' ? 'e.g. Food' : 'e.g. Retainers'}
                  placeholderTextColor={colors.obsidian500}
                  style={styles.input}
                  value={parent}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Child Label</Text>
                <TextInput
                  maxLength={32}
                  onChangeText={setLabel}
                  placeholder={kind === 'Expense' ? 'e.g. Coffee' : 'e.g. Consulting'}
                  placeholderTextColor={colors.obsidian500}
                  style={styles.input}
                  value={label}
                />
              </View>
            </View>

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

            <PrimaryButton accent={kind === 'Expense' ? 'indigo' : 'emerald'} onPress={handleSubmit}>
              Add Category Node
            </PrimaryButton>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{kind} Map</Text>
              <Pill accent="muted">{visibleCategories.length} nodes</Pill>
            </View>

            <View style={styles.categoryList}>
              {visibleCategories.map((category) => (
                <View key={category.id} style={[styles.categoryRow, { borderColor: `${accentMap[category.accent]}33` }]}>
                  <View style={[styles.categoryMark, { backgroundColor: accentMap[category.accent] }]} />
                  <View style={styles.categoryCopy}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <Text style={styles.categoryParent}>{category.parent}</Text>
                  </View>
                  <Pill accent={category.isCustom ? 'emerald' : 'muted'}>
                    {category.isCustom ? 'Custom' : 'Default'}
                  </Pill>
                </View>
              ))}
            </View>

            <GhostButton accent="muted" onPress={resetAndClose}>
              Done
            </GhostButton>
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
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
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
  activeText: {
    color: colors.white,
  },
  error: {
    color: colors.coral400,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    textAlign: 'center',
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  listTitle: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryRow: {
    minHeight: 62,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.obsidian900,
    gap: spacing.md,
  },
  categoryMark: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryCopy: {
    flex: 1,
    gap: 3,
  },
  categoryLabel: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  categoryParent: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
