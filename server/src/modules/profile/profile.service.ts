import { prisma } from '../../config/prisma';
import { ApiError } from '../../common/errors/apiError';
import type { UpsertProfileInput } from './profile.schema';

export interface ProfileView {
  id: string;
  userId: string;
  name: string;
  mobileNumber: string;
  address: string;
  businessName: string | null;
  updatedAt: Date;
}

function toView(profile: {
  id: string;
  userId: string;
  name: string;
  mobileNumber: string;
  address: string;
  businessName: string | null;
  updatedAt: Date;
}): ProfileView {
  return profile;
}

export async function getProfile(userId: string): Promise<ProfileView | null> {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function saveProfile(userId: string, input: UpsertProfileInput): Promise<ProfileView> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isVerified: true } });
  if (!user) throw ApiError.unauthorized('UNAUTHENTICATED', 'Please sign in to continue');
  if (!user.isVerified) throw ApiError.forbidden('UNVERIFIED', 'Email verification required');

  // Upsert on the unique userId keeps "save my profile" idempotent, which is what
  // the mobile client wants when a user edits and re-submits.
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: { ...input },
  });

  return toView(profile);
}
