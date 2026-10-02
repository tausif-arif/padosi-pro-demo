import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../errors/apiError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound('ROUTE_NOT_FOUND', `No route matches ${req.method} ${req.originalUrl}`));
};

/**
 * Single exit point for every error in the app. Clients always receive the same
 * envelope: `{ error, message, details? }`.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const apiError = normalise(error);

  if (apiError.status >= 500) {
    console.error('[error]', error);
  }

  res.status(apiError.status).json({
    error: apiError.code,
    message: apiError.message,
    ...(apiError.details ? { details: apiError.details } : {}),
    ...(env.isProduction || apiError.status < 500 ? {} : { stack: (error as Error).stack }),
  });
};

function normalise(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return ApiError.conflict('DUPLICATE', 'That record already exists');
    }
    if (error.code === 'P2025') {
      return ApiError.notFound('NOT_FOUND', 'The requested record does not exist');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return ApiError.internal('Database query was malformed');
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return ApiError.badRequest('MALFORMED_JSON', 'Request body is not valid JSON');
  }

  return ApiError.internal();
}
