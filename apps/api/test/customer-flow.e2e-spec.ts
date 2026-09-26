import request from 'supertest';
import {
  API_URL,
  uniqueEmail,
  promoteToAdmin,
  AuthResponse,
  OrderWithItems,
  CartResponse,
  MealKitPreview,
} from './utils/test-app';
import type { Ingredient, Meal } from '@prisma/client';

describe('Customer flow: pantry -> preview -> cart -> checkout -> order (e2e)', () => {
  let adminToken: string;
  let customerToken: string;
  let riceId: string;
  let chickenId: string;
  let mealId: string;

  beforeAll(async () => {
    const adminReg = await request(API_URL)
      .post('/auth/register')
      .send({ email: uniqueEmail('flow-admin'), password: 'password123' })
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
      .send({ email: uniqueEmail('flow-customer'), password: 'password123' })
      .expect(201);
    customerToken = (customerReg.body as AuthResponse).accessToken;

    const rice = await request(API_URL)
      .post('/admin/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Rice ${Date.now()}`,
        defaultUnit: 'g',
        pricePerUnit: 2,
      })
      .expect(201);
    riceId = (rice.body as Ingredient).id;

    const chicken = await request(API_URL)
      .post('/admin/ingredients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Chicken ${Date.now()}`,
        defaultUnit: 'g',
        pricePerUnit: 3,
      })
      .expect(201);
    chickenId = (chicken.body as Ingredient).id;

    const meal = await request(API_URL)
      .post('/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Test Bowl ${Date.now()}`, isPublished: true })
      .expect(201);
    mealId = (meal.body as Meal).id;

    // 100g rice @ 2/unit = 200; 100g chicken @ 3/unit = 300; meal total = 500
    await request(API_URL)
      .post(`/admin/meals/${mealId}/ingredients`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ingredientId: riceId, quantity: 100, unit: 'g' })
      .expect(201);
    await request(API_URL)
      .post(`/admin/meals/${mealId}/ingredients`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ingredientId: chickenId, quantity: 100, unit: 'g' })
      .expect(201);
  });

  it('excludes pantry-covered ingredients from the preview-kit price', async () => {
    // Customer already has enough rice at home.
    await request(API_URL)
      .post('/pantry')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ ingredientId: riceId, quantity: 200, unit: 'g' })
      .expect(201);

    const previewRes = await request(API_URL)
      .post(`/meals/${mealId}/preview-kit`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);
    const preview = previewRes.body as MealKitPreview;

    const rice = preview.ingredients.find((i) =>
      i.name.startsWith('Test Rice'),
    );
    const chicken = preview.ingredients.find((i) =>
      i.name.startsWith('Test Chicken'),
    );
    expect(rice).toMatchObject({ userHasIt: true, includedInOrder: false });
    expect(chicken).toMatchObject({ userHasIt: false, includedInOrder: true });
    expect(preview.totalPrice).toBe(300);
  });

  it('carries the same math through cart -> checkout -> order', async () => {
    const addRes = await request(API_URL)
      .post('/cart/meals')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ mealId })
      .expect(201);
    const cart = addRes.body as CartResponse;

    const cartMeal = cart.meals.find((m) => m.mealId === mealId);
    if (!cartMeal) throw new Error('meal was not added to cart');
    const riceCartIngredient = cartMeal.ingredients.find(
      (i) => i.ingredientId === riceId,
    );
    const chickenCartIngredient = cartMeal.ingredients.find(
      (i) => i.ingredientId === chickenId,
    );
    expect(riceCartIngredient?.isRemovedByUser).toBe(true);
    expect(chickenCartIngredient?.isRemovedByUser).toBe(false);
    expect(cart.totalPrice).toBe(300);

    const checkoutRes = await request(API_URL)
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);
    const order = checkoutRes.body as OrderWithItems;

    expect(order.totalPrice).toBe(300);
    expect(order.status).toBe('PENDING');
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({
      ingredientId: chickenId,
      quantity: 100,
    });
    const orderId = order.id;

    // Cart is cleared after checkout.
    const cartAfterRes = await request(API_URL)
      .get('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect((cartAfterRes.body as CartResponse).meals).toHaveLength(0);

    const listRes = await request(API_URL)
      .get('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    const orders = listRes.body as OrderWithItems[];
    expect(orders.some((o) => o.id === orderId)).toBe(true);

    const cancelRes = await request(API_URL)
      .patch(`/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect((cancelRes.body as OrderWithItems).status).toBe('CANCELLED');

    // A cancelled order can't be cancelled again.
    await request(API_URL)
      .patch(`/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(400);
  });

  it("rejects checking out someone else's cart items via another user's order id", async () => {
    const otherReg = await request(API_URL)
      .post('/auth/register')
      .send({ email: uniqueEmail('flow-other'), password: 'password123' })
      .expect(201);
    const otherToken = (otherReg.body as AuthResponse).accessToken;

    await request(API_URL)
      .post('/cart/meals')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ mealId })
      .expect(201);
    const checkoutRes = await request(API_URL)
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);
    const orderId = (checkoutRes.body as OrderWithItems).id;

    await request(API_URL)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });
});
