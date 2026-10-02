import { StyleSheet, Text, View } from 'react-native';
import { TextField } from '@/components/textField';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import { digitsOnly } from '@/utils/validators';

const MOBILE_LENGTH = 10;

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  valid?: boolean;
  testID?: string;
}

export function PhoneInput({
  label = 'Mobile number',
  value,
  onChangeText,
  onBlur,
  error,
  valid = false,
  testID,
}: PhoneInputProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={(text) => onChangeText(digitsOnly(text, MOBILE_LENGTH))}
      onBlur={onBlur}
      error={error}
      valid={valid}
      testID={testID}
      keyboardType="number-pad"
      placeholder="98765 43210"
      maxLength={MOBILE_LENGTH}
      textContentType="telephoneNumber"
      returnKeyType="next"
      left={
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
      }
      right={
        valid && !error ? <Feather name="check-circle" size={SIZES.font18} color={colors.success} /> : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  prefix: {
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  prefixText: { ...typography.bodyMedium, color: colors.primary },
});
