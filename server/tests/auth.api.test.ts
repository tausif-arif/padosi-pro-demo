import request from 'supertest';
import {
  testApp,
  prisma,
  uniqueEmail,
  createRegisteredUser,
  expireActiveOtp,
  backdateLastSentAt,
  VALID_PASSWORD,
} from './helpers';
import { latestOtpFor } from './mailHelper';

const app = testApp();

describe('POST /auth/register', () => {
  it('creates an unverified user and emails an OTP', async () => {
    const email = uniqueEmail('register');

    const response = await request(app).post('/api/v1/auth/register').send({ email, password: VALID_PASSWORD });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ email, isVerified: false, hasProfile: false });
    expect(await latestOtpFor(email)).toMatch(/^\d{6}$/);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email }, select: { passwordHash: true } });
    expect(stored.passwordHash).not.toContain(VALID_PASSWORD);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('lower cases the email so logins are not case sensitive', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: '  MiXeD@PadosiPro.TEST ', password: VALID_PASSWORD });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(response.body.user.email.toLowerCase());
  });

  it('treats re-registering an unverified email as a fresh registration', async () => {
    const email = uniqueEmail('dup');
    await request(app).post('/api/v1/auth/register').send({ email, password: VALID_PASSWORD }).expect(201);

    const response = await request(app).post('/api/v1/auth/register').send({ email, password: 'NewPassword#1' });

    expect(response.status).toBe(201);
  });

  it('rejects registration if the email is already verified', async () => {
    const user = await createRegisteredUser();
    // Verify the user
    await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);

    const response = await request(app).post('/api/v1/auth/register').send({ email: user.email, password: VALID_PASSWORD });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('EMAIL_TAKEN');
  });

  it.each([
    ['not an email', 'nope', VALID_PASSWORD, 'email'],
    ['a short password', uniqueEmail('weak'), 'abc', 'password'],
    ['a password with no number', uniqueEmail('weak'), 'PasswordOnly', 'password'],
    ['a missing password', uniqueEmail('weak'), undefined, 'password'],
  ])('rejects %s with a field level message', async (_label, email, password, field) => {
    const response = await request(app).post('/api/v1/auth/register').send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
    expect(response.body.details.some((d: { field: string }) => d.field === field)).toBe(true);
  });
});

describe('POST /auth/login', () => {
  it('allows an unverified user to log in but flags them as unverified', async () => {
    const user = await createRegisteredUser();

    const response = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });

    expect(response.status).toBe(200);
    expect(response.body.user.isVerified).toBe(false);
  });

  it('rejects a wrong password with 401 and never says which field was wrong', async () => {
    const user = await createRegisteredUser();
    await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Wr0ngPassword#' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('returns a token for a verified user', async () => {
    const user = await createRegisteredUser();
    await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);

    const response = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });

    expect(response.status).toBe(200);
    expect(response.body.tokenType).toBe('Bearer');
    expect(response.body.token.split('.')).toHaveLength(3);
    expect(response.body.user).toMatchObject({ email: user.email, isVerified: true });

    const decoded = JSON.parse(Buffer.from(response.body.token.split('.')[1], 'base64').toString()) as {
      sub: string;
      exp: number;
    };
    const days = (decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThanOrEqual(7);
  });

  it('rejects an unknown email with the same 401 as a wrong password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail('ghost'), password: VALID_PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /auth/verify-otp', () => {
  it('verifies the right code', async () => {
    const user = await createRegisteredUser();

    const response = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp });

    expect(response.status).toBe(200);
    expect(response.body.user.isVerified).toBe(true);
  });

  it('rejects a wrong code and reports the attempts left', async () => {
    const user = await createRegisteredUser();

    const response = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: '999999' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('OTP_INVALID');
    expect(response.body.details).toMatchObject({ attemptsUsed: 1, attemptsRemaining: 4 });
  });

  it('reports expiry distinctly from a wrong code', async () => {
    const user = await createRegisteredUser();
    await expireActiveOtp(user.id);

    const response = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('OTP_EXPIRED');
  });

  it('locks the code out after 5 wrong attempts', async () => {
    const user = await createRegisteredUser();

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: '000000' }).expect(400);
    }

    const locked = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: '000000' });
    expect(locked.status).toBe(403);
    expect(locked.body.error).toBe('OTP_LOCKED');

    const withRealCode = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp });
    expect(withRealCode.status).toBe(403);
    expect(withRealCode.body.error).toBe('OTP_LOCKED');
  });

  it.each([
    ['a short code', '12345'],
    ['a code with letters', '12ab56'],
    ['an empty code', ''],
  ])('rejects %s at validation time', async (_label, otp) => {
    const user = await createRegisteredUser();

    const response = await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('POST /auth/resend-otp', () => {
  it('sends a new code but honours the 30 second cooldown', async () => {
    const user = await createRegisteredUser();

    const blocked = await request(app).post('/api/v1/auth/resend-otp').send({ email: user.email });

    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe('OTP_RESEND_COOLDOWN');
    expect(blocked.body.details.retryAfter).toBeGreaterThan(0);
    expect(blocked.body.details.retryAfter).toBeLessThanOrEqual(30);

    await backdateLastSentAt(user.id, 31);
    const allowed = await request(app).post('/api/v1/auth/resend-otp').send({ email: user.email });

    expect(allowed.status).toBe(200);
    expect(allowed.body.resendAvailableInSeconds).toBe(30);
    // A resend response must never hand the code back to the caller.
    expect(JSON.stringify(allowed.body)).not.toMatch(/\d{6}/);
  });

  it('refuses to resend for a verified account', async () => {
    const user = await createRegisteredUser();
    await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);

    const response = await request(app).post('/api/v1/auth/resend-otp').send({ email: user.email });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('ALREADY_VERIFIED');
  });
});

describe('GET /auth/me', () => {
  it('needs a token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('UNAUTHENTICATED');
  });

  it('rejects a tampered token', async () => {
    const user = await createRegisteredUser();
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
    expect(user.id).toBeTruthy();
  });

  it('returns the session user for a valid token', async () => {
    const user = await createRegisteredUser();
    await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);
    const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ id: user.id, email: user.email, isVerified: true });
  });
});
