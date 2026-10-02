const TEST_DB_NAME = 'padosipro_test';

/** Derives the throwaway test database from whatever dev database is configured. */
export function testDatabaseUrl(): string {
  const base =
    process.env.TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/padosipro?schema=public';
  const url = new URL(base);
  url.pathname = `/${TEST_DB_NAME}`;
  return url.toString();
}
