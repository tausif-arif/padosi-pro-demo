import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../errors/apiError';
import { ValidationDetail } from './validationDetail';

type Source = 'body' | 'query' | 'params';

/**
 * Validates a request segment against a zod schema and replaces the raw value
 * with the parsed one, so controllers always receive typed, coerced, trimmed data.
 */
export function validate(schema: ZodTypeAny, source: Source = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(ApiError.badRequest('VALIDATION_ERROR', 'Some fields need your attention', ValidationDetail.from(result.error)));
      return;
    }

    if (source === 'query') {
      // Express 4 exposes req.query as a getter-only property on some versions.
      Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
    } else {
      req[source] = result.data as never;
    }

    next();
  };
}

export function isPrismaKnownError(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export { ZodError };
