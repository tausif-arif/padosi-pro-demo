import request from 'supertest';
import { testApp, createRegisteredUser } from './helpers';

const app = testApp();

async function signedInToken(): Promise<string> {
  const user = await createRegisteredUser();
  await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);
  const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
  return login.body.token as string;
}

const validProfile = {
  name: 'Ananya Sharma',
  mobileNumber: '9876543210',
  address: '12B, Palm Grove Residency, Whitefield, Bengaluru 560066',
  businessName: 'Sharma Interiors',
};

describe('GET /profile', () => {
  it('is null until the user completes the first-login form', async () => {
    const token = await signedInToken();

    const response = await request(app).get('/api/v1/profile').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.profile).toBeNull();
  });

  it('needs a token', async () => {
    const response = await request(app).get('/api/v1/profile');
    expect(response.status).toBe(401);
  });
});

describe('PUT /profile', () => {
  it('saves a profile and normalises the mobile number', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validProfile, mobileNumber: '+91 98765 43210' });

    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      name: validProfile.name,
      mobileNumber: '+919876543210',
      businessName: validProfile.businessName,
    });
  });

  it('accepts a profile without a business name', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rohit Verma', mobileNumber: '9123456780', address: '44 Linking Road, Bandra West, Mumbai 400050' });

    expect(response.status).toBe(200);
    expect(response.body.profile.businessName).toBeNull();
  });

  it('is idempotent, so editing the profile just updates it', async () => {
    const token = await signedInToken();
    await request(app).put('/api/v1/profile').set('Authorization', `Bearer ${token}`).send(validProfile).expect(200);

    const updated = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validProfile, name: 'Ananya S. Sharma' });

    expect(updated.status).toBe(200);
    expect(updated.body.profile.name).toBe('Ananya S. Sharma');
  });

  it.each([
    ['a mobile number that does not start 6-9', { ...validProfile, mobileNumber: '1234567890' }],
    ['a mobile number that is too short', { ...validProfile, mobileNumber: '98765' }],
    ['a mobile number with a country code for another country', { ...validProfile, mobileNumber: '+1 415 555 0100' }],
    ['an empty name', { ...validProfile, name: 'A' }],
    ['a one word address', { ...validProfile, address: 'Bengaluru' }],
  ])('rejects %s', async (_label, payload) => {
    const token = await signedInToken();

    const response = await request(app).put('/api/v1/profile').set('Authorization', `Bearer ${token}`).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('is closed to unverified users', async () => {
    const user = await createRegisteredUser();
    const login = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
    const token = login.body.token as string;
    
    const response = await request(app).put('/api/v1/profile').set('Authorization', `Bearer ${token}`).send(validProfile);
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('UNVERIFIED');
  });
});
