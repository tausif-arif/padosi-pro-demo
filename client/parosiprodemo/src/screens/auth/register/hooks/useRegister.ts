import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { useState } from 'react';
import { Keyboard } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { showToast } from '@/store/toastStore';
import { toAppError, type AppError } from '@/utils/apiError';
import { confirmPasswordError, emailError, newPasswordError } from '@/utils/validators';
import { registerUser } from '../api';

export type RegisterNavigation = NativeStackNavigationProp<AuthStackParamList, typeof NAVIGATION_STRINGS.REGISTER>;

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function useRegister(navigation: RegisterNavigation) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<AppError | null>(null);

  const submit = async () => {
    Keyboard.dismiss();
    setServerError(null);

    const found: FieldErrors = {
      email: emailError(email),
      password: newPasswordError(password),
      confirmPassword: confirmPasswordError(password, confirmPassword),
    };
    setErrors(found);
    if (found.email || found.password || found.confirmPassword) return;

    setSubmitting(true);
    try {
      await registerUser({ email: email.trim(), password });
      navigation.navigate(NAVIGATION_STRINGS.VERIFY_OTP, { email: email.trim() });
    } catch (error) {
      const appError = toAppError(error);
      setServerError(appError);
      showToast(appError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    password,
    confirmPassword,
    errors,
    submitting,
    valid: {
      email: email.length > 0 && emailError(email) === undefined,
      password: password.length > 0 && newPasswordError(password) === undefined,
      confirmPassword:
        confirmPassword.length > 0 && confirmPasswordError(password, confirmPassword) === undefined,
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
      if (touched.password) setErrors((current) => ({ ...current, password: newPasswordError(value) }));
    },
    onBlurPassword: () => {
      setTouched((current) => ({ ...current, password: true }));
      setErrors((current) => ({ ...current, password: newPasswordError(password) }));
    },
    onChangeConfirmPassword: (value: string) => {
      setConfirmPassword(value);
      if (touched.confirmPassword) {
        setErrors((current) => ({ ...current, confirmPassword: confirmPasswordError(password, value) }));
      }
    },
    onBlurConfirmPassword: () => {
      setTouched((current) => ({ ...current, confirmPassword: true }));
      setErrors((current) => ({ ...current, confirmPassword: confirmPasswordError(password, confirmPassword) }));
    },
    onSubmit: submit,
  };
}
