import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/button';
import { Header } from '@/components/header';
import { TextField } from '@/components/textField';
import { Screen } from '@/components/screen';
import Brand from '@/components/brand';
import type { AuthStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRegister } from './hooks/useRegister';

type Props = NativeStackScreenProps<AuthStackParamList, typeof NAVIGATION_STRINGS.REGISTER>;

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: '8+ chars', met: password.length >= 8 },
    { label: 'A-Z', met: /[A-Z]/.test(password) },
    { label: 'a-z', met: /[a-z]/.test(password) },
    { label: '0-9', met: /[0-9]/.test(password) },
    { label: 'Special', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <View style={styles.rulesContainer}>
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleRow}>
          <Feather 
            name={rule.met ? 'check' : 'minus'} 
            size={12} 
            color={rule.met ? colors.success : colors.textSubtle} 
          />
          <Text style={[styles.ruleText, rule.met && styles.ruleTextMet]}>
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function RegisterScreen({ navigation }: Props) {
  const {
    email,
    password,
    confirmPassword,
    errors,
    fieldErrors,
    valid,
    submitting,
    onChangeEmail,
    onBlurEmail,
    onChangePassword,
    onBlurPassword,
    onChangeConfirmPassword,
    onBlurConfirmPassword,
    onSubmit,
  } = useRegister(navigation);

  return (
    <Screen scroll center testID="register-screen">
      <Brand />
      <Header
        title="Create your account"
        subtitle="One account for your household, your business, and every task you book."
      />

      <TextField
        label="Email"
        value={email}
        onChangeText={onChangeEmail}
        onBlur={onBlurEmail}
        keyboardType="email-address"
        placeholder="Enter your email address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email ?? fieldErrors.email}
        valid={valid.email}
        testID="register-email"
      />

      <TextField
        label="Password"
        secure
        placeholder="Create a strong password"
        value={password}
        onChangeText={onChangePassword}
        onBlur={onBlurPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password ?? fieldErrors.password}
        valid={valid.password}
        testID="register-password"
      />

      <PasswordRules password={password} />

      <TextField
        label="Confirm password"
        secure
        placeholder="Type your password again"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        onBlur={onBlurConfirmPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.confirmPassword}
        valid={valid.confirmPassword}
        testID="register-confirm-password"
      />

      <Button 
        label="Create account" 
        onPress={onSubmit} 
        loading={submitting} 
        testID="register-submit" 
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Button
          variant="link"
          label="Sign in"
          onPress={() => navigation.navigate(NAVIGATION_STRINGS.LOGIN)}
          testID="register-go-login"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: { ...typography.body, color: colors.textMuted },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 4,
    marginTop: -8,
    marginBottom: spacing.lg,
    paddingHorizontal: 2,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ruleText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  ruleTextMet: {
    color: colors.success,
  },
});
