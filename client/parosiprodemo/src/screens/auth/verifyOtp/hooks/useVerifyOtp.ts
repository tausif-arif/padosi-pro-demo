import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { toAppError, type AppError } from '@/utils/apiError';
import { formatCountdown } from '@/utils/format';
import { resendOtp, verifyOtp } from '../api';

export type VerifyOtpNavigation = NativeStackNavigationProp<AuthStackParamList, typeof NAVIGATION_STRINGS.VERIFY_OTP>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function attemptDetail(attemptsRemaining: number | undefined): string {
  if (attemptsRemaining === 0) return 'No attempts left. Request a new code.';
  return `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} left`;
}

export function useVerifyOtp(navigation: VerifyOtpNavigation, email: string) {
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fail = (error: AppError): void => {
    const remaining = error.otp?.attemptsRemaining;
    const retryAfter = error.otp?.retryAfter;

    switch (error.code) {
      case 'OTP_EXPIRED':
        showToast('That code has expired. Request a new one.');
        break;
      case 'OTP_LOCKED':
        showToast('Too many incorrect attempts. Request a new code.');
        break;
      case 'OTP_RESEND_COOLDOWN':
        showToast(`A new code was requested a moment ago. Try again in ${retryAfter ?? 30} seconds.`);
        if (retryAfter !== undefined) setSecondsLeft(retryAfter);
        break;
      default: {
        const msg = error.message;
        if (remaining !== undefined && !msg.toLowerCase().includes('attempt')) {
          showToast(`${msg} ${attemptDetail(remaining)}`);
        } else {
          showToast(msg);
        }
      }
    }
  };

  const submit = async (code: string) => {
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      const session = await verifyOtp(email, code);
      await useAuthStore.getState().signIn(session.token, session.user);
    } catch (error) {
      fail(toAppError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const result = await resendOtp(email);
      setOtp('');
      setSecondsLeft(result.resendAvailableInSeconds);
      showToast(result.message, 'success');
    } catch (error) {
      fail(toAppError(error));
    } finally {
      setResending(false);
    }
  };

  return {
    otp,
    submitting,
    resending,
    canResend: secondsLeft === 0,
    resendLabel: secondsLeft > 0 ? `Resend OTP in ${formatCountdown(secondsLeft)}` : 'Resend OTP',
    onChangeOtp: (value: string) => {
      setOtp(value);
      if (value.length === OTP_LENGTH && !submitting) void submit(value);
    },
    onResend: resend,
    onSubmit: () => submit(otp),
  };
}
