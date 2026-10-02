import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SIZE=60

export function SplashView() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>P</Text>
      </View>
      <Text style={styles.brand}>PadosiPro</Text>
      <ActivityIndicator size={'large'} color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  mark: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE/2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { ...typography.title, color: colors.white },
  brand: { ...typography.sectionTitle, color: colors.text },
  spinner: { position:"absolute",bottom:100,},
});
