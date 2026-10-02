import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const OTP_LENGTH = 6;
const NON_DIGIT = /\D/g;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps) {
  const boxes = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');

  const focusBox = (index: number) => {
    boxes.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)]?.focus();
  };

  const handleChange = (index: number, text: string) => {
    const typed = text.replace(NON_DIGIT, '');

    // A pasted code arrives in one string, so it is spread across the boxes it
    // covers; per-box maxLength would silently drop everything after box one.
    if (typed.length > 1) {
      const pasted = [...digits.slice(0, index), ...typed, ...digits.slice(index)]
        .join('')
        .slice(0, OTP_LENGTH)
        .trimEnd();
      onChange(pasted);
      focusBox(index + typed.length);
      return;
    }

    const next = [...digits];
    next[index] = typed || ' ';
    onChange(next.join('').trimEnd());
    focusBox(index + (typed ? 1 : -1));
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && digits[index].trim() === '' && index > 0) {
      focusBox(index - 1);
    }
  };

  return (
    <View style={styles.row} accessibilityLabel="One time password">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(node) => {
            boxes.current[index] = node;
          }}
          value={digit.trim()}
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
          style={[styles.box, digit.trim() !== '' && styles.boxFilled]}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          textAlign="center"
          selectTextOnFocus
          testID={`otp-box-${index + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  box: {
    flex: 1,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.title,
  },
  boxFilled: { backgroundColor: colors.primaryTint },
});
