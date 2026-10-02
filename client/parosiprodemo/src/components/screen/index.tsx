import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ScreenProps {
  children: ReactNode;
  /** Turns the body into a scroll view; long forms use this. */
  scroll?: boolean;
  /** Centres the content vertically, which the auth screens want. */
  center?: boolean;
  padded?: boolean;
  footer?: ReactNode;
  testID?: string;
}

export function Screen({ children, scroll = false, center = false, padded = true, footer, testID }: ScreenProps) {
  const body = [padded ? styles.padded : styles.flush, center && styles.center];
  const insets = useSafeAreaInsets();
  
  const paddingTop = Platform.OS === 'web' ? spacing.xl : (Platform.OS === 'android' ? StatusBar.currentHeight : insets.top);

  return (
    <View style={styles.webContainer}>
      <View style={[styles.safeArea, { paddingTop }]} testID={testID}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, body]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: colors.fill,
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  flex: { flex: 1 },
  padded: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  flush: { flexGrow: 1 },
  center: { justifyContent: 'center' },
});
