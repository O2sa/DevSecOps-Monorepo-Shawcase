import request from 'supertest';
import { app } from '../src/app';

describe('CORS Configuration Tests', () => {
  it('should allow preflight OPTIONS request from http://localhost:3000', async () => {
    const res = await request(app)
      .options('/api/notifications')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-methods']).toContain('GET');
    expect(res.headers['access-control-allow-methods']).toContain('PATCH');
  });

  it('should allow preflight OPTIONS for mark-as-read PATCH endpoint', async () => {
    const res = await request(app)
      .options('/api/notifications/1/read')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'Authorization');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('should not allow unauthorized origin', async () => {
    const res = await request(app)
      .options('/api/notifications')
      .set('Origin', 'http://unauthorized-domain.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
