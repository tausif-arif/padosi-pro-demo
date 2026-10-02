import request from 'supertest';
import { testApp, createRegisteredUser, fetchCatalogue, taskIdByTitle, signIn } from './helpers';
import { tasks as catalogue } from '../prisma/taskCatalogue';

const app = testApp();

const COURIER = 'Courier Pickup & Drop';
const GROCERIES = 'Grocery Pickup & Restocking';
const PLUMBING = 'Plumbing Repairs & Installations';
const PAINTING = 'Painting & Carpentry Work';

async function signedInToken(): Promise<string> {
  const user = await createRegisteredUser();
  await request(app).post('/api/v1/auth/verify-otp').send({ email: user.email, otp: user.otp }).expect(200);
  return signIn(user.email, user.password);
}

describe('GET /tasks', () => {
  it('serves the whole seeded catalogue with its categories', async () => {
    const token = await signedInToken();

    const response = await request(app).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tasks).toHaveLength(catalogue.length);
    expect(response.body.tasks.length).toBeGreaterThanOrEqual(20);
    expect(response.body.categories).toEqual(
      expect.arrayContaining(['Errands & Daily Tasks', 'Home Services', 'Travel & Tourism', 'Health & Medical']),
    );
    expect(response.body.tasks[0]).toMatchObject({
      id: expect.any(String),
      category: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
    });
  });

  it('filters by free text across title and description', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .get('/api/v1/tasks')
      .query({ search: 'plumbing' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.tasks[0].title).toBe(PLUMBING);
  });

  it('filters by category and matches case insensitively', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .get('/api/v1/tasks')
      .query({ category: 'health & medical' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.tasks).toHaveLength(5);
    expect(response.body.tasks.every((task: { category: string }) => task.category === 'Health & Medical')).toBe(true);
  });

  it('returns an empty list rather than an error when nothing matches', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .get('/api/v1/tasks')
      .query({ search: 'underwater basket weaving' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tasks).toEqual([]);
  });

  it('needs a token', async () => {
    const response = await request(app).get('/api/v1/tasks');
    expect(response.status).toBe(401);
  });
});

describe('POST /tasks/selected', () => {
  it('bulk saves a selection and returns it', async () => {
    const token = await signedInToken();
    const picked = [await taskIdByTitle(token, COURIER), await taskIdByTitle(token, GROCERIES)];

    const response = await request(app)
      .post('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskIds: picked });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.tasks.map((task: { title: string }) => task.title).sort()).toEqual([COURIER, GROCERIES].sort());
  });

  it('de-duplicates ids inside one request', async () => {
    const token = await signedInToken();
    const courier = await taskIdByTitle(token, COURIER);

    const response = await request(app)
      .post('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskIds: [courier, courier, courier] });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
  });

  it('replaces the previous selection when the user changes their mind', async () => {
    const token = await signedInToken();
    const auth = { Authorization: `Bearer ${token}` };
    const courier = await taskIdByTitle(token, COURIER);
    const groceries = await taskIdByTitle(token, GROCERIES);
    const painting = await taskIdByTitle(token, PAINTING);

    await request(app).post('/api/v1/tasks/selected').set(auth).send({ taskIds: [courier, groceries, painting] });
    const response = await request(app).post('/api/v1/tasks/selected').set(auth).send({ taskIds: [groceries] });

    expect(response.body.count).toBe(1);
    const saved = await request(app).get('/api/v1/tasks/selected').set(auth);
    expect(saved.body.tasks).toHaveLength(1);
    expect(saved.body.tasks[0].id).toBe(groceries);
  });

  it('clears the selection when an empty array is sent', async () => {
    const token = await signedInToken();
    const auth = { Authorization: `Bearer ${token}` };
    const courier = await taskIdByTitle(token, COURIER);

    await request(app).post('/api/v1/tasks/selected').set(auth).send({ taskIds: [courier] });
    const cleared = await request(app).post('/api/v1/tasks/selected').set(auth).send({ taskIds: [] });

    expect(cleared.status).toBe(200);
    expect(cleared.body).toMatchObject({ count: 0, tasks: [] });
  });

  it('rejects a task id that does not exist', async () => {
    const token = await signedInToken();

    const response = await request(app)
      .post('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskIds: ['00000000-0000-4000-8000-000000000000'] });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('UNKNOWN_TASKS');
  });

  it.each([
    ['a missing taskIds field', {}],
    ['a non-uuid id', { taskIds: ['not-a-uuid'] }],
    ['a non-array value', { taskIds: 'first' }],
  ])('rejects %s', async (_label, payload) => {
    const token = await signedInToken();

    const response = await request(app)
      .post('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('GET /tasks/selected', () => {
  it('is empty for a brand new account', async () => {
    const token = await signedInToken();

    const response = await request(app).get('/api/v1/tasks/selected').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 0, tasks: [] });
  });

  it('only ever returns the calling user tasks', async () => {
    const first = await signedInToken();
    const second = await signedInToken();
    const courier = await taskIdByTitle(first, COURIER);

    await request(app)
      .post('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${first}`)
      .send({ taskIds: [courier] });

    const other = await request(app)
      .get('/api/v1/tasks/selected')
      .set('Authorization', `Bearer ${second}`);

    expect(other.body).toMatchObject({ count: 0, tasks: [] });
  });

  it('keeps tasks grouped by category in the order they were picked', async () => {
    const token = await signedInToken();
    const auth = { Authorization: `Bearer ${token}` };
    const painting = await taskIdByTitle(token, PAINTING);
    const courier = await taskIdByTitle(token, COURIER);

    await request(app).post('/api/v1/tasks/selected').set(auth).send({ taskIds: [painting, courier] });
    const response = await request(app).get('/api/v1/tasks/selected').set(auth);

    expect(response.body.tasks.map((task: { title: string }) => task.title)).toEqual([PAINTING, COURIER]);
    expect(await fetchCatalogue(token)).toHaveLength(catalogue.length);
  });
});
