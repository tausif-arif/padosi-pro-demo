import type { RequestHandler } from 'express';
import { env } from '../../config/env';
import { ApiError } from '../errors/apiError';

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  code: string;
}

/**
 * Minimal fixed-window limiter. Enough to blunt OTP/SMTP abuse on a single
 * instance; the trade-off (per-process state, no shared store) is written up
 * in DESIGN.md.
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, options.windowMs);
  sweep.unref();

  return (req, res, next) => {
    if (env.isTest) {
      next();
      return;
    }

    const now = Date.now();
    const key = `${req.ip ?? 'unknown'}:${req.baseUrl}${req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - bucket.count));

    if (bucket.count > options.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      next(ApiError.tooManyRequests(options.code, 'Too many requests, please slow down', { retryAfter }));
      return;
    }

    next();
  };
}
