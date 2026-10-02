import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { LoginScreen, RegisterScreen, VerifyOtpScreen, ProfileScreen, TasksScreen, HomeScreen } from '@/screens';
import { SplashView } from './splashScreen';
import type { RootStackParamList } from '@/navigation/types';
import NAVIGATION_STRINGS from '@/constants/navigationStrings';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  const hasProfile = useAuthStore((state) => state.user?.hasProfile ?? false);
  const isVerified = useAuthStore((state) => state.user?.isVerified ?? false);
  const userEmail = useAuthStore((state) => state.user?.email ?? '');
  const navigation = useNavigation();

  useEffect(() => {
    if (status === 'restoring') return;

    if (status === 'signedOut') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: NAVIGATION_STRINGS.LOGIN }],
        })
      );
    } else if (status === 'signedIn') {
      if (!isVerified) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: NAVIGATION_STRINGS.VERIFY_OTP, params: { email: userEmail } }],
          })
        );
      } else if (hasProfile) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: NAVIGATION_STRINGS.HOME }],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: NAVIGATION_STRINGS.PROFILE, params: { mode: 'firstRun' } }],
          })
        );
      }
    }
  }, [status, hasProfile, isVerified, userEmail, navigation]);

  return (
    <Stack.Navigator
      initialRouteName={NAVIGATION_STRINGS.SPLASH}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name={NAVIGATION_STRINGS.SPLASH} component={SplashView} />
      <Stack.Screen name={NAVIGATION_STRINGS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={NAVIGATION_STRINGS.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={NAVIGATION_STRINGS.VERIFY_OTP} component={VerifyOtpScreen} />
      <Stack.Screen name={NAVIGATION_STRINGS.HOME} component={HomeScreen} />
      <Stack.Screen name={NAVIGATION_STRINGS.TASKS} component={TasksScreen} />
      <Stack.Screen name={NAVIGATION_STRINGS.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
}
