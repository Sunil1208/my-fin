import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/src/theme/tokens';
import { BrandMark, Card, PrimaryButton } from '@/src/components/ui';
import { useFinance } from '@/src/state/FinanceProvider';

export function LockedState() {
  const { unlockAnonymous } = useFinance();

  return (
    <View style={styles.wrap}>
      <Card accent="emerald" style={styles.card}>
        <BrandMark size={58} />
        <View style={styles.copyBlock}>
          <Text style={styles.title}>No bank scraping. No data brokering. Total clarity.</Text>
          <Text style={styles.body}>
            Start inside an encrypted local workspace. Dummy data is wired now; SQLCipher-backed
            persistence comes in the next implementation pass.
          </Text>
        </View>
        <View style={styles.tags}>
          <Text style={styles.tag}>Local SQLite</Text>
          <Text style={styles.tag}>Offline First</Text>
          <Text style={styles.tag}>Postgres Sync Ready</Text>
        </View>
        <PrimaryButton onPress={unlockAnonymous}>Enter Anonymous Local Space</PrimaryButton>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  copyBlock: {
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.sansExtraBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    letterSpacing: 0,
  },
  body: {
    color: colors.obsidian300,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tag: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.obsidian800,
    borderRadius: 7,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.obsidian900,
    color: colors.obsidian300,
    fontFamily: fonts.mono,
    fontSize: 9,
  },
});
