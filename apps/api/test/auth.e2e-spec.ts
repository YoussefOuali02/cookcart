import request from 'supertest';
import { API_URL, uniqueEmail, AuthResponse, SafeUser } from './utils/test-app';

describe('Auth (e2e)', () => {
  it('registers a new user as CUSTOMER and returns a usable token', async () => {
    const email = uniqueEmail('register');

    const res = await request(API_URL)
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);
    const body = res.body as AuthResponse;

    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user).toMatchObject({ email, role: 'CUSTOMER' });
    expect(
      (body.user as SafeUser & { passwordHash?: string }).passwordHash,
    ).toBeUndefined();

    await request(API_URL)
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(200)
      .expect((meRes) => {
        expect((meRes.body as SafeUser).email).toBe(email);
      });
  });

  it('rejects registering the same email twice', async () => {
    const email = uniqueEmail('dupe');

    await request(API_URL)
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);

    await request(API_URL)
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(409);
  });

  it('rejects registration with an invalid payload', async () => {
    await request(API_URL)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);
  });

  it('logs in with correct credentials and rejects a wrong password', async () => {
    const email = uniqueEmail('login');

    await request(API_URL)
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);

    await request(API_URL)
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(200)
      .expect((res) => {
        expect((res.body as AuthResponse).accessToken).toEqual(
          expect.any(String),
        );
      });

    await request(API_URL)
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('rejects a login for an email that was never registered', async () => {
    await request(API_URL)
      .post('/auth/login')
      .send({ email: uniqueEmail('missing'), password: 'password123' })
      .expect(401);
  });

  it('rejects /auth/me without a token', async () => {
    await request(API_URL).get('/auth/me').expect(401);
  });
});
