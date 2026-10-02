import { useState } from 'react';
import { Keyboard } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { toAppError, type AppError } from '@/utils/apiError';
import { emailError, passwordRequiredError } from '@/utils/validators';
import { loginUser } from '../api';

import NAVIGATION_STRINGS from '@/constants/navigationStrings';

export type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, typeof NAVIGATION_STRINGS.LOGIN>;

interface FieldErrors {
  email?: string;
  password?: string;
}

export function useLogin(navigation: LoginNavigation) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<AppError | null>(null);

  const submit = async () => {
    Keyboard.dismiss();
    setServerError(null);

    const found: FieldErrors = {
      email: emailError(email),
      password: passwordRequiredError(password),
    };
    setErrors(found);
    if (found.email || found.password) return;

    setSubmitting(true);
    try {
      const session = await loginUser({ email: email.trim(), password });
      await useAuthStore.getState().signIn(session.token, session.user);
    } catch (error) {
      const appError = toAppError(error);
      setServerError(appError);
      showToast(appError.message);

      if (appError.isUnverified) {
        navigation.navigate(NAVIGATION_STRINGS.VERIFY_OTP, { email: email.trim() });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    password,
    errors,
    submitting,
    valid: {
      email: email.length > 0 && emailError(email) === undefined,
      password: password.length > 0,
    },
    fieldErrors: {
      email: serverError?.issueFor('email'),
      password: serverError?.issueFor('password'),
    },
    onChangeEmail: (value: string) => {
      setEmail(value);
      if (touched.email) setErrors((current) => ({ ...current, email: emailError(value) }));
    },
    onBlurEmail: () => {
      setTouched((current) => ({ ...current, email: true }));
      setErrors((current) => ({ ...current, email: emailError(email) }));
    },
    onChangePassword: (value: string) => {
      setPassword(value);
      if (touched.password) setErrors((current) => ({ ...current, password: passwordRequiredError(value) }));
    },
    onBlurPassword: () => {
      setTouched((current) => ({ ...current, password: true }));
      setErrors((current) => ({ ...current, password: passwordRequiredError(password) }));
    },
    onSubmit: submit,
  };
}
