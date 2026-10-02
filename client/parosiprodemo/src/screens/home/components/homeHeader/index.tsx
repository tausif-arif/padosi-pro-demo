import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';

interface HomeHeaderProps {
  name: string;
  onSignOut: () => void;
}

export function HomeHeader({ name, onSignOut }: HomeHeaderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const firstName = name ? name.split(' ')[0] : 'User';

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.greeting}>Hi {firstName}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        hitSlop={12}
        onPress={onSignOut}
        style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
        testID="home-sign-out"
      >
        <Feather name="power" size={SIZES.font16} color={colors.error} />
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.title,
    color: colors.white,
  },
  greeting: { flex: 1, ...typography.sectionTitle, color: colors.text },
  signOut: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  signOutPressed: {
    opacity: 0.6,
  },
  signOutLabel: {
    ...typography.label,
    color: colors.error,
  },
});
