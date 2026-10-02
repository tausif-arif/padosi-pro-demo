import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import type { Task } from '@/types/api';

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onPress: (task: Task) => void;
}

export function TaskCard({ task, selected, onPress }: TaskCardProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={task.title}
      onPress={() => onPress(task)}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
      testID={`task-card-${task.id}`}
    >
      <View style={styles.marker}>
        <Feather name={selected ? 'check-circle' : 'circle'} size={SIZES.font20} color={selected ? colors.primary : colors.textSubtle} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{task.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: spacing.xxs },
  title: { ...typography.subtitle, color: colors.text },
  titleSelected: { color: colors.primary },
  description: { ...typography.caption, color: colors.textMuted, lineHeight: 17 },
});
