export type Greeting = 'Good morning' | 'Good afternoon' | 'Good evening';

export function greetingFor(name: string, now: Date = new Date()): string {
  const hour = now.getHours();
  const greeting: Greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  return firstName ? `${greeting}, ${firstName}` : greeting;
}

/** Seconds left, as mm:ss, for the resend button. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : mobile;
}
