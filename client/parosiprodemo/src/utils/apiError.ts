import { AxiosError, isAxiosError } from 'axios';
import type { ApiErrorBody, FieldIssue, OtpFailureDetails } from '@/types/api';

/** A failed request in the shape screens consume: code, message, retryable, field issues. */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly issues: FieldIssue[];
  readonly retryable: boolean;
  readonly otp: OtpFailureDetails | null;

  constructor(
    code: string,
    message: string,
    status: number,
    issues: FieldIssue[] = [],
    retryable = false,
    otp: OtpFailureDetails | null = null,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.issues = issues;
    this.retryable = retryable;
    this.otp = otp;
  }

  get isUnverified(): boolean {
    return this.code === 'UNVERIFIED';
  }

  get isNetwork(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /** First validation message for a field, if the server sent one. */
  issueFor(field: string): string | undefined {
    return this.issues.find((issue) => issue.field === field)?.message;
  }
}

function asIssues(details: ApiErrorBody['details']): FieldIssue[] {
  return Array.isArray(details) ? details : [];
}

function asOtpDetails(details: ApiErrorBody['details']): OtpFailureDetails | null {
  if (!details || Array.isArray(details)) return null;

  const value = details as Partial<OtpFailureDetails>;
  return {
    attemptsUsed: value.attemptsUsed,
    attemptsRemaining: value.attemptsRemaining,
    retryAfter: value.retryAfter,
  };
}

const OFFLINE_MESSAGE = 'Cannot reach PadosiPro right now. Check your connection and try again.';

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;

    if (!axiosError.response) {
      return new AppError('NETWORK_ERROR', OFFLINE_MESSAGE, 0, [], true);
    }

    const body = axiosError.response.data;
    if (body?.error) {
      return new AppError(
        body.error,
        body.message ?? 'Something went wrong',
        axiosError.response.status,
        asIssues(body.details),
        axiosError.response.status >= 500,
        asOtpDetails(body.details),
      );
    }

    return new AppError('SERVER_ERROR', 'Something went wrong on our end', axiosError.response.status, [], true);
  }

  return new AppError('UNKNOWN_ERROR', 'Something went wrong, please try again', 0, [], true);
}
