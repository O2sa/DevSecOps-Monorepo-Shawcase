import request from 'supertest';
import { app } from '../src/app';
import { generateAdminToken, generateTestToken, generateUserToken } from './test-utils';

describe('JWT Authentication Tests', () => {
  it('should accept valid user JWT', async () => {
    const token = generateUserToken(1, 'valid_user');
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should accept valid admin JWT', async () => {
    const token = generateAdminToken(2, 'valid_admin');
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should reject missing Authorization header with 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication required' });
  });

  it('should reject invalid token signature with 401', async () => {
    const tamperedToken = generateTestToken({
      userId: 1,
      secret: 'wrong-secret-key-different-from-configured',
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication required' });
  });

  it('should reject expired token with 401', async () => {
    const expiredToken = generateTestToken({
      userId: 1,
      expiresIn: '-1h',
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication required' });
  });

  it('should reject token without user_id claim with 401', async () => {
    const tokenWithoutUserId = generateTestToken({
      userId: undefined,
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenWithoutUserId}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication required' });
  });

  it('should reject token with zero or negative user_id with 401', async () => {
    const tokenZero = generateTestToken({ userId: 0 });
    const resZero = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenZero}`);
    expect(resZero.status).toBe(401);

    const tokenNegative = generateTestToken({ userId: -5 });
    const resNegative = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenNegative}`);
    expect(resNegative.status).toBe(401);
  });
});
