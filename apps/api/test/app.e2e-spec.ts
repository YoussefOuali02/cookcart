import request from 'supertest';
import { API_URL } from './utils/test-app';

describe('AppController (e2e)', () => {
  it('/ (GET)', () => {
    return request(API_URL)
      .get('/')
      .expect(200)
      .expect('CookCart API is running');
  });
});
