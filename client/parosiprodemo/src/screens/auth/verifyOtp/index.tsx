import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/button';
import { Header } from '@/components/header';
import { Screen } from '@/components/screen';
import type { AuthStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { OtpInput } from './components/otpInput';
import { useVerifyOtp } from './hooks/useVerifyOtp';
import Brand from '@/components/brand';

type Props = NativeStackScreenProps<AuthStackParamList, typeof NAVIGATION_STRINGS.VERIFY_OTP>;

export function VerifyOtpScreen({ navigation, route }: Props) {
  const {
    otp,
    submitting,
    resending,
    canResend,
    resendLabel,
    onChangeOtp,
    onResend,
    onSubmit,
  } = useVerifyOtp(navigation, route.params.email);

  return (
    <Screen scroll center testID="verify-otp-screen">
      <Brand/>
      <Header
        eyebrow="Verify your email"
        title="Enter the 6 digit code"
        subtitle={`We emailed a code to ${route.params.email}.`}
      />

      <View style={styles.field}>
        <Text style={styles.label}>One time password</Text>
        <OtpInput value={otp} onChange={onChangeOtp} />
        <Text style={styles.hint}>The code stays valid for 10 minutes.</Text>
      </View>

      <Button
        label="Verify and continue"
        onPress={onSubmit}
        loading={submitting}
        disabled={otp.length < 6 || resending}
        testID="otp-submit"
      />

      <View style={styles.resendContainer}>
        <Button
          variant="link"
          label={resendLabel}
          onPress={onResend}
          disabled={!canResend || resending}
          loading={resending}
          testID="otp-resend"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
  hint: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.md },
  resendContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
