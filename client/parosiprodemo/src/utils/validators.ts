const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/** Mirrors the server rules so the user is told before a request is made. */
export function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return undefined;
}

/** Sign in only checks that something was typed. Strength is a signup rule. */
export function passwordRequiredError(value: string): string | undefined {
  if (!value) return 'Password is required';
  return undefined;
}

export function newPasswordError(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Use at least 8 characters';
  if (!/[a-z]/.test(value)) return 'Add a lowercase letter';
  if (!/[A-Z]/.test(value)) return 'Add an uppercase letter';
  if (!/\d/.test(value)) return 'Add a number';
  return undefined;
}

export function confirmPasswordError(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return undefined;
}

/** Only the 10 digits after +91, because the prefix is fixed in the UI. */
export function mobileError(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Mobile number is required';
  if (digits.length !== 10) return 'Invalid mobile number';
  if (!MOBILE_PATTERN.test(digits)) return 'Invalid mobile number';
  return undefined;
}

export function digitsOnly(value: string, maxLength = 10): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function nameError(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Full name is required';
  if (name.length < 2) return 'Enter at least 2 characters';
  return undefined;
}

export function addressError(value: string): string | undefined {
  const address = value.trim();
  if (!address) return 'Address is required';
  if (address.length < 10) return 'Add a little more detail, at least 10 characters';
  return undefined;
}
