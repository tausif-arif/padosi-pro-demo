import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import type { Profile } from '@/types/api';
import { formatMobile } from '@/utils/format';

interface ProfileSummaryProps {
  profile: Profile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.nameRow}>
        <Feather name="map-pin" size={SIZES.font14} color={colors.textSubtle} />
        <Text style={styles.name}>{profile.name}</Text>
      </View>
      {profile.mobileNumber ? <Text style={styles.meta}>{formatMobile(profile.mobileNumber)}</Text> : null}
      {profile.businessName ? <Text style={styles.meta}>{profile.businessName}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xxs,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { ...typography.bodyMedium, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
});
