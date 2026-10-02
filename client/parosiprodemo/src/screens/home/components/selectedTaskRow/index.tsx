import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import type { Task } from '@/types/api';

interface SelectedTaskRowProps {
  task: Task;
}

export function SelectedTaskRow({ task }: SelectedTaskRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.check}>
        <Feather name="check-circle" size={SIZES.font20} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  check: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: spacing.xxs },
  title: { ...typography.subtitle, color: colors.text },
  description: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
});
