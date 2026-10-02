/**
 * Tests run against a real Postgres, not a mocked client: the risky logic here
 * (expiry, attempt counters, unique indexes, transactions) lives in the database
 * as much as in the code, so mocking Prisma would prove nothing.
 *
 * A dedicated `padosipro_test` database is created and reset once per run.
 */
import { testDatabaseUrl } from './dbUrl';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDatabaseUrl();
process.env.MAIL_TRANSPORT = 'json';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-value-not-used-anywhere';
process.env.OTP_TTL_MINUTES = '10';
process.env.OTP_MAX_ATTEMPTS = '5';
process.env.OTP_RESEND_COOLDOWN_SECONDS = '30';
// Salt rounds are a security control, not a functional one. 4 keeps the suite
// fast; the production default of 10 is asserted separately in a unit test.
process.env.BCRYPT_SALT_ROUNDS = '4';
