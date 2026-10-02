import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography, SIZES } from '@/theme/typography';
import { useToastStore } from '@/store/toastStore';

const VISIBLE_FOR_MS = 3200;

/** Mounted once in App. Any screen or hook reports through showToast(). */
export function Toast() {
  const message = useToastStore((state) => state.message);
  const tone = useToastStore((state) => state.tone);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();
  const [slide] = useState(() => new Animated.Value(0));

  const offset = useMemo(
    () => slide.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
    [slide],
  );

  useEffect(() => {
    if (!message) return;

    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    const timer = setTimeout(hide, VISIBLE_FOR_MS);
    return () => clearTimeout(timer);
  }, [message, hide, slide]);

  if (!message) return null;

  const accent = tone === 'success' ? colors.success : colors.error;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: insets.bottom + spacing.xxl, opacity: slide, transform: [{ translateY: offset }] },
      ]}
    >
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={hide}
        style={styles.toast}
        testID="toast"
      >
        <Feather name={tone === 'success' ? 'check-circle' : 'alert-circle'} size={SIZES.font18} color={accent} />
        <Text style={styles.message}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    position: 'absolute', 
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: spacing.xl
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    shadowColor: colors.soft,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  message: { flex: 1, ...typography.bodyMedium, color: colors.text },
});
