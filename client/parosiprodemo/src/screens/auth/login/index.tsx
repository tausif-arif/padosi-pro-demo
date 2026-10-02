import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/button';
import { Header } from '@/components/header';
import { TextField } from '@/components/textField';
import { Screen } from '@/components/screen';
import Brand from '@/components/brand';
import type { AuthStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import { useLogin } from './hooks/useLogin';
import { MaterialIcons } from '@expo/vector-icons';

import NAVIGATION_STRINGS from '@/constants/navigationStrings';

type Props = NativeStackScreenProps<AuthStackParamList, typeof NAVIGATION_STRINGS.LOGIN>;

export function LoginScreen({ navigation }: Props) {
  const {
    email,
    password,
    errors,
    fieldErrors,
    valid,
    submitting,
    onChangeEmail,
    onBlurEmail,
    onChangePassword,
    onBlurPassword,
    onSubmit,
  } = useLogin(navigation);

  return (
    <Screen scroll center testID="login-screen">
      <Brand />
      <Header
        title="Welcome back"
        subtitle="Please enter your details to sign in."
      />

      <TextField
        left={<MaterialIcons name='email' size={SIZES.font20} color={colors.textMuted} />}
        label="Email"
        value={email}
        onChangeText={onChangeEmail}
        onBlur={onBlurEmail}
        keyboardType="email-address"
        placeholder="Enter your email"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email ?? fieldErrors.email}
        valid={valid.email}
        testID="login-email"
      />

      <TextField
        left={<MaterialIcons name='lock' size={SIZES.font20} color={colors.textMuted} />}
        label="Password"
        secure
        placeholder="Enter your password"
        value={password}
        onChangeText={onChangePassword}
        onBlur={onBlurPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        error={errors.password ?? fieldErrors.password}
        valid={valid.password}
        testID="login-password"
      />

      <Button
        label="Continue"
        onPress={onSubmit}
        loading={submitting}
        testID="login-submit"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to PadosiPro?</Text>
        <Button
          variant="link"
          label="Create an account"
          onPress={() => navigation.navigate(NAVIGATION_STRINGS.REGISTER)}
          testID="login-go-register"
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
});
