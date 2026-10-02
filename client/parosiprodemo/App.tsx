import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from '@/components/toast';
import { useAuthStore } from '@/store/authStore';
import { RootNavigator } from '@/navigation/rootNavigator';
import { OfflineModal } from '@/components/offlineModal';
import * as Linking from 'expo-linking';
import NAVIGATION_STRINGS from '@/constants/navigationStrings';

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      [NAVIGATION_STRINGS.SPLASH]: 'splash',
      [NAVIGATION_STRINGS.LOGIN]: 'login',
      [NAVIGATION_STRINGS.REGISTER]: 'register',
      [NAVIGATION_STRINGS.VERIFY_OTP]: 'verify',
      [NAVIGATION_STRINGS.HOME]: '',
      [NAVIGATION_STRINGS.TASKS]: 'tasks',
      [NAVIGATION_STRINGS.PROFILE]: 'profile',
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    void restore();
  }, [restore]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
      <OfflineModal />
    </SafeAreaProvider>
  );
}
