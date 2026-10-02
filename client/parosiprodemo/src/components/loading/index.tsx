import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface LoaderProps {
  label?: string;
  /** Fills the screen instead of sitting inside a card. */
  fullScreen?: boolean;
}

export function Loader({ label = 'Loading...', fullScreen = false }: LoaderProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  fullScreen: { flex: 1, justifyContent: 'center' },
  label: { ...typography.caption, color: colors.textMuted },
});
