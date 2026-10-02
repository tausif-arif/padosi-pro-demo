import type { Request, Response } from 'express';
import * as profileService from './profile.service';
import type { UpsertProfileInput } from './profile.schema';

export async function fetchProfile(req: Request, res: Response): Promise<void> {
  const profile = await profileService.getProfile(req.user!.id);
  res.json({ profile });
}

export async function saveProfile(req: Request, res: Response): Promise<void> {
  const profile = await profileService.saveProfile(req.user!.id, req.body as UpsertProfileInput);
  res.json({ profile, message: 'Profile saved' });
}
