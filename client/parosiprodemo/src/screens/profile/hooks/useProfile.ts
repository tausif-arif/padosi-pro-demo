import { useCallback, useEffect, useState } from 'react';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { toAppError, type AppError } from '@/utils/apiError';
import { addressError, digitsOnly, mobileError, nameError } from '@/utils/validators';
import { fetchProfile, saveProfile } from '../api';

interface FieldErrors {
  name?: string;
  mobile?: string;
  address?: string;
}

export function useProfile() {
  const email = useAuthStore((state) => state.user?.email ?? '');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [touched, setTouched] = useState({ name: false, mobile: false, address: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<AppError | null>(null);

  const load = useCallback(
    () =>
      fetchProfile()
        .then((existing) => {
          if (existing) {
            setName(existing.name);
            setMobile(digitsOnly(existing.mobileNumber));
            setAddress(existing.address);
            setBusinessName(existing.businessName ?? '');
          }
          setServerError(null);
          setLoading(false);
        })
        .catch((error: unknown) => {
          const appError = toAppError(error);
          setServerError(appError);
          showToast(appError.message);
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setServerError(null);

    const found: FieldErrors = {
      name: nameError(name),
      mobile: mobileError(mobile),
      address: addressError(address),
    };
    setErrors(found);
    if (found.name || found.mobile || found.address) return;

    const account = useAuthStore.getState().user;
    if (!account) return;

    setSubmitting(true);
    try {
      await saveProfile({
        name: name.trim(),
        mobileNumber: `+91${mobile}`,
        address: address.trim(),
        businessName: businessName.trim() || null,
      });
      await useAuthStore.getState().updateUser({ ...account, hasProfile: true });
      showToast('Profile saved', 'success');
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
    name,
    mobile,
    address,
    businessName,
    errors,
    loading,
    submitting,
    fieldErrors: {
      name: serverError?.issueFor('name'),
      mobile: serverError?.issueFor('mobileNumber'),
      address: serverError?.issueFor('address'),
    },
    valid: {
      name: name.length > 0 && nameError(name) === undefined,
      mobile: mobile.length > 0 && mobileError(mobile) === undefined,
      address: address.length > 0 && addressError(address) === undefined,
    },
    onChangeName: (value: string) => {
      setName(value);
      if (touched.name) setErrors((current) => ({ ...current, name: nameError(value) }));
    },
    onBlurName: () => {
      setTouched((current) => ({ ...current, name: true }));
      setErrors((current) => ({ ...current, name: nameError(name) }));
    },
    onChangeMobile: (value: string) => {
      setMobile(value);
      if (touched.mobile) setErrors((current) => ({ ...current, mobile: mobileError(value) }));
    },
    onBlurMobile: () => {
      setTouched((current) => ({ ...current, mobile: true }));
      setErrors((current) => ({ ...current, mobile: mobileError(mobile) }));
    },
    onChangeAddress: (value: string) => {
      setAddress(value);
      if (touched.address) setErrors((current) => ({ ...current, address: addressError(value) }));
    },
    onBlurAddress: () => {
      setTouched((current) => ({ ...current, address: true }));
      setErrors((current) => ({ ...current, address: addressError(address) }));
    },
    onChangeBusinessName: setBusinessName,
    onSubmit: submit,
    onSignOut: () => {
      void useAuthStore.getState().signOut();
    },
  };
}
