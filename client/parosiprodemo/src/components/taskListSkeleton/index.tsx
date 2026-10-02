import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { card } from '@/theme/styles';
import { spacing } from '@/theme/spacing';

interface TaskListSkeletonProps {
  rows?: number;
}

/** Placeholder cards shown while a list request is in flight. */
export function TaskListSkeleton({ rows = 4 }: TaskListSkeletonProps) {
  return (
    <View style={styles.list} accessibilityLabel="Loading tasks">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.barWide} />
          <View style={styles.barNarrow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { ...card, gap: spacing.sm },
  barWide: { height: 14, borderRadius: 7, backgroundColor: colors.fill, width: '70%' },
  barNarrow: { height: 10, borderRadius: 5, backgroundColor: colors.fill, width: '45%' },
});
