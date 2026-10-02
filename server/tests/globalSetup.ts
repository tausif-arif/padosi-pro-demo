import { execSync } from 'node:child_process';
import { testDatabaseUrl } from './dbUrl';

/**
 * Recreates the test database from the schema and loads the task catalogue, so
 * every run starts from a known state. `db push` is used instead of
 * `migrate deploy` so a schema change on a branch needs no extra migration to
 * run the suite.
 */
export default async function globalSetup(): Promise<void> {
  const env = { ...process.env, DATABASE_URL: testDatabaseUrl() };

  execSync('npx prisma db push --skip-generate --force-reset', { stdio: 'ignore', env });
  execSync('npx tsx prisma/seed.ts', { stdio: 'ignore', env });
}
