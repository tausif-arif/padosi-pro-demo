import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'link';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const labelColor = variant === 'primary' ? colors.white : colors.primary;
  const tint =  labelColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'link' && styles.link,
        isDisabled && variant !== 'ghost' && variant !== 'link' && styles.disabled,
        pressed && !isDisabled && variant !== 'link' && styles.pressed,
        pressed && !isDisabled && variant === 'link' && styles.linkPressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={tint} size="small" />
        ) : icon ? (
          <Feather name={icon} size={SIZES.font16} color={tint} />
        ) : null}
        <Text style={[
          styles.label, 
          { color: tint }, 
          variant === 'link' && styles.linkLabel,
          isDisabled && variant === 'link' && styles.linkDisabled
        ]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.fill },
  ghost: { backgroundColor: 'transparent' },
  link: { backgroundColor: 'transparent', minHeight: undefined, paddingHorizontal: 0 },
  disabled: { backgroundColor: colors.disabled },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  linkPressed: { opacity: 0.7 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.button },
  linkLabel: { ...typography.bodyMedium, textDecorationLine: 'underline' },
  linkDisabled: { color: colors.textMuted },
});
