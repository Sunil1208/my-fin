import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/src/theme/tokens';
import { AmountText, Card, Pill } from '@/src/components/ui';

type Props = {
  label: string;
  value: string;
  accent?: 'emerald' | 'indigo' | 'coral' | 'muted';
  detail?: string;
};

export function MetricTile({ label, value, accent = 'muted', detail }: Props) {
  return (
    <Card accent={accent} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Pill accent={accent}>{detail ?? 'Live'}</Pill>
      </View>
      <AmountText size="sm" color={accent === 'coral' ? colors.coral400 : accent === 'indigo' ? colors.indigo400 : colors.white}>
        {value}
      </AmountText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  header: {
    gap: spacing.sm,
  },
  label: {
    color: colors.obsidian400,
    fontFamily: fonts.monoBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
