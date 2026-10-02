import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { register } from '../src/modules/auth/auth.service';
import { latestOtpFor } from './mailHelper';

let app: Express | undefined;

export function testApp(): Express {
  app ??= createApp();
  return app;
}

export async function resetDatabase(): Promise<void> {
  await prisma.userTask.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.emailOtp.deleteMany();
  await prisma.user.deleteMany();
}

let counter = 0;

/** Unique per call so tests never collide on the unique email index. */
export function uniqueEmail(prefix = 'user'): string {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@padosipro.test`;
}

export const VALID_PASSWORD = 'Padosi#2026';

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  otp: string;
}

/** Registers through the real service layer and returns the emailed OTP. */
export async function createRegisteredUser(prefix = 'user'): Promise<RegisteredUser> {
  const email = uniqueEmail(prefix);
  const { user } = await register({ email, password: VALID_PASSWORD });
  return { id: user.id, email, password: VALID_PASSWORD, otp: await latestOtpFor(email) };
}

/** Ages the active OTP's `last_sent_at` so the 30s cooldown can be tested. */
export async function backdateLastSentAt(userId: string, seconds: number): Promise<void> {
  await prisma.emailOtp.updateMany({
    where: { userId, consumedAt: null },
    data: { lastSentAt: new Date(Date.now() - seconds * 1000) },
  });
}

export async function expireActiveOtp(userId: string): Promise<void> {
  await prisma.emailOtp.updateMany({
    where: { userId, consumedAt: null },
    data: { expiresAt: new Date(Date.now() - 60_000) },
  });
}

export interface TaskView {
  id: string;
  category: string;
  title: string;
  description: string;
}

export async function fetchCatalogue(token: string): Promise<TaskView[]> {
  const response = await request(testApp()).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
  return response.body.tasks as TaskView[];
}

/** Resolves a seeded task by its title so tests read like the catalogue does. */
export async function taskIdByTitle(token: string, title: string): Promise<string> {
  const match = (await fetchCatalogue(token)).find((task) => task.title === title);
  if (!match) throw new Error(`No seeded task titled "${title}"`);
  return match.id;
}

export async function signIn(email: string, password: string): Promise<string> {
  const response = await request(testApp()).post('/api/v1/auth/login').send({ email, password });
  return response.body.token as string;
}

export { prisma };
