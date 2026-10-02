import { colors } from '@/theme/colors';
import { typography, SIZES } from '@/theme/typography';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Brand: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Feather name="home" size={SIZES.font16} color={colors.white} />
      </View>
      <Text style={styles.brandText}>
        Padosi<Text style={styles.brandPro}>Pro</Text>
      </Text>
    </View>
  );
};

export default Brand;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  iconWrapper: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  brandText: {
    ...typography.title,
    fontSize: SIZES.font24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandPro: {
    color: colors.primary,
  },
});