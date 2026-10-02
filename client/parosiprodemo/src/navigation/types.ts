import NAVIGATION_STRINGS from '@/constants/navigationStrings';

/** Route params for every screen, so navigation calls stay typed. */
export type AuthStackParamList = {
  [NAVIGATION_STRINGS.LOGIN]: undefined;
  [NAVIGATION_STRINGS.REGISTER]: undefined;
  [NAVIGATION_STRINGS.VERIFY_OTP]: { email: string };
};

export type AppStackParamList = {
  [NAVIGATION_STRINGS.HOME]: undefined;
  [NAVIGATION_STRINGS.TASKS]: undefined;
};

export type ProfileRoute = {
  /** Rendered as a blocking first-run step rather than an editable screen. */
  mode: 'firstRun' | 'edit';
};

export type RootStackParamList = AuthStackParamList & AppStackParamList & { [NAVIGATION_STRINGS.PROFILE]: ProfileRoute } & { [NAVIGATION_STRINGS.SPLASH]: undefined };
