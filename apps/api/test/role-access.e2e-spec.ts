import request from 'supertest';
import {
  API_URL,
  uniqueEmail,
  promoteToAdmin,
  AuthResponse,
} from './utils/test-app';

describe('Role access separation (e2e)', () => {
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    const adminReg = await request(API_URL)
      .post('/auth/register')
      .send({ email: uniqueEmail('role-admin'), password: 'password123' })
      .expect(201);
    const adminBody = adminReg.body as AuthResponse;
    await promoteToAdmin(adminBody.user.id);
    const adminLogin = await request(API_URL)
      .post('/auth/login')
      .send({ email: adminBody.user.email, password: 'password123' })
      .expect(200);
    adminToken = (adminLogin.body as AuthResponse).accessToken;

    const customerReg = await request(API_URL)
      .post('/auth/register')
      .send({ email: uniqueEmail('role-customer'), password: 'password123' })
      .expect(201);
    customerToken = (customerReg.body as AuthResponse).accessToken;
  });

  describe('admin accounts cannot act as a customer', () => {
    it('GET /pantry -> 403', async () => {
      await request(API_URL)
        .get('/pantry')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('GET /cart -> 403', async () => {
      await request(API_URL)
        .get('/cart')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('POST /cart/checkout -> 403', async () => {
      await request(API_URL)
        .post('/cart/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('GET /orders -> 403', async () => {
      await request(API_URL)
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });
  });

  describe('customer accounts cannot reach admin routes', () => {
    it('POST /admin/ingredients -> 403', async () => {
      await request(API_URL)
        .post('/admin/ingredients')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Should not be created', defaultUnit: 'g' })
        .expect(403);
    });

    it('POST /admin/meals -> 403', async () => {
      await request(API_URL)
        .post('/admin/meals')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Should not be created' })
        .expect(403);
    });

    it('GET /admin/orders -> 403', async () => {
      await request(API_URL)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe('unauthenticated requests', () => {
    it('are rejected on customer routes', async () => {
      await request(API_URL).get('/cart').expect(401);
      await request(API_URL).get('/pantry').expect(401);
      await request(API_URL).get('/orders').expect(401);
    });

    it('are rejected on admin routes', async () => {
      await request(API_URL).get('/admin/orders').expect(401);
    });

    it('can still browse the public meals list', async () => {
      await request(API_URL).get('/meals').expect(200);
    });
  });
});
