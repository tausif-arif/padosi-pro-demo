import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/button';
import { Header } from '@/components/header';
import { TextField } from '@/components/textField';
import { Loader } from '@/components/loading';
import { Screen } from '@/components/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { PhoneInput } from './components/phoneInput';
import { useProfile } from './hooks/useProfile';

export function ProfileScreen() {
  const {
    email,
    name,
    mobile,
    address,
    businessName,
    errors,
    fieldErrors,
    valid,
    loading,
    submitting,
    onChangeName,
    onBlurName,
    onChangeMobile,
    onBlurMobile,
    onChangeAddress,
    onBlurAddress,
    onChangeBusinessName,
    onSubmit,
    onSignOut,
  } = useProfile();

  if (loading) {
    return (
      <Screen testID="profile-screen">
        <Loader fullScreen label="Loading your profile" />
      </Screen>
    );
  }

  return (
    <Screen scroll testID="profile-screen">
      <Header
        eyebrow="Almost there"
        title="Tell us about you"
        subtitle="Your helper uses these details to reach you before a visit."
      />

      <View style={styles.email}>
        <Text style={styles.emailLabel}>Email</Text>
        <Text style={styles.emailValue}>{email}</Text>
      </View>

      <TextField
        label="Full name"
        value={name}
        placeholder="E.g. Jane Doe"
        onChangeText={onChangeName}
        onBlur={onBlurName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        error={errors.name ?? fieldErrors.name}
        valid={valid.name}
        testID="profile-name"
      />

      <PhoneInput
        value={mobile}
        onChangeText={onChangeMobile}
        onBlur={onBlurMobile}
        error={errors.mobile ?? fieldErrors.mobile}
        valid={valid.mobile}
        testID="profile-mobile"
      />

      <TextField
        label="Address"
        value={address}
        placeholder="Enter your full residential address"
        onChangeText={onChangeAddress}
        onBlur={onBlurAddress}
        multiline
        numberOfLines={3}
        autoCapitalize="sentences"
        error={errors.address ?? fieldErrors.address}
        valid={valid.address}
        testID="profile-address"
      />

      <TextField
        label="Business name (optional)"
        value={businessName}
        onChangeText={onChangeBusinessName}
        autoCapitalize="words"
        placeholder="E.g. PadosiPro Shop"
        hint="Only needed if you book tasks for a shop or an office. You can skip this."
        testID="profile-business-name"
      />

      <Button label="Save and continue" onPress={onSubmit} loading={submitting} testID="profile-submit" />

      <View style={styles.signOut}>
        <Button label="Sign out" onPress={onSignOut} variant="ghost" testID="profile-sign-out" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: { marginBottom: spacing.lg },
  emailLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  emailValue: { ...typography.bodyMedium, color: colors.text },
  signOut: { marginTop: spacing.md, marginBottom: spacing.lg },
});
