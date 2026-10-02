import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../errors/apiError';
import { prisma } from '../../config/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  isVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signAccessToken(user: { id: string; email: string }): string {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, env.jwt.secret);
  } catch (error) {
    const expired = error instanceof jwt.TokenExpiredError;
    throw ApiError.unauthorized(
      expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      expired ? 'Your session has expired, please sign in again' : 'Session is invalid, please sign in again',
    );
  }

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw ApiError.unauthorized('INVALID_TOKEN', 'Session is invalid, please sign in again');
  }

  return { sub: decoded.sub, email: String((decoded as jwt.JwtPayload).email ?? '') };
}

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = bearerToken(req);
    if (!token) {
      throw ApiError.unauthorized('UNAUTHENTICATED', 'Please sign in to continue');
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, isVerified: true },
    });

    if (!user) {
      throw ApiError.unauthorized('UNAUTHENTICATED', 'Please sign in to continue');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireVerified(req: Request, _res: Response, next: NextFunction): void {
  if (req.user && !req.user.isVerified) {
    next(ApiError.forbidden('UNVERIFIED', 'Email verification required'));
    return;
  }
  next();
}
