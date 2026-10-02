import type { Request, Response } from 'express';
import * as authService from './auth.service';
import type { LoginInput, RegisterInput, ResendOtpInput, VerifyOtpInput } from './auth.schema';

export async function register(req: Request, res: Response): Promise<void> {
  const { user } = await authService.register(req.body as RegisterInput);
  res.status(201).json({
    user,
    message: 'Account created, we sent a 6 digit code to your email',
  });
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { token, user } = await authService.verifyOtp(req.body as VerifyOtpInput);
  res.json({ token, tokenType: 'Bearer', expiresIn: '7d', user, message: 'Email verified, you can sign in now' });
}

export async function resendOtp(req: Request, res: Response): Promise<void> {
  const result = await authService.resendOtp(req.body as ResendOtpInput);
  res.json({ ...result, message: 'A new code is on its way' });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { token, user } = await authService.login(req.body as LoginInput);
  res.json({ token, tokenType: 'Bearer', expiresIn: '7d', user });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getProfileStatus(req.user!.id);
  res.json({ user });
}
