import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps as NativeTextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';

interface TextFieldProps extends Omit<NativeTextInputProps, 'style'> {
  label?: string;
  error?: string;
  valid?: boolean;
  secure?: boolean;
  hint?: string;
  left?: ReactNode;
  right?: ReactNode;
  testID?: string;
}

export function TextField({
  label,
  error,
  valid = false,
  secure = false,
  hint,
  left,
  right,
  testID,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused]}>
        {left ? <View style={styles.icon}>{left}</View> : null}
        <TextInput
          {...inputProps}
          testID={testID}
          style={styles.input}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secure && !revealed}
          selectionColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setRevealed((current) => !current)}
          >
            <Feather name={revealed ? 'eye-off' : 'eye'} size={SIZES.font18} color={colors.textSubtle} />
          </Pressable>
        ) : right ? (
          <View style={styles.icon}>{right}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint && !valid ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSubtle,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  boxFocused: { borderColor: colors.primary },
  icon: { alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
  hint: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.sm },
});
