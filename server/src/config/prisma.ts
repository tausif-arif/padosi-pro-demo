import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * tsx watch re-evaluates modules on every change; without caching the client on
 * `globalThis` each reload opens a brand new connection pool until Postgres
 * refuses new clients.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ['error'] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  const [result] = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
  if (!result) throw new Error('Database did not respond to a trivial query');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
