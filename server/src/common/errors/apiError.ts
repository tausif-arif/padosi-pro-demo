
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(401, code, message, details);
  }

  static forbidden(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(403, code, message, details);
  }

  static notFound(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(404, code, message, details);
  }

  static conflict(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(409, code, message, details);
  }

  static tooManyRequests(code: string, message: string, details?: unknown): ApiError {
    return new ApiError(429, code, message, details);
  }

  static internal(message = 'Something went wrong on our end'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
