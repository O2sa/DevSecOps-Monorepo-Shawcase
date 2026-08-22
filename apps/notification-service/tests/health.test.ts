import request from 'supertest';
import { app } from '../src/app';

describe('Health Check Endpoints', () => {
  it('GET /health should return 200 OK with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET / root fallback should return 200 OK with status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
