import { StyleSheet, Text, View } from 'react-native';

import { useFinance } from '@/src/state/FinanceProvider';
import { colors, fonts, radius, spacing } from '@/src/theme/tokens';
import { BrandMark, GhostButton, Pill } from '@/src/components/ui';

export function FinanceHeader() {
  const { isUnlocked, lockWorkspace, syncMode, upgradeSync } = useFinance();
  const syncCopy =
    syncMode === 'cloud'
      ? 'Postgres secure synced'
      : syncMode === 'anonymous'
        ? 'Anonymous secure workspace'
        : 'Offline vault closed';

  return (
    <View style={styles.header}>
      <View style={styles.brandWrap}>
        <BrandMark size={40} />
        <View>
          <Text style={styles.brandTitle}>my-fin</Text>
          <Text style={styles.brandSubline}>Financial Operating System</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <Pill accent={syncMode === 'locked' ? 'coral' : 'emerald'}>{syncCopy}</Pill>
        {isUnlocked ? (
          syncMode === 'anonymous' ? (
            <GhostButton accent="indigo" onPress={upgradeSync} style={styles.actionButton}>
              Cloud Sync
            </GhostButton>
          ) : (
            <GhostButton accent="coral" onPress={lockWorkspace} style={styles.actionButton}>
              Lock
            </GhostButton>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.obsidian800}99`,
    backgroundColor: `${colors.obsidian950}E6`,
    gap: spacing.md,
  },
  brandWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  brandTitle: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 22,
    letterSpacing: 0,
  },
  brandSubline: {
    color: colors.emerald400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: -2,
    textTransform: 'uppercase',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 34,
    borderRadius: radius.sm,
  },
});
